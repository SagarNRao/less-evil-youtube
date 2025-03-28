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

function moddedSearch() {
  if (searchButton) {
    searchButton.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent default search

      searchKey = JSON.stringify({ searchKey: searchInput.value });
      console.log(searchKey);
      myCustomFunction();

      // Trigger YouTube's search after your function completes
      searchButton.click(); // Or submit the form
    });
  } else {
    console.error("YouTube search button not found.");
  }
}

async function distractionUIBlock() {
  console.log("Blocking distracting search");

  if (document.getElementById("distraction-overlay")) {
    console.log("Overlay already exists");
    return;
  }

  console.log("Undistracting");
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
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
    "/html/body/ytd-app/div[1]/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[1]/div[2]/div/div/ytd-player/div/div/div[1]/video",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  if (videoPlayer) {
    console.log("Video player detected");
    // setWatchingIndividualVideo("watchingVideo", 1);
  } else {
    console.log("No video player detected");
    // setWatchingIndividualVideo("watchingVideo", 0);
  }
}

// Function to run on page load and URL changes
function setupVideoDetection() {
  detectVideoPlayer();

  // Create observer for URL changes
  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      detectVideoPlayer();
    }
  });

  // Track last URL
  let lastUrl = window.location.href;

  // Start observing
  observer.observe(document.body, {
    subtree: true,
    childList: true,
  });
}

// Initial setup
setupVideoDetection();

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
        "http://localhost:5000/search",
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
        console.log("caught a true");
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

moddedSearch();
