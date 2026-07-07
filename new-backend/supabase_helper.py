"""
Thin wrapper around the Supabase client for the "reported_videos" table.

Expected table schema (create this in the Supabase SQL editor):

    create table reported_videos (
        id                bigint generated always as identity primary key,
        video_id          text not null unique,
        title             text,
        description       text,
        tags              text,              -- space-joined, same shape as training data
        topic_categories  text,              -- space-joined
        channel_name      text,
        channel_id        text,
        distracting       int default 1,     -- reports are always "this IS distracting"
        reported_at       timestamptz default now(),
        included_in_model text               -- set to a model version/timestamp once retrained on
    );

Env vars required:
    SUPABASE_URL
    SUPABASE_SERVICE_KEY   (service role key — needed for server-side inserts/updates)
"""

from __future__ import annotations

import os
from supabase import Client, create_client
from features import listlike_to_str

from dotenv import load_dotenv
load_dotenv()

TABLE = "reported_videos"

_client: Client | None = None


def get_client() -> Client:
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_KEY")
        if not url or not key:
            raise RuntimeError(
                "SUPABASE_URL / SUPABASE_SERVICE_KEY are not set — can't talk to Supabase."
            )
        _client = create_client(url, key)
    return _client


def insert_report(
    video_id: str,
    title: str = "",
    description: str = "",
    tags=None,
    topic_categories=None,
    channel_name: str = "",
    channel_id: str = "",
) -> None:
    """
    Record a user report. Upserts on video_id so the same video being
    reported by multiple users doesn't create duplicate training rows.
    """
    client = get_client()
    row = {
        "video_id": video_id,
        "title": title or "",
        "description": description or "",
        "tags": listlike_to_str(tags),
        "topic_categories": listlike_to_str(topic_categories),
        "channel_name": channel_name or "",
        "channel_id": channel_id or "",
        "distracting": 1,
    }
    client.table(TABLE).upsert(row, on_conflict="video_id").execute()


def fetch_all_reports() -> list[dict]:
    """Every report ever collected — used for full monthly batch retraining."""
    client = get_client()
    result = client.table(TABLE).select("*").execute()
    return result.data or []


def mark_included_in_model(video_ids: list[str], model_version: str) -> None:
    """Audit trail: tag which reports were folded into a given model version."""
    if not video_ids:
        return
    client = get_client()
    client.table(TABLE).update({"included_in_model": model_version}).in_(
        "video_id", video_ids
    ).execute()
