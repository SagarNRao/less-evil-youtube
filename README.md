# Less Evil YouTube – ML-Powered Real-Time Distraction Filter

**Less Evil YouTube** is a Chrome browser extension that uses lightweight machine learning to detect and suppress distracting elements on YouTube pages **in real time** — so you can watch what you intended without getting pulled into endless recommendations, sensational thumbnails, or clickbait sidebars.

Unlike rule-based extensions (hide sidebar, remove end screens, etc.), this one applies a small ML classifier to evaluate visible elements dynamically:
- Thumbnails & titles → distracting vs relevant
- Sidebar suggestions, comments previews, related videos → hide or blur if they score high on "distraction"

Goal: make YouTube **less evil** at hijacking attention, while still letting you use the platform normally.

## Current State (Early Prototype)

- **ML model**: Trained in a Jupyter notebook using scikit-learn (e.g. Random Forest, Logistic Regression, or small classifier) for fast inference
- **Data**: Collected myself via **web scraping** from YouTube pages (titles, thumbnail descriptions/alt text, view counts, channel info, sidebar items, comment snippets, etc.) + manual labeling of distracting vs non-distracting content
- **Extension**: Core logic in `content.js`:
  - Uses MutationObserver to watch for DOM changes on youtube.com
  - Extracts simple features from new/updated elements
  - Runs client-side inference to classify & hide/blur distracting parts on the fly
- No popup UI, options page, or advanced settings yet — minimal viable content script
- Video demo coming soon (showing live filtering as you browse/scroll YouTube)

## Why ML Instead of Rules?

YouTube's UI and content tricks evolve constantly — new thumbnail styles, title patterns, recommendation formats.  
A small ML model can adapt to learned patterns like:
- Sensational/emotional wording
- High-engagement bait channels
- Visual/text features that correlate with distraction

Everything runs locally in the browser — no server calls, no tracking, full privacy.

## Files in This Repo

- `*.ipynb`          → Web scraping code, data cleaning, feature engineering, model training, evaluation, and example predictions
- `content.js`       → Chrome content script (injected into YouTube pages)
- `manifest.json`    → Basic Manifest V3 file to register the content script
- (future) Model file (e.g. pickled scikit-learn → eventually converted to TensorFlow.js / ONNX for smoother browser use)

## How to Install & Test (Developer Mode)

1. Clone the repo
   ```bash
   git clone https://github.com/YOUR-USERNAME/less-evil-youtube.git