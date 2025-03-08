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
  console.log("Undistracting");
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  document.body.appendChild(overlay);

  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
  overlay.style.zIndex = '9999';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';

  const message = document.createElement('h1');
  message.textContent = 'Get back to work';
  message.style.color = 'white';
  message.style.fontFamily = 'Geist, sans-serif';
  message.style.fontSize = '2rem';
  overlay.appendChild(message);

  // Log the image URL to verify it's correct
  console.log('Image URL:', image.src);
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
      const response = await axios.post("http://localhost:5000/search", {
        searchKey: searchTerm,
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log('Success:', response.data);

      if (response.data.message == true) {
        console.log("caught a true");
        distractionUIBlock();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

moddedSearch();
