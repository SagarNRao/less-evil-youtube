// import axios from "axios";

// ---------------------------------------------------------------------------
// SEARCH ELEMENTS
// YouTube's current DOM (2025/2026):
//   - Search input:  input#search  (name="search_query", inside #search-input slot)
//   - Search button: button#search-icon-legacy  (inside ytd-searchbox)
// ---------------------------------------------------------------------------
const searchButton = document.querySelector(
  "ytd-searchbox button#search-icon-legacy, ytd-searchbox button[type='submit']"
);

const searchInput = document.querySelector(
  "input#search[name='search_query']"
);

let watchingShorts = 0;

function moddedSearch() {
  if (searchButton) {
    searchButton.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent default search

      searchKey = JSON.stringify({ searchKey: searchInput.value });
      console.log(searchKey);
      myCustomFunction();

      searchButton.click();
    });
  } else {
    console.error("YouTube search button not found.");
  }
}

async function distractionUIBlock() {
  if (watchingShorts === 1) {
    return;
  }

  console.log("Blocking distracting search");

  if (document.getElementById("distraction-overlay")) {
    console.log("Overlay already exists");
    return;
  }

  console.log("Undistracting");
  const overlay = document.createElement("div");
  document.body.appendChild(overlay);
  overlay.id = "distraction-overlay";

  overlay.style.position = "fixed";
  overlay.style.top = "56px"; // Leave space for the header
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "calc(100% - 56px)";
  overlay.style.backgroundColor = "rgb(0, 0, 0)";
  overlay.style.zIndex = "9999";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";

  const message = document.createElement("h1");
  message.textContent = "Get back to work";
  message.style.color = "white";
  message.style.fontFamily = "Geist, sans-serif";
  message.style.fontSize = "2rem";
  overlay.appendChild(message);
}

function removeDistractionUIBlock() {
  console.log("Removing distraction block");
  const overlay = document.getElementById("distraction-overlay");
  if (overlay) {
    overlay.remove();
  }
}

// ---------------------------------------------------------------------------
// VIDEO PLAYER DETECTION
// YouTube's current DOM: <video> is always a descendant of ytd-player.
// ---------------------------------------------------------------------------
function detectVideoPlayer() {
  const videoPlayer = document.querySelector("ytd-player video");

  if (videoPlayer) {
    console.log("Video player detected");
    console.log(window.location.href);
    if (window.location.href.includes("/shorts/")) {
      console.log("Shorts page detected");
      watchingShorts = 1;
      shortsPage();
    }
  } else {
    console.log("No video player detected");
    setTimeout(() => {
      detectVideoPlayer();
    }, 3000);
  }
}

// ---------------------------------------------------------------------------
// SIDEBAR DETECTION
//
// YouTube's 2025/2026 DOM for the watch-page sidebar:
//   ytd-watch-next-secondary-results-renderer
//     └─ ytd-compact-video-renderer   ← classic compact cards (still present)
//     └─ yt-lockup-view-model         ← newer card format
//
// Title / link selectors inside yt-lockup-view-model (new UI):
//   h3.yt-lockup-metadata-view-model__title > a
//   OR  a[class*="lockup"][class*="title"]
//
// Inside ytd-compact-video-renderer (classic):
//   a#video-title  (carries both title text and /watch?v= href)
//
// Broadest fallback: any <a href*="/watch?v="> inside the card.
// ---------------------------------------------------------------------------

/**
 * Extract { videoId, titleText, titleEl } from a sidebar card element.
 * Works for both yt-lockup-view-model and ytd-compact-video-renderer.
 */
function extractCardInfo(card) {
  // Helper: pull videoId from a URL string, returns null if not a watch link
  function getVideoId(href) {
    if (!href || !href.includes("/watch")) return null;
    try {
      return new URLSearchParams(new URL(href, location.origin).search).get("v");
    } catch (_) { return null; }
  }

  // Helper: does this element look like a real video title?
  // Rejects duration stamps ("1:43", "12:05"), empty strings, and very short
  // strings that are clearly not titles.
  function looksLikeTitle(text) {
    if (!text || text.length < 4) return false;
    // Duration pattern: optional hours, then mm:ss  e.g. "1:43" "1:02:45"
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(text.trim())) return false;
    return true;
  }

  // ── 1. yt-lockup-view-model (new UI) ──────────────────────────────────────
  // The title anchor sits in the metadata section, explicitly marked with
  // a class containing both "lockup" and "title" / "metadata".
  const lockupCandidates = [
    card.querySelector("h3.yt-lockup-metadata-view-model__title a"),
    card.querySelector("a.yt-lockup-metadata-view-model__title"),
    card.querySelector(".yt-lockup-metadata-view-model__title a"),
    // ── 2. ytd-compact-video-renderer (classic UI) ────────────────────────
    card.querySelector("a#video-title"),
    card.querySelector("#video-title"),
  ];

  let titleEl = null;
  let videoId = null;

  for (const el of lockupCandidates) {
    if (!el) continue;
    const id = getVideoId(el.href);
    if (!id) continue;
    const text =
      el.getAttribute("title") ||
      el.getAttribute("aria-label") ||
      el.textContent.trim();
    if (!looksLikeTitle(text)) continue;
    titleEl = el;
    videoId = id;
    break;
  }

  // ── 3. Broadest fallback: any watch-link whose visible text looks like a title
  if (!titleEl) {
    const allWatchLinks = card.querySelectorAll('a[href*="/watch?v="]');
    for (const el of allWatchLinks) {
      const id = getVideoId(el.href);
      if (!id) continue;
      const text =
        el.getAttribute("title") ||
        el.getAttribute("aria-label") ||
        el.textContent.trim();
      if (!looksLikeTitle(text)) continue;
      titleEl = el;
      videoId = id;
      break;
    }
  }

  if (!titleEl || !videoId) return null;

  const titleText =
    titleEl.getAttribute("title") ||
    titleEl.getAttribute("aria-label") ||
    titleEl.textContent.trim();

  console.log("[LE] extractCardInfo → id:", videoId, "title:", titleText);
  return { videoId, titleText, titleEl };
}

/**
 * Visually mark a sidebar card as distracting.
 * Overlays a warning banner over the thumbnail and colours the title red —
 * without removing the element so YouTube's own JS stays happy.
 */
function markCardDistracting(card, titleEl) {
  card.dataset.leProcessed = "distracting";

  // Warn the title
  titleEl.style.color = "#ff4444";
  titleEl.dataset.originalTitle = titleEl.dataset.originalTitle || titleEl.textContent.trim();
  titleEl.textContent = "\u26A0\uFE0F Distracting Content";

  // Dim the thumbnail
  const thumb =
    card.querySelector("a.yt-lockup-view-model__content-image") ||
    card.querySelector("a#thumbnail") ||
    card.querySelector("ytd-thumbnail");

  if (thumb && !thumb.querySelector(".le-distraction-badge")) {
    thumb.style.position = "relative";
    const badge = document.createElement("div");
    badge.className = "le-distraction-badge";
    badge.style.cssText = [
      "position:absolute",
      "inset:0",
      "background:rgba(0,0,0,0.55)",
      "display:flex",
      "align-items:center",
      "justify-content:center",
      "pointer-events:none",
      "z-index:10",
      "font-size:1.4rem",
    ].join(";");
    badge.textContent = "\u26A0\uFE0F";
    thumb.appendChild(badge);
  }
}

/**
 * Process one sidebar card: fetch video metadata → run model → mark if distracting.
 */
async function processSidebarCard(card) {
  // Skip if already handled in any state
  if (card.dataset.leProcessed) return;
  // Claim the card immediately to prevent double-processing from concurrent observer calls
  card.dataset.leProcessed = "pending";

  const info = extractCardInfo(card);
  if (!info) {
    card.dataset.leProcessed = "no-id";
    return;
  }

  const { videoId, titleText, titleEl } = info;
  console.log("[LE] Sidebar card →", videoId, titleText);

  const videoData = await YTApiCall(videoId);
  const { tags, topicCategories, description, channelTitle, channelId } = videoData;

  const isDistracting = await predict(titleText, description, tags, topicCategories);
  if (isDistracting === 1) {
    markCardDistracting(card, titleEl);
  } else {
    card.dataset.leProcessed = "ok";
  }

  // Let users flag videos the model missed (or confirm ones it caught).
  addReportButton(card, {
    videoId,
    title: titleText,
    description,
    tags,
    topicCategories,
    channelName: channelTitle,
    channelId,
  });
}

/**
 * Adds a small "report as distracting" flag to a sidebar card's thumbnail.
 * Reports feed into the monthly model retrain — see /report on the backend.
 */
function addReportButton(card, videoInfo) {
  const thumb =
    card.querySelector("a.yt-lockup-view-model__content-image") ||
    card.querySelector("a#thumbnail") ||
    card.querySelector("ytd-thumbnail");

  if (!thumb || thumb.querySelector(".le-report-button")) return;

  thumb.style.position = thumb.style.position || "relative";

  const button = document.createElement("button");
  button.className = "le-report-button";
  button.title = "Report as distracting";
  button.textContent = "\u{1F6A9}";
  button.style.cssText = [
    "position:absolute",
    "top:4px",
    "right:4px",
    "z-index:11",
    "border:none",
    "border-radius:4px",
    "background:rgba(0,0,0,0.6)",
    "color:white",
    "font-size:0.9rem",
    "line-height:1",
    "padding:3px 5px",
    "cursor:pointer",
  ].join(";");

  button.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    button.disabled = true;
    button.textContent = "...";
    const ok = await reportVideo(videoInfo);
    button.textContent = ok ? "\u2705" : "\u274C";
    setTimeout(() => {
      if (button.isConnected) button.textContent = "\u{1F6A9}";
      button.disabled = false;
    }, 2000);
  });

  thumb.appendChild(button);
}

/**
 * Sends a "this video is distracting" report to the backend, which stores
 * it in Supabase for the next batch retrain.
 */
async function reportVideo({ videoId, title, description, tags, topicCategories, channelName, channelId }) {
  try {
    const response = await axios.post(
      BACKEND_URL + "/report",
      {
        videoId,
        title,
        description,
        tags,
        topic_categories: topicCategories,
        channel_name: channelName,
        channel_id: channelId,
      },
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("[LE] Report submitted:", response.data);
    return true;
  } catch (error) {
    console.error("[LE] Failed to submit report:", error);
    return false;
  }
}

/**
 * Scan the sidebar for any unprocessed cards and kick off processSidebarCard()
 * for each one. Safe to call repeatedly — the leProcessed flag prevents re-entry.
 */
function scanSidebar() {
  const cards = document.querySelectorAll(
    // New card format
    "ytd-watch-next-secondary-results-renderer yt-lockup-view-model:not([data-le-processed])," +
    // Classic compact card format
    " ytd-watch-next-secondary-results-renderer ytd-compact-video-renderer:not([data-le-processed])"
  );

  if (cards.length === 0) return;
  console.log("[LE] Found " + cards.length + " unprocessed sidebar card(s)");

  for (const card of cards) {
    processSidebarCard(card); // async, but flag is set synchronously so no double-run
  }
}

/**
 * Attach a MutationObserver to the sidebar container so we catch cards that
 * YouTube lazy-loads as the user scrolls.
 */
function attachSidebarObserver() {
  const sidebar = document.querySelector("ytd-watch-next-secondary-results-renderer");
  if (!sidebar) return false;

  // Initial pass over cards already in the DOM
  scanSidebar();

  const sidebarMO = new MutationObserver(() => scanSidebar());
  sidebarMO.observe(sidebar, { childList: true, subtree: true });
  console.log("[LE] Sidebar observer attached");
  return true;
}

/**
 * Retry attaching the sidebar observer until the sidebar element appears.
 * YouTube renders the sidebar asynchronously after SPA navigation.
 */
function waitForSidebarAndAttach(attempts) {
  attempts = attempts || 0;
  if (attachSidebarObserver()) return;
  if (attempts > 30) {
    console.warn("[LE] Sidebar never appeared — giving up");
    return;
  }
  setTimeout(function() { waitForSidebarAndAttach(attempts + 1); }, 500);
}

function setupVideoDetection() {
  detectVideoPlayer();

  let lastUrl = window.location.href;

  // If the extension loads on a watch page, start looking for the sidebar immediately
  if (location.pathname === "/watch") {
    waitForSidebarAndAttach();
  }

  // Watch for YouTube SPA navigations
  const navObserver = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      detectVideoPlayer();

      if (location.pathname === "/watch") {
        // Clear stale processed flags from the previous page's cards
        document.querySelectorAll("[data-le-processed]").forEach(function(el) {
          delete el.dataset.leProcessed;
        });
        waitForSidebarAndAttach();
      }
    }
  });

  navObserver.observe(document.body, { subtree: true, childList: true });
}

const BACKEND_URL = "https://less-evil-youtube.onrender.com";

async function YTApiCall(videoID) {
  // YouTube API key is kept server-side; we proxy through our own backend.
  const url = BACKEND_URL + "/video_data?videoId=" + encodeURIComponent(videoID);

  try {
    const response = await axios.get(url);
    console.log("HERE", response.data);
    return {
      tags: response.data.tags || [],
      topicCategories: response.data.topicCategories || [],
      description: response.data.description || "",
    };
  } catch (error) {
    console.error("Error Here:", error);
    return {
      tags: [],
      topicCategories: [],
      description: "",
    };
  }
}

// Initial setup
setupVideoDetection();

async function predict(title, description, tags, topicCategories) {
  // Guard: already-marked cards won't have their original title here, skip them
  if (title === "\u26A0\uFE0F Distracting Content") {
    return 0;
  }

  try {
    const response = await axios.post(
      BACKEND_URL + "/search",
      {
        searchKey: title,
        description: description || "",
        tags: tags || [],
        topic_categories: topicCategories || [],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Success:", response.data);
    return response.data.message === true ? 1 : 0;
  } catch (error) {
    console.error("Error:", error);
    return 0;
  }
}

async function myCustomFunction() {
  console.log("Custom function executed before YouTube search.");
  if (searchInput) {
    const searchTerm = searchInput.value;
    console.log(searchTerm);

    try {
      const response = await axios.post(
        BACKEND_URL + "/search",
        {
          searchKey: searchTerm,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Success:", response.data);

      if (response.data.message === true) {
        console.log(searchTerm, " is distracting");
        searchedForDistracting = 1;
        distractionUIBlock();
      } else {
        searchedForDistracting = 0;
        removeDistractionUIBlock();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
}

// ---------------------------------------------------------------------------
// SHORTS POPUP
// ---------------------------------------------------------------------------
function showCustomPopup(shortsUrl) {
  const existingPopup = document.querySelector(".custom-shorts-popup");
  if (existingPopup) existingPopup.remove();

  const videoId = shortsUrl.match(/\/shorts\/([^?]+)/)?.[1];
  if (!videoId) return;

  const popup = document.createElement("div");
  popup.className = "custom-shorts-popup";
  popup.style.position = "fixed";
  popup.style.top = "0";
  popup.style.left = "0";
  popup.style.width = "100%";
  popup.style.height = "100%";
  popup.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  popup.style.display = "flex";
  popup.style.justifyContent = "center";
  popup.style.alignItems = "center";
  popup.style.zIndex = "10000";

  popup.innerHTML = `
    <div class="popup-content" id="modalForShorts">
      <h2>YouTube Short</h2>
      <div class="flex items-center gap-4">
        <div
          class="video-container"
          style="
            position: relative;
            width: 350px;
            height: 622px;
            margin: 0 auto;
          "
        >
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/${videoId}?autoplay=1"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            style="position: absolute; top: 0; left: 0"
          ></iframe>
        </div>
        <div />
      </div>
    </div>
  `;

  popup.addEventListener("click", (event) => {
    if (event.target === popup) {
      popup.remove();
    }
  });
  document.body.appendChild(popup);
}

// ---------------------------------------------------------------------------
// SHORTS CLICK INTERCEPTION
// ---------------------------------------------------------------------------
function interceptShorts() {
  document.addEventListener(
    "click",
    (event) => {
      const shortsLink = event.target.closest('a[href*="/shorts/"]');
      if (shortsLink) {
        event.preventDefault();
        event.stopPropagation();
        showCustomPopup(shortsLink.href);
      }
    },
    true
  );
}

document.addEventListener("DOMContentLoaded", interceptShorts);

const observer = new MutationObserver(() => {
  interceptShorts();
});
observer.observe(document.body, { childList: true, subtree: true });

// ---------------------------------------------------------------------------
// SHORTS PAGE — limit to single short
// ---------------------------------------------------------------------------
function shortsPage() {
  console.log(window.location.href);
  const shortsUrl = window.location.href;

  if (shortsUrl.includes("/shorts/")) {
    watchingShorts = 1;
    console.log("Shorts page detected");

    const removeOtherShorts = () => {
      const shorts = document.querySelectorAll(
        "ytd-shorts #shorts-inner-container > div, " +
        "ytd-reel-video-renderer"
      );

      shorts.forEach((short, i) => {
        if (i !== 0) {
          short.remove();
        }
      });
    };

    removeOtherShorts();

    const shortsObserver = new MutationObserver(removeOtherShorts);
    shortsObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}

// ---------------------------------------------------------------------------
// URL CHANGE OBSERVER — watch for navigation to /shorts
// ---------------------------------------------------------------------------
let lastUrl = window.location.href;
const shortsObserver = new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    if (window.location.href.includes("/shorts")) {
      console.log("OBSERVER ", window.location.href);
      shortsPage();
    }
  }
});

shortsObserver.observe(document.body, {
  subtree: true,
  childList: true,
});

moddedSearch();