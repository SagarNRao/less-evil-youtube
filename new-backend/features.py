"""
Shared feature-engineering logic.

Both train_model.py (initial training) and retrain_model.py (monthly batch
retraining) build the exact same 'combined_features' text column so the
pipeline always sees data in the same shape. Keeping this in one place means
we can't accidentally let the two scripts drift apart.
"""

import pandas as pd


def build_combined_features(df: pd.DataFrame) -> pd.Series:
    """
    Turn a dataframe with title/description/channel_name/channel_id/tags/
    topic_categories columns into the single text column the TF-IDF
    vectorizer expects.
    """
    text = df["title"].fillna("") + " " + df["description"].fillna("")
    channel = (
        "channel_name" + df["channel_name"].fillna("")
        + "channel_id" + df["channel_id"].fillna("")
    )

    combined = (
        text.fillna("") + " " +
        channel.fillna("") + " " +
        df["tags"].fillna("") + " " +
        df["topic_categories"].fillna("")
    )
    return combined


def listlike_to_str(value) -> str:
    """Normalize a list (or already-a-string, or None) into a space-joined string."""
    if value is None:
        return ""
    if isinstance(value, (list, tuple)):
        return " ".join(str(v) for v in value)
    return str(value)
