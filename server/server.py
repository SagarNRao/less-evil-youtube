from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/model", methods=["POST"])
def review():
    data = request.get_json()
    # return jsonify({"message": True})
    return jsonify({"message":False})
    # hardcoded for testing purposes will use an ML model


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
