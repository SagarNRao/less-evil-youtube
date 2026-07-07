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
YouTube is a heavy Single Page Application (SPA) that dynamic loads content as you scroll or navigate. To capture these asynchronous shifts without blocking the main window thread, the extension initializes a `MutationObserver` targeting the recommendations container. 

The mutation loop immediately triggers whenever recommended video nodes are injected or updated in the DOM.

### 2. Parameter Extraction & Background Dispatch
For each detected video element, the content script parses the localized structural tree to isolate context metrics:
* Video Title
* Recommendation metadata tags
* Context descriptions

Once structured into a data payload, it uses Chrome’s runtime background service workers to send the parameters asynchronously to the backend classification endpoint, keeping your browser fast and responsive.

### 3. Machine Learning Classification Backend (`finalServer/newServer2.py`)
The backend features a trained text classifier optimized to evaluate the contextual relevance of recommendation paths. 
* Parses the text attributes of incoming video recommendation payloads.
* Processes them through an NLP text feature extraction pipeline.
* Employs a machine learning inference engine to score and output a binary prediction flag: `Distracting` or `Non-Distracting`.

### 4. Adaptive Interface Refactoring
If the backend classifies a video payload as high-entropy or distracting (e.g., viral entertainment, memes, or unrelated high-engagement content), a directive is sent back to the content script. The extension programmatically modifies the DOM, stripping the distraction out before it breaks user focus.

---

## 🔧 Technical Summary & Components
* **Frontend:** Vanilla JavaScript, Chrome Extension Architecture (Manifest V3), Content Scripts, Background Service Workers, MutationObservers.
* **Backend:** Python, Machine Learning Text Classification, NLP Feature Extraction Pipelines, Asynchronous Microservices.

---

## ⚠️ Maintenance Note
**Production Sync:** Platforms like YouTube continuously rollout micro-frontend mutations that alter structural class hashing and dynamic container layouts. This repository is currently undergoing routine element selector maintenance to match YouTube's newest DOM tracking updates. The primary asynchronous communication architecture, runtime message-passing layers, and server-side ML inference components remain fully scalable and operational.
