from flask import Flask, request, jsonify
from flask_cors import CORS
import sys

app = Flask(__name__)
CORS(app)

input_data = None

@app.route("/model", methods=["POST"])
def review():
    global input_data
    input_data = request.get_json()
    # return jsonify({"message": True})
    return jsonify({"message": False})

    # True if distracting
    # False if not distracting

    # hardcoded for testing purposes will use an ML model

@app.route("/get_input_data", methods=["GET"])
def get_input_data():
    global input_data
    print("Data sent:", input_data)  # Debugging statement
    if input_data is not None:
        return jsonify(input_data)
    else:
        return jsonify({"message": "No data available"}), 404
    
    
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
