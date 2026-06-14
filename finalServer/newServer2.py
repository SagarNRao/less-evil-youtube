from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import sys
import os
import traceback  # For detailed error logging

# Your existing imports
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix

# Load and preprocess data
df = pd.read_csv('response_data.csv', encoding='latin1')

# Combine title and description into a single text feature
df['text'] = df['title'] + ' ' + df['description'].fillna('')
df['channel'] = 'channel_name' + df['channel_name'] + 'channel_id' + df['channel_id']
df['combined_features'] = (
    df['text'].fillna('') + ' ' +
    df['channel'].fillna('') + ' ' +
    df['tags'].fillna('') + ' ' +
    df['topic_categories'].fillna('')
)

# Split features and target
X = df['combined_features']
y = df['distracting']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)

print('Training set size:', len(X_train))
print('Testing set size:', len(X_test))

# Create and train pipeline
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=5000, 
                             stop_words='english',
                             ngram_range=(1, 2))),
    ('clf', RandomForestClassifier(n_estimators=100, 
                                  random_state=42))
])
pipeline.fit(X_train, y_train)

# Predict and evaluate
y_pred = pipeline.predict(X_test)
# print('Classification Report:')
# print(classification_report(y_test, y_pred))

def predict_distraction(title, description, tags=None, topic_categories=None):
    """Function to predict if a video is distracting based on its title, description, tags, and topic categories"""
    try:
        # Ensure inputs are valid
        title = title or ''
        description = description or ''
        tags = tags or []
        topic_categories = topic_categories or []

        # Validate input types
        if not isinstance(tags, list):
            tags = []
            print("Warning: 'tags' is not a list, defaulting to empty list")
        if not isinstance(topic_categories, list):
            topic_categories = []
            print("Warning: 'topic_categories' is not a list, defaulting to empty list")

        # Combine all features into a single text input
        text = (
            title + ' ' +
            description + ' ' +
            ' '.join(tags) + ' ' +
            ' '.join(topic_categories)
        )

        # Make predictions
        prediction = pipeline.predict([text])[0]
        probability = pipeline.predict_proba([text])[0]

        # Print results
        print(f'Title: {title}')
        print(f'Prediction: {"Not Distracting" if prediction == 0 else "Distracting"}')
        print(f'Confidence: {max(probability):.2%}')

        return int(prediction)
    except Exception as e:
        print(f"Error in prediction: {e}")
        traceback.print_exc()  # Print detailed stack trace for debugging
        return 0  # Default to "Not Distracting" when there's an error

# Flask setup
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

input_data = None
API_KEY = os.environ.get("YOUTUBE_API_KEY")

@app.route("/video_data", methods=["GET"])
def video_data():
    """Proxy endpoint for YouTube Data API — keeps the API key server-side."""
    import requests as http_requests

    video_id = request.args.get("videoId")
    if not video_id:
        return jsonify({"error": "Missing videoId parameter"}), 400

    if not API_KEY:
        return jsonify({"error": "YouTube API key not configured on server"}), 500

    yt_url = (
        f"https://youtube.googleapis.com/youtube/v3/videos"
        f"?part=topicDetails,snippet&id={video_id}&key={API_KEY}"
    )
    try:
        yt_response = http_requests.get(yt_url, timeout=10)
        yt_response.raise_for_status()
        data = yt_response.json()

        items = data.get("items", [])
        if not items:
            return jsonify({"tags": [], "topicCategories": [], "description": ""})

        video = items[0]
        return jsonify({
            "tags": video["snippet"].get("tags", []),
            "topicCategories": video.get("topicDetails", {}).get("topicCategories", []),
            "description": video["snippet"].get("description", ""),
        })
    except Exception as e:
        print(f"Error fetching YouTube data: {e}")
        traceback.print_exc()
        return jsonify({"error": "Failed to fetch video data"}), 500

@app.route("/search", methods=["POST"])
def review():
    global input_data
    try:
        # Get JSON data
        input_data = request.get_json()
        if not input_data:
            return jsonify({"error": "No JSON data provided"}), 400

        # Extract fields with defaults
        title = input_data.get('searchKey', '')
        description = input_data.get('description', '')
        tags = input_data.get('tags', [])
        topic_categories = input_data.get('topic_categories', [])

        print(f"Received title: {title}")

        # Call prediction function
        prediction = predict_distraction(title, description, tags, topic_categories)

        # Ensure prediction is valid
        if prediction is None:
            print("Error: Prediction returned None")
            return jsonify({"error": "Prediction failed"}), 500

        # Return response based on prediction
        return jsonify({"message": bool(prediction)})  # True if distracting (1), False if not (0)

    except Exception as e:
        print(f"Error processing request: {e}")
        traceback.print_exc()  # Print detailed stack trace for debugging
        return jsonify({"error": "Internal server error"}), 500

@app.route("/get_input_data", methods=["GET"])
def get_input_data():
    global input_data
    if input_data is not None:
        return jsonify(input_data)
    else:
        return jsonify({"message": "No data available"}), 404

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=False)