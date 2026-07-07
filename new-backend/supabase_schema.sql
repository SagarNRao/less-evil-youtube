-- Run this once in the Supabase SQL editor.

create table if not exists reported_videos (
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

-- Optional: let anyone insert a report but not read/modify others' data,
-- if you end up calling Supabase directly from the client instead of via
-- the Flask /report endpoint. Not required for the current setup, since
-- the server uses the service-role key.
