"""
Trains the distraction classifier from response_data.csv and writes model.pkl.

Run this manually (or via retrain_model.py for the monthly batch job) —
the Flask server never trains anything itself, it just loads the file
this script produces.

Usage:
    python train_model.py
    python train_model.py --data response_data.csv --out model.pkl
"""

import argparse

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from features import build_combined_features


def load_dataset(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path, encoding="latin1")
    df["combined_features"] = build_combined_features(df)
    return df


def train(df: pd.DataFrame) -> Pipeline:
    X = df["combined_features"]
    y = df["distracting"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"Training set size: {len(X_train)}")
    print(f"Testing set size:  {len(X_test)}")

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(max_features=5000, stop_words="english", ngram_range=(1, 2))),
        ("clf", RandomForestClassifier(n_estimators=100, random_state=42)),
    ])
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    return pipeline


def main():
    parser = argparse.ArgumentParser(description="Train the YouTube distraction classifier")
    parser.add_argument("--data", default="response_data.csv", help="Path to training CSV")
    parser.add_argument("--out", default="model.pkl", help="Where to write the trained model")
    args = parser.parse_args()

    df = load_dataset(args.data)
    pipeline = train(df)

    joblib.dump(pipeline, args.out)
    print(f"\nSaved model to {args.out}")


if __name__ == "__main__":
    main()
