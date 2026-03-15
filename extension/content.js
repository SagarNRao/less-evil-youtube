// import axios from "axios";

// ---------------------------------------------------------------------------
// SEARCH ELEMENTS
// YouTube's current DOM (2025):
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
// Using a stable querySelector instead of a brittle absolute XPath.
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
// YouTube's current DOM: ytd-watch-next-secondary-results-renderer contains
// the sidebar. The inner list lives in #items or div[id='items'] inside it.
// Video cards use yt-lockup-view-model (still current as of 2025).
// ---------------------------------------------------------------------------
function setupVideoDetection() {
  detectVideoPlayer();

  let lastUrl = window.location.href;

  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      detectVideoPlayer();

      setTimeout(async () => {
        // Stable selector: the secondary results renderer holds the sidebar
        const sideBar = document.querySelector(
          "ytd-watch-next-secondary-results-renderer #items, " +
          "ytd-watch-next-secondary-results-renderer div#items"
        );

        if (sideBar) {
          console.log("Sidebar found");

          // yt-lockup-view-model is still the current card element (2025)
          const videos = sideBar.querySelectorAll("yt-lockup-view-model");

          if (!videos || videos.length === 0) {
            console.log("No videos found in sidebar");
            return;
          }

          for (const video of videos) {
            // Title anchor — same selector as before, still valid
            const titleElement = video.querySelector(
              "a.yt-lockup-metadata-view-model__title, h3 a"
            );
            const thumbnailLink = video.querySelector(
              "a.yt-lockup-view-model__content-image"
            );

            if (titleElement && thumbnailLink) {
              const titleText =
                titleElement.getAttribute("title") ||
                titleElement.textContent.trim();
              const link = thumbnailLink.href;

              console.log("Title:", titleText);
              console.log("Link:", link);

              const videoId = new URLSearchParams(new URL(link).search).get("v");
              if (!videoId) continue;

              const videoData = await YTApiCall(videoId);
              console.log(videoId);
              const tags = videoData.tags;
              const topicCategories = videoData.topicCategories;
              const description = videoData.description;

              console.log("Tags:", tags);
              console.log("Topic Categories:", topicCategories);

              if (
                (await predict(titleText, description, tags, topicCategories)) === 1
              ) {
                titleElement.style.color = "red";
                titleElement.textContent = "⚠️ Distracting Content";
              }
            } else {
              console.log("Title element not found for a video in sidebar");
            }
          }

          lockSidebar(sideBar);
        } else {
          console.log("Sidebar not found");
        }
      }, 5000);
    }
  });

  observer.observe(document.body, {
    subtree: true,
    childList: true,
  });
}

function lockSidebar(sideBar) {
  console.log("Locking sidebar to prevent reloading new videos");

  const initialVideoCount = sideBar.querySelectorAll(
    "yt-lockup-view-model, ytd-compact-video-renderer"
  ).length;

  // Remove newly added video nodes
  const sidebarObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches("ytd-compact-video-renderer") ||
              node.matches("yt-lockup-view-model"))
          ) {
            console.log("Prevented new video from being added to sidebar");
            node.remove();
          }
        });
      }
    }
  });

  sidebarObserver.observe(sideBar, {
    childList: true,
    subtree: true,
  });

  // Block scroll-triggered lazy loading
  sideBar.addEventListener(
    "scroll",
    (event) => {
      event.stopPropagation();
      console.log("Blocked sidebar scroll event");
    },
    { passive: false }
  );

  // Periodic cleanup of any excess videos that slip through
  const checkForNewContent = () => {
    const newVideos = sideBar.querySelectorAll(
      "yt-lockup-view-model, ytd-compact-video-renderer"
    );
    if (newVideos.length > initialVideoCount) {
      console.log("Detected new videos; removing excess");
      Array.from(newVideos)
        .slice(initialVideoCount)
        .forEach((video) => video.remove());
    }
  };

  setInterval(checkForNewContent, 1000);
}

const API_KEY = "AIzaSyCmhLp--zBH_ZIwfCKx8prox4qAyfc_Y8U";

async function YTApiCall(videoID) {
  const url = `https://youtube.googleapis.com/youtube/v3/videos?part=topicDetails,snippet&id=${videoID}&key=${API_KEY}`;

  try {
    const response = await axios.get(url);
    const video = response.data.items[0];
    console.log("HERE", response.data);
    return {
      tags: video.snippet.tags || [],
      topicCategories: video.topicDetails?.topicCategories || [],
      description: video.snippet.description || "",
    };
  } catch (error) {
    console.error("Error Here:", error);
    return {
      tags: [],
      topicCategories: [],
    };
  }
}

// Initial setup
setupVideoDetection();

async function predict(title, description, tags, topicCategories) {
  const input = title + " " + description;
  let distracting = 0;

  if (title === "⚠️ Distracting Content") {
    distracting = 0;
    return distracting;
  }

  try {
    const response = await axios.post(
      "https://less-evil-youtube.onrender.com/search",
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

    if (response.data.message == true) {
      console.log(input, "is distracting");
      distracting = 1;
    } else {
      distracting = 0;
    }
  } catch (error) {
    console.error("Error:", error);
  }

  return distracting;
}

async function myCustomFunction() {
  console.log("Custom function executed before YouTube search.");
  if (searchInput) {
    const searchTerm = searchInput.value;
    console.log(searchTerm);

    try {
      const response = await axios.post(
        "https://less-evil-youtube.onrender.com/search",
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

      if (response.data.message == true) {
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
// YouTube's current Shorts DOM: ytd-shorts > div#shorts-inner-container > div
// The old absolute XPath broke; use a stable querySelector instead.
// ---------------------------------------------------------------------------
function shortsPage() {
  console.log(window.location.href);
  const shortsUrl = window.location.href;

  if (shortsUrl.includes("/shorts/")) {
    watchingShorts = 1;
    console.log("Shorts page detected");

    const removeOtherShorts = () => {
      // Current selector for individual short containers inside the reel
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