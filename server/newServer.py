import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Load and preprocess data
try:
    df = pd.read_csv('response_data.csv', encoding='latin1')
except FileNotFoundError:
    print("Error: response_data.csv not found")
    sys.exit(1)

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

# Create and train the pipeline
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=5000, 
                             stop_words='english',
                             ngram_range=(1, 2))),
    ('clf', RandomForestClassifier(n_estimators=100, 
                                  random_state=42))
])
pipeline.fit(X_train, y_train)

# Save the model
joblib.dump(pipeline, 'model.pkl')

def prediction(title, description, tags=None, topic_categories=None):
    """Function to predict if a video is distracting based on its title, description, tags, and topic categories"""
    # Combine all features into a single text input
    text = (
        (title or '') + ' ' +
        (description or '') + ' ' +
        (' '.join(tags) if tags else '') + ' ' +
        (' '.join(topic_categories) if topic_categories else '')
    )

    # Make predictions
    prediction = pipeline.predict([text])[0]
    probability = pipeline.predict_proba([text])[0]

    # Print results for debugging
    print(f'Title: {title}')
    print(f'Description: {description}')
    print(f'Tags: {tags}')
    print(f'Topic Categories: {topic_categories}')
    print(f'Prediction: {"Not Distracting" if prediction == 0 else "Distracting"}')
    print(f'Confidence: {max(probability):.2%}')

    return prediction, max(probability)

@app.route("/search", methods=["POST"])
def review():
    try:
        data = request.get_json()
        print("Received request:", data)
        title = data.get('searchKey', '')
        description = data.get('description', '')
        tags = data.get('tags', [])
        topic_categories = data.get('topic_categories', [])

        prediction, confidence = prediction(title, description, tags, topic_categories)
        return jsonify({"message": bool(prediction)})
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)