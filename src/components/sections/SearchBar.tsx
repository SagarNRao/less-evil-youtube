"use client";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { AppContext } from "@/app/AppContext";
import { useContext, useEffect, useState } from "react";
import axios from "axios";

interface VidSearch {
  snippet: {
    title: string | undefined;
  };
  id: {
    videoId: string | undefined;
  };
  finalID: string;
  finalTitle: string;
  distracting: boolean;
}

interface Video {
  title: string;
  creator: string;
  views: number;
  likes: number;
  link: string;
}

const SearchBar: React.FC = () => {
  const [searchKey, setSearchKey] = useState<string>("");
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("AppContext must be used within an AppProvider");
  }

  const { searchResults, setSearchResults, searchTrigger, setSearchTrigger } =
    context;

  const Search = async () => {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search/?part=snippet&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}&q=${searchKey}`
    );

    console.log(response);

    const parsedData = JSON.parse(JSON.stringify(response));

    const vidSearchPromises = parsedData.data.items.map(
      async (item: VidSearch) => {
        const title = item.snippet.title;
        const videoId = item.id.videoId;
        let distracting;

        try {
          const response = await axios.post(
            `http://localhost:5000/model`,
            { videoID: item.finalID },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          console.log(response.data.message);

          switch (response.data.message) {
            case true:
              distracting = true;
              break;
            case false:
              distracting = false;
              break;
            default:
              console.log("Unexpected response data");
          }
        } catch (error) {
          console.error("here: ", error);
        }

        return {
          snippet: {
            title: title,
          },
          id: {
            videoId: videoId,
          },
          finalTitle: title,
          finalID: videoId,
          distracting: distracting,
        };
      }
    );

    try {
      const vidSearchArr = await Promise.all(vidSearchPromises);
      console.log("setting now");
      setSearchResults(vidSearchArr);
      console.log(searchResults);
    } catch (error) {
      console.error(error);
    }
    // setSearchTrigger((prev) => !prev);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const inputElement = (e.target as HTMLFormElement)
          .elements[0] as HTMLInputElement;
        setSearchKey(inputElement.value);
      }}
    >
      <div className="flex">
        <Input placeholder="Search" />
        <Button type="submit" onClick={Search}>
          Search
        </Button>
      </div>
    </form>
  );
};
export default SearchBar;
