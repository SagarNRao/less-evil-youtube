// import axios from "axios";

const searchButton = document.evaluate(
  "/html/body/ytd-app/div[1]/div[2]/ytd-masthead/div[4]/div[2]/yt-searchbox/button",
  document,
  null,
  XPathResult.FIRST_ORDERED_NODE_TYPE,
  null
).singleNodeValue;

const searchInput = document.evaluate(
  "/html/body/ytd-app/div[1]/div[2]/ytd-masthead/div[4]/div[2]/yt-searchbox/div[1]/form/input",
  document,
  null,
  XPathResult.FIRST_ORDERED_NODE_TYPE,
  null
).singleNodeValue;

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
  // overlay.classList.add("overlay");
  document.body.appendChild(overlay);
  overlay.id = "distraction-overlay";

  overlay.style.position = "fixed";
  overlay.style.top = "56px"; // Leave space for the header
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "calc(100% - 56px)"; // Adjust height to account for header
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

  // Log the image URL to verify it's correct
  console.log("Image URL:", image.src);
}

function removeDistractionUIBlock() {
  console.log("Removing distraction block");
  const overlay = document.getElementById("distraction-overlay");
  if (overlay) {
    overlay.remove();
  }
}

function detectVideoPlayer() {
  const videoPlayer = document.evaluate(
    "/html/body/ytd-app/div[1]/ytd-page-manager/ytd-watch-flexy/div[4]/div[1]/div/div[1]/div[2]/div/div[2]/ytd-player/div/div/div[1]/video",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  if (videoPlayer) {
    console.log("Video player detected");
    console.log(window.location.href);
    if (window.location.href.includes("/shorts/")) {
      console.log("Shorts page detected");
      watchingShorts = 1;
      shortsPage();
    }
    // setWatchingIndividualVideo("watchingVideo", 1);
  } else {
    console.log("No video player detected");
    setTimeout(() => {
      detectVideoPlayer();
    }, 3000);
    // setWatchingIndividualVideo("watchingVideo", 0);
  }
}

function setupVideoDetection() {
  // FOR SIDEBAR
  detectVideoPlayer();

  const observer = new MutationObserver((mutations) => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      detectVideoPlayer();

      setTimeout(async () => {
        const sideBar = document.evaluate(
          "/html/body/ytd-app/div[1]/ytd-page-manager/ytd-watch-flexy/div[4]/div[2]/div/div[5]/ytd-watch-next-secondary-results-renderer/div[2]",
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;

        if (sideBar) {
          console.log("Sidebar found");
          // Process initial videos in the sidebar
          // Updated selector for current YouTube sidebar (regular videos)
          const videos = sideBar.querySelectorAll(
            "yt-lockup-view-model[lockup]"
          );

          if (!videos || videos.length === 0) {
            console.log("No videos found in sidebar");
            return;
          }

          for (const video of videos) {
            // Updated: title is inside an <a> with title attribute or text content
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

              const videoId = new URLSearchParams(new URL(link).search).get(
                "v"
              );
              if (!videoId) continue;

              const videoData = await YTApiCall(videoId);
              console.log(videoId);
              const tags = videoData.tags;
              const topicCategories = videoData.topicCategories;
              const description = videoData.description;

              console.log("Tags:", tags);
              console.log("Topic Categories:", topicCategories);

              if (
                (await predict(
                  titleText,
                  description,
                  tags,
                  topicCategories
                )) === 1
              ) {
                titleElement.style.color = "red";
                titleElement.textContent = "⚠️ Distracting Content";
              }
            } else {
              console.log("Title element not found for a video in sidebar");
            }
          }

          // Prevent sidebar from loading new videos
          lockSidebar(sideBar);
        } else {
          console.log("Sidebar not found553");
        }
      }, 5000);
    }
  });

  let lastUrl = window.location.href;

  observer.observe(document.body, {
    subtree: true,
    childList: true,
  });
}

function lockSidebar(sideBar) {
  console.log("Locking sidebar to prevent reloading new videos");

  // Option 1: Disconnect the sidebar's dynamic loading by removing new nodes
  const sidebarObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (
            node.nodeType === Node.ELEMENT_NODE &&
            node.matches("ytd-compact-video-renderer")
          ) {
            console.log("Prevented new video from being added to sidebar");
            node.remove(); // Remove newly added video elements
          }
        });
      }
    }
  });

  sidebarObserver.observe(sideBar, {
    childList: true,
    subtree: true,
  });

  // Option 2: Disable infinite scroll by preventing scroll events from triggering new content
  sideBar.addEventListener(
    "scroll",
    (event) => {
      event.stopPropagation(); // Prevent scroll events from bubbling up
      console.log("Blocked sidebar scroll event");
    },
    { passive: false }
  );

  // Option 3: Clear any dynamically added content after initial load
  const checkForNewContent = () => {
    const newVideos = sideBar.querySelectorAll("ytd-compact-video-renderer");
    if (newVideos.length > initialVideoCount) {
      console.log("Detected new videos; removing excess");
      Array.from(newVideos)
        .slice(initialVideoCount)
        .forEach((video) => video.remove());
    }
  };

  const initialVideoCount = sideBar.querySelectorAll(
    "ytd-compact-video-renderer"
  ).length;
  setInterval(checkForNewContent, 1000); // Check every second for new content
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
    distracting = 0; // initially 1
    return distracting;
  }

  try {
    const response = await axios.post(
      "https://less-evil-youtube.onrender.com/search",
      {
        searchKey: title, // Send the title as the searchKey
        description: description || "", // Send the description
        tags: tags || [], // Send tags as an array
        topic_categories: topicCategories || [], // Send topicCategories as an array
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
      distracting = 1; //initially 1
    } else {
      distracting = 0; // initally 0
    }
  } catch (error) {
    console.error("Error:", error);
  }

  return distracting;
}

async function myCustomFunction() {
  // Your custom logic here
  console.log("Custom function executed before YouTube search.");
  // Example: modify the search term.
  if (searchInput) {
    const searchTerm = searchInput.value;
    console.log(searchTerm);

    // Make an API call using axios
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

// modals for shorts
function showCustomPopup(shortsUrl) {
  // Remove existing popup if any
  const existingPopup = document.querySelector(".custom-shorts-popup");
  if (existingPopup) existingPopup.remove();

  // Extract video ID from the Shorts URL (e.g., /shorts/VIDEO_ID)
  const videoId = shortsUrl.match(/\/shorts\/([^?]+)/)?.[1];
  if (!videoId) return; // Exit if no video ID found

  // Create popup element with embedded YouTube player
  const popup = document.createElement("div");
  popup.className = "custom-shorts-popup";
  // Add styles for the popup overlay
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

  // Add click event listener to close popup when clicking outside
  popup.addEventListener("click", (event) => {
    if (event.target === popup) {
      popup.remove();
    }
  });
  document.body.appendChild(popup);
}

// Function to intercept Shorts clicks
function interceptShorts() {
  document.addEventListener(
    "click",
    (event) => {
      // Find the closest element that might be a Short
      const shortsLink = event.target.closest('a[href*="/shorts/"]');
      if (shortsLink) {
        event.preventDefault(); // Prevent default navigation
        event.stopPropagation(); // Stop event bubbling
        showCustomPopup(shortsLink.href); // Pass the Short's URL to the popup
      }
    },
    true
  ); // Use capture phase to catch the click early
}

// Initialize when the page loads
document.addEventListener("DOMContentLoaded", interceptShorts);

// Watch for dynamically loaded content
const observer = new MutationObserver(() => {
  interceptShorts();
});
observer.observe(document.body, { childList: true, subtree: true });

function shortsPage() {
  console.log(window.location.href);
  const shortsUrl = window.location.href;
  if (shortsUrl.includes("/shorts/")) {
    watchingShorts = 1;

    // showCustomPopup(shortsUrl);
    console.log("Shorts page detected");

    const firstShort = document.evaluate(
      "/html/body/ytd-app/div[1]/ytd-page-manager/ytd-shorts/div[3]/div[2]/div[1]",
      document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );

    // Function to remove non-first shorts
    const removeOtherShorts = () => {
      // Get all shorts containers
      const shorts = document.evaluate(
        "/html/body/ytd-app/div[1]/ytd-page-manager/ytd-shorts/div[3]/div[2]/div",
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );

      // Loop through all found shorts containers
      for (let i = 0; i < shorts.snapshotLength; i++) {
        const short = shorts.snapshotItem(i);
        // Remove all shorts except the first one (index 1)
        // if (short && !short.matches("div[1]")) {
        //   short.remove();
        // }
        if (short && i !== 0) {
          short.remove();
        }
      }
    };

    // Initial removal
    removeOtherShorts();

    // Set up observer to continuously remove other shorts
    const shortsObserver = new MutationObserver(removeOtherShorts);
    shortsObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}

// Set up observer to watch for URL changes and check for /shorts
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
