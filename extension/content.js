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

      searchButton.click();
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
    setTimeout(() => {
      detectVideoPlayer();
    }, 3000);
    // setWatchingIndividualVideo("watchingVideo", 0);
  }
}

function setupVideoDetection() {
  // FOR SIDEBAR
  detectVideoPlayer();

  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      detectVideoPlayer();

      setInterval(async () => {
        const sideBar = document.evaluate(
          "/html/body/ytd-app/div[1]/ytd-page-manager/ytd-watch-flexy/div[5]/div[2]/div/div[4]/ytd-watch-next-secondary-results-renderer/div[2]/ytd-item-section-renderer/div[3]",
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;

        if (sideBar) {
          const videos = sideBar.querySelectorAll("ytd-compact-video-renderer");
          for (const video of videos) {
            const titleElement = video.querySelector("#video-title");
            if (titleElement) {
              const titleText = titleElement.textContent;
              const link = video.querySelector("#thumbnail").href;
              console.log("Title:", titleText);
              console.log("Link:", link);

              const videoId = link.split("v=")[1].split("&")[0];
              const videoData = await YTApiCall(videoId);
              console.log(videoId)
              const tags = videoData.tags;
              const topicCategories = videoData.topicCategories;

              console.log("Tags:", tags);
              console.log("Topic Categories:", topicCategories);

              if (
                (await predict(titleText, " ", tags, topicCategories)) === 1
              ) {
                titleElement.style.color = "red";
                titleElement.textContent = "⚠️ Distracting Content";
              }
            }
          }
        } else {
          console.log("Sidebar not found");
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

const API_KEY = "AIzaSyD1LNSDcDrMj6aGAHwbi4r1Oh6em6xs4uo";

async function YTApiCall(videoID) {
  const url = `https://youtube.googleapis.com/youtube/v3/videos?part=topicDetails,snippet&id=${videoID}&key=${API_KEY}`;

  try {
    const response = await axios.get(url);
    const video = response.data.items[0];
    console.log("HERE",response.data);
    return {
      tags: video.snippet.tags || [],
      topicCategories: video.topicDetails?.topicCategories || [],
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

  if (title === "⚠️ Distracting Content")
  {
    distracting = 1;
    return distracting;
  }

  try {
    const response = await axios.post(
      "http://localhost:5000/search",
      {
        searchKey: title, // Send the title as the searchKey
        descripti00on: description || "", // Send the description
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

moddedSearch();
