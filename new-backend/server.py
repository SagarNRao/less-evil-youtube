"""
API server for the "less evil YouTube" extension.

Loads the pre-trained model.pkl (produced by train_model.py / retrain_model.py)
and serves three endpoints:

    GET  /video_data   proxy to the YouTube Data API (keeps the API key server-side)
    POST /search        predict whether a video is distracting
    POST /report         record a user's "this is distracting" report to Supabase

Run:
    python server.py

Env vars:
    YOUTUBE_API_KEY        required for /video_data
    SUPABASE_URL            required for /report
    SUPABASE_SERVICE_KEY   required for /report
    MODEL_PATH              optional, defaults to model.pkl
    PORT                     optional, defaults to 5000
"""

import os
import traceback

import joblib
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

from supabase_helper import insert_report

MODEL_PATH = os.environ.get("MODEL_PATH", "model.pkl")
YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"No model found at '{MODEL_PATH}'. Run `python train_model.py` first "
        "to produce it — the server only loads models, it doesn't train them."
    )

print(f"Loading model from {MODEL_PATH} ...")
model = joblib.load(MODEL_PATH)
print("Model loaded.")


def predict_distraction(title, description, tags=None, topic_categories=None):
    """Predict whether a video is distracting from its title/description/tags/topics."""
    title = title or ""
    description = description or ""
    tags = tags if isinstance(tags, list) else []
    topic_categories = topic_categories if isinstance(topic_categories, list) else []

    text = title + " " + description + " " + " ".join(tags) + " " + " ".join(topic_categories)

    prediction = model.predict([text])[0]
    probability = model.predict_proba([text])[0]

    app.logger.info(
        "predict title=%r -> %s (confidence %.2f%%)",
        title, "distracting" if prediction else "not distracting", max(probability) * 100,
    )
    return int(prediction)


@app.route("/video_data", methods=["GET"])
def video_data():
    """Proxy endpoint for the YouTube Data API — keeps the API key server-side."""
    video_id = request.args.get("videoId")
    if not video_id:
        return jsonify({"error": "Missing videoId parameter"}), 400

    if not YOUTUBE_API_KEY:
        return jsonify({"error": "YouTube API key not configured on server"}), 500

    yt_url = (
        "https://youtube.googleapis.com/youtube/v3/videos"
        f"?part=topicDetails,snippet&id={video_id}&key={YOUTUBE_API_KEY}"
    )
    try:
        yt_response = requests.get(yt_url, timeout=10)
        yt_response.raise_for_status()
        data = yt_response.json()

        items = data.get("items", [])
        if not items:
            return jsonify({"tags": [], "topicCategories": [], "description": ""})

        video = items[0]
        snippet = video.get("snippet", {})
        return jsonify({
            "tags": snippet.get("tags", []),
            "topicCategories": video.get("topicDetails", {}).get("topicCategories", []),
            "description": snippet.get("description", ""),
            "channelTitle": snippet.get("channelTitle", ""),
            "channelId": snippet.get("channelId", ""),
        })
    except Exception:
        app.logger.error("Error fetching YouTube data:\n%s", traceback.format_exc())
        return jsonify({"error": "Failed to fetch video data"}), 500


@app.route("/search", methods=["POST"])
def search():
    """Predict whether a video is distracting."""
    payload = request.get_json(silent=True)
    if not payload:
        return jsonify({"error": "No JSON data provided"}), 400

    title = payload.get("searchKey", "")
    description = payload.get("description", "")
    tags = payload.get("tags", [])
    topic_categories = payload.get("topic_categories", [])

    try:
        prediction = predict_distraction(title, description, tags, topic_categories)
        return jsonify({"message": bool(prediction)})
    except Exception:
        app.logger.error("Error during prediction:\n%s", traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500


@app.route("/report", methods=["POST"])
def report():
    """Record a user's report that a video is distracting, for the next retrain batch."""
    payload = request.get_json(silent=True)
    if not payload or not payload.get("videoId"):
        return jsonify({"error": "Missing videoId"}), 400

    try:
        insert_report(
            video_id=payload["videoId"],
            title=payload.get("title", ""),
            description=payload.get("description", ""),
            tags=payload.get("tags", []),
            topic_categories=payload.get("topic_categories", []),
            channel_name=payload.get("channel_name", ""),
            channel_id=payload.get("channel_id", ""),
        )
        return jsonify({"status": "ok"}), 201
    except Exception:
        app.logger.error("Error storing report:\n%s", traceback.format_exc())
        return jsonify({"error": "Failed to store report"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
