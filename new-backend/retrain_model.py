"""
Monthly batch retrain: base CSV + every user report collected in Supabase
so far -> new model.pkl.

This is meant to be run on a schedule (e.g. a Render Cron Job or GitHub
Actions workflow, once a month) — see README for how to wire that up.

It's also the thing to run live if someone asks "how does the retraining
work" — see seed_demo_reports.py for a way to populate Supabase with a
realistic batch of reports first so this has something to chew on.

Usage:
    python retrain_model.py
    python retrain_model.py --data response_data.csv --out model.pkl
"""

import argparse
import datetime as dt

import pandas as pd

from features import build_combined_features
from supabase_helper import fetch_all_reports, mark_included_in_model
from train_model import train


def reports_to_dataframe(reports: list[dict]) -> pd.DataFrame:
    if not reports:
        return pd.DataFrame(
            columns=["title", "description", "channel_name", "channel_id", "tags", "topic_categories", "distracting"]
        )

    df = pd.DataFrame(reports)
    keep_cols = ["title", "description", "channel_name", "channel_id", "tags", "topic_categories"]
    for col in keep_cols:
        if col not in df.columns:
            df[col] = ""
    df["distracting"] = 1
    return df[keep_cols + ["distracting"]]


def main():
    parser = argparse.ArgumentParser(description="Retrain the classifier on base data + user reports")
    parser.add_argument("--data", default="response_data.csv", help="Path to base training CSV")
    parser.add_argument("--out", default="model.pkl", help="Where to write the retrained model")
    args = parser.parse_args()

    base_df = pd.read_csv(args.data, encoding="latin1")

    reports = fetch_all_reports()
    print(f"Fetched {len(reports)} report(s) from Supabase.")
    reports_df = reports_to_dataframe(reports)

    combined_df = pd.concat([base_df, reports_df], ignore_index=True, sort=False)
    combined_df["combined_features"] = build_combined_features(combined_df)

    print(f"Base rows: {len(base_df)}  |  Report rows: {len(reports_df)}  |  Total: {len(combined_df)}")

    pipeline = train(combined_df)

    import joblib
    joblib.dump(pipeline, args.out)
    print(f"\nSaved retrained model to {args.out}")

    model_version = dt.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    video_ids = [r["video_id"] for r in reports if r.get("video_id")]
    mark_included_in_model(video_ids, model_version)
    print(f"Tagged {len(video_ids)} report(s) as included in model version {model_version}")


if __name__ == "__main__":
    main()
