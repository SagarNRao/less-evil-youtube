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

### 3. Server-Side ML Inference Handsque
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