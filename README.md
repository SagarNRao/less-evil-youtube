# YouTube Distraction Filter: Machine Learning for Real-Time Video Filtering

A client-side Chrome extension paired with a machine learning backend designed to eliminate engagement-baiting distractions from the native YouTube interface, keeping your learning and research flows focused.

---

## 🎥 Project Walkthrough

Watch the feature demonstration and execution loop play directly inside GitHub:

https://github.com/user-attachments/assets/374c8651-2a15-4bcd-90a5-41f39fdb89a5

<video src="./SideBar.mp4" controls width="100%">
  Your browser does not support the video tag.
</video>

### ⏱️ Technical Milestones in the Video:
* **0:00 - 0:15:** Content script injection and real-time element mutation tracking.
* **0:15 - 0:35:** Multi-parameter metadata extraction and asynchronous background server handshake.
* **0:35 - 0:45:** Real-time machine learning prediction rendering and automated DOM removal.

---

## 🚀 How It Works (The Engineering Pipeline)

### 1. Client-Side DOM Mutation Tracking (`extension/content.js`)
YouTube is a heavy Single Page Application (SPA) that dynamically loads content as you scroll or navigate. To capture these asynchronous shifts without blocking the main window thread, the extension initializes a `MutationObserver` targeting the recommendations container.

The mutation loop immediately triggers whenever recommended video nodes are injected or updated in the DOM.

### 2. Multi-Parameter Feature Extraction
Once a video card is registered, the client-side content script harvests its critical metadata elements, packaging the video's Title, Description, Channel Metadata, Tags, and Topic Categories into a clean JSON payload.

### 3. Server-Side ML Inference Handshake
The payload is dispatched asynchronously via a Flask microservice endpoint. The server exposes a pre-trained Random Forest text classifier optimized to evaluate the contextual relevance of recommendation paths.
* Parses the text attributes of incoming video recommendation payloads.
* Processes them through an NLP text feature extraction pipeline.
* Employs a machine learning inference engine to score and output a binary prediction flag: `Distracting` or `Non-Distracting`.

### 4. Adaptive Interface Refactoring & Active Feedback
If the backend classifies a video payload as high-entropy or distracting (e.g., viral entertainment, memes, or unrelated high-engagement content), a directive is sent back to the content script. The extension programmatically modifies the DOM, stripping the distraction out before it breaks user focus.

Additionally, the interface exposes an action shortcut allowing users to manually flag misclassified items, streaming live real-time signals back to the database.

---

## 🔄 Active Learning & Continuous MLOps Pipeline

To handle concept drift and eliminate the static limitations of a fixed dataset, this system features a decoupled **Active Learning loop**. When users flag a video as a distraction from the browser UI, text features are immediately streamed via a Flask API into a remote PostgreSQL storage layer to dynamically update model weights over time.

### 🏗️ Pipeline Architecture

```
[Browser Extension UI] ──(User Flag)──> [Flask API Endpoint]
                                              │
                                        (Stream Data)
                                              ▼
                                     [Supabase PostgreSQL]
                                              │
                                        (Batch Trigger)
                                              ▼
                                      [retrain_model.py]
                                              │
                                        (Re-fit Pipeline)
                                              ▼
                                      [Updated model.pkl]
```

### 🗄️ Database Schema (`reported_videos`)
User flags are captured asynchronously and deduplicated on the `video_id` key using an upsert constraint to protect the database against malicious spam or repetitive submissions.

```sql
create table reported_videos (
    id                bigint generated always as identity primary key,
    video_id          text not null unique,
    title             text,
    description       text,
    tags              text,              -- Space-joined NLP features
    topic_categories  text,
    channel_name      text,
    channel_id        text,
    distracting       int default 1,
    reported_at       timestamptz default now(),
    included_in_model text               -- Audit trail for model lineage
);
```

### 🛠️ Simulating & Testing the Retraining Loop

The repository includes automated benchmarking and data-seeding utilities to test the full MLOps lifecycle instantly, ensuring the pipeline can be completely verified end-to-end.

#### 1. Provision the Environment

Configure your credentials inside your local `.env` configuration file:

```bash
SUPABASE_URL="your-supabase-project-url"
SUPABASE_SERVICE_KEY="your-service-role-key"
```

#### 2. Seed Mock Crowdsourced Data

Execute the seeding utility to simulate an accumulation of high-velocity user labels (e.g., lifestyle logs, viral challenges, unboxing clickbait) bypassing the browser interface:

```bash
python seed_demo_reports.py
```

#### 3. Trigger Batch Retraining

Run the training orchestration layer. This script reads the base `response_data.csv` corpus, blends it with the newly injected crowdsourced data rows pulled directly from Supabase, updates feature weights, and outputs an optimized production artifact:

```bash
python retrain_model.py --data response_data.csv --out model.pkl
```

*The architecture automatically logs an audit trail tracking which specific rows were baked into the current iteration of the classifier, ensuring full lineage and data reproducibility.*

---

## 🔧 Technical Summary & Components

* **Frontend:** Vanilla JavaScript, Chrome Extension Architecture (Manifest V3), Content Scripts, Background Service Workers, MutationObservers.
* **Backend:** Python, Flask, Machine Learning Text Classification, NLP Feature Extraction Pipelines, Asynchronous Microservices.
* **Storage & MLOps:** Supabase (PostgreSQL), Advanced Python Scheduler (APScheduler), Vector Seeding Pipelines.