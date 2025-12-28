# Less Evil YouTubeThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



A Chrome extension that filters distracting YouTube content using machine learning classification.## Getting Started



## OverviewFirst, run the development server:



**Less Evil YouTube** helps you stay focused by identifying and blocking distracting YouTube videos. The extension uses a trained ML classifier to flag content that's likely to distract from productive work.```bash

npm run dev

### Features# or

yarn dev

- **Real-time video classification** – Analyzes video titles, descriptions, tags, and topic categories# or

- **Search filtering** – Blocks distracting search results on YouTubepnpm dev

- **Sidebar content control** – Prevents recommended distracting videos from loading# or

- **Shorts blocker** – Intercepts and limits YouTube Shorts viewingbun dev

- **Cross-browser compatible** – Works on Chrome, Edge, Brave, and Firefox (with caveats)```



## ArchitectureOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.



### Extension (`extension/`)You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.



A Manifest V3 Chrome extension that:This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

- Injects a content script into YouTube

- Intercepts video metadata using the YouTube API## Learn More

- Sends data to the ML classifier backend for predictions

- Displays warnings and blocks content based on predictionsTo learn more about Next.js, take a look at the following resources:



### Backend (`server/newServer2.py`)- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

A Flask server running a scikit-learn RandomForest classifier that:

- **Model:** TF-IDF + Random Forest (100 estimators)You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

- **Input:** Combined text features (title, description, tags, topic categories, channel info)

- **Output:** Boolean prediction (1 = distracting, 0 = not distracting)## Deploy on Vercel

- **Endpoint:** `POST /search` – Accepts JSON with video metadata and returns classification

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

## Setup

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Extension Installation

1. Clone the repository
2. Open `chrome://extensions` (Chrome/Edge)
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `extension/` folder

### Server Setup

1. Install dependencies:
   ```bash
   pip install -r server/requirements.txt
   ```

2. Run the server:
   ```bash
   cd server
   python newServer2.py
   ```

3. Server runs on `http://localhost:5000` (or configure `less-evil-youtube.onrender.com` for production)

## Training Data

The classifier was trained on labeled YouTube video metadata:
- **Training set:** Videos categorized as "distracting" (memes, gaming, anime, etc.) vs. "non-distracting" (educational, technical, etc.)
- **Data location:** `server/data/` (combined CSV with ~27 categories)

## Browser Support

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome | ✅ Fully supported | Manifest V3 content scripts |
| Edge | ✅ Fully supported | Chromium-based |
| Firefox | ⚠️ Partial | Test with target version; module-type content scripts may vary |
| Safari | ❌ Not supported | Requires Safari Web Extension conversion |

## API Reference

### `/search` (POST)

**Request:**
```json
{
  "searchKey": "video title",
  "description": "video description",
  "tags": ["tag1", "tag2"],
  "topic_categories": ["category1"]
}
```

**Response:**
```json
{
  "message": true
}
```

## Project Structure

```
less-evil-youtube/
├── extension/          # Chrome extension (MV3)
│   ├── manifest.json
│   ├── content.js      # Content script
│   ├── styles.css
│   └── package.json
├── server/
│   ├── newServer2.py   # Main Flask server with ML classifier
│   ├── requirements.txt
│   └── data/           # Training datasets
└── README.md
```

## Notes

- The web app frontend (Next.js) was an early experiment and has been scrapped. The project now focuses on the extension + backend ML classifier.
- YouTube API key is embedded in `extension/content.js` (consider moving to environment variables for production).
- CORS is enabled on the backend to allow requests from youtube.com origins.
