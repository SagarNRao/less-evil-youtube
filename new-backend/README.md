# Less Evil YouTube — backend

## What changed from the old `newServer2.py`

- **The server no longer trains a model on startup.** Training moved to
  `train_model.py`, a standalone script you run once (and again for
  retraining). `server.py` just does `joblib.load(model.pkl)` and serves
  requests — starts in a second instead of retraining a random forest
  every time Render restarts the dyno.
- **User reports.** People can flag a video as distracting from the
  extension itself; reports are stored in Supabase and folded into the
  model on the next retrain.
- Dropped the `/get_input_data` debug endpoint (it held request state in
  a global variable — not something to ship) and the duplicated
  `import pandas as pd` / stray `sys` import.
- `/video_data` and `/search` are otherwise the same behavior you had,
  just cleaned up and with real error responses.

## Files

| File | Purpose |
|---|---|
| `server.py` | Flask app. Loads `model.pkl`, serves `/video_data`, `/search`, `/report`. |
| `train_model.py` | Trains the pipeline from `response_data.csv`, writes `model.pkl`. |
| `retrain_model.py` | Monthly batch job: base CSV + everything in Supabase → new `model.pkl`. |
| `features.py` | Shared feature-building code so train/retrain never drift apart. |
| `supabase_helper.py` | Supabase client wrapper (insert/fetch reports). |
| `seed_demo_reports.py` | Populates Supabase with a fake "month's worth" of reports for demos. |
| `supabase_schema.sql` | Table definition — run once in the Supabase SQL editor. |
| `content.js` | Extension content script, now with a 🚩 report button on each sidebar card. |

## One-time setup

1. Run `supabase_schema.sql` in your Supabase project's SQL editor.
2. Copy `.env.example` to `.env` and fill in `YOUTUBE_API_KEY`,
   `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`.
3. `pip install -r requirements.txt`
4. Put `response_data.csv` next to these scripts, then:
   ```
   python train_model.py
   ```
   This produces `model.pkl`.
5. `python server.py` — starts instantly since it's just loading the file
   from step 4.

## How reporting → retraining works

1. In `content.js`, each sidebar card gets a 🚩 button. Clicking it POSTs
   the video's id/title/description/tags/topics to `/report`.
2. `server.py`'s `/report` handler writes that into Supabase's
   `reported_videos` table via `supabase_helper.insert_report` (upserted
   on `video_id`, so re-reporting the same video doesn't create dupes).
3. Once a month (see "scheduling" below), `retrain_model.py` runs:
   pulls `response_data.csv` **plus every row in `reported_videos`**,
   rebuilds `combined_features` the same way `train_model.py` does, and
   retrains from scratch. It overwrites `model.pkl` and tags the reports
   it used with a model version, so you can see which reports fed which
   model.
4. Restart (or redeploy) the server so it picks up the new `model.pkl`.

### Scheduling the monthly retrain

`retrain_model.py` is just a script — point a scheduler at it:
- **Render**: add a [Cron Job](https://render.com/docs/cronjobs) that runs
  `python retrain_model.py` once a month, on the same repo/environment as
  the web service (needs `response_data.csv` and the same env vars).
- **GitHub Actions**: a scheduled workflow (`on: schedule`) that checks
  out the repo, installs requirements, runs the script, and commits/
  uploads the new `model.pkl` (or pushes it somewhere the server pulls
  from on restart).

Either way, the actual retraining logic doesn't care who calls it — it's
decoupled from the schedule on purpose (see below).

## Demoing the retrain without waiting a month

Since real reports take a month to accumulate, `seed_demo_reports.py`
inserts a batch of realistic-looking clickbait-style reports into
Supabase so you have something to retrain on immediately:

```
python seed_demo_reports.py
python retrain_model.py
```

The first command simulates "a month of user reports arriving."
The second is the *exact same script* that runs on the real monthly
schedule — nothing about the retrain logic is faked, only the data feeding
it is synthetic. That's the honest way to show someone the pipeline works:
you're not faking the retrain, you're fast-forwarding the input.

Re-running `seed_demo_reports.py` is safe — it upserts on `video_id`, so
it won't pile up duplicate rows if you demo this more than once.
