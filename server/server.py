from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import sys
import os


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}) 

input_data = None



def predict_distraction(title, description=None):
    text = title + ' ' + (description or '')
    prediction = model.predict([text])[0]
    probability = model.predict_proba([text])[0]
    
    print(f'Title: {title}')
    print(f'Prediction: {"Not Distracting" if prediction == 1 else "Distracting"}')
    print(f'Confidence: {max(probability):.2%}')
    
    # Convert to native Python types
    prediction = int(prediction)
    confidence = float(max(probability))
    
    return prediction, confidence


model = joblib.load('server/model.pkl')


@app.route("/search", methods=["POST"])
def review():
    global input_data
    input_data = request.get_json()
    title = input_data.get('searchKey')
    # description = input_data.get('videoID')
    
    print(title)

    prediction, confidence = predict_distraction(title)

    if prediction == 0:
        return jsonify({"message": True}) # if distracting
    else:
        return jsonify({"message": False}) # if not distracting



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
