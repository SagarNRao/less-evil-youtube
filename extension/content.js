// import axios from "axios";

function moddedSearch() {
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

  if (searchButton) {
    searchButton.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent default search

      JSON.stringify({searchKey: searchInput.value});
      console.log(searchKey);
      myCustomFunction();

      // Trigger YouTube's search after your function completes
      searchButton.click(); // Or submit the form
    });
  } else {
    console.error("YouTube search button not found.");
  }
}

async function myCustomFunction() {
  // Your custom logic here
  console.log("Custom function executed before YouTube search.");
  // Example: modify the search term.
  const searchInput = document.getElementById("search");
  if (searchInput) {
    const searchTerm = searchInput.value;
    console.log(searchTerm);

    // Make an API call using axios
    const response = await fetch("http://localhost:5000/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        searchKey: searchInput.value,
      }),
    }).then((res) => res.json());
    console.log(response);
  }
}

moddedSearch();
