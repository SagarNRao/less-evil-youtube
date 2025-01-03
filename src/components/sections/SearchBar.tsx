"use client";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { AppContext } from "@/app/AppContext";
import { useContext, useEffect } from "react";
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
}

interface Video {
  title: string;
  creator: string;
  views: number;
  likes: number;
  link: string;
}

const YoutubeAPIKey = "AIzaSyD1LNSDcDrMj6aGAHwbi4r1Oh6em6xs4uo";

const SearchBar: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("AppContext must be used within an AppProvider");
  }

  const {
    YTSearchResults,
    setYTSearchResults,
    searchKey,
    setSearchKey,
    detailsResults,
    setdetailsResults,
  } = context;

  const fixSearchKey = (key: string) => {
    let hereString = key.split(" ");
    let newString = "";
    hereString.map((word) => {
      newString + word;
    });
    console.log(searchKey, " as opposed to ", newString)
    setSearchKey(newString as string);
  };

  async function getVideoDetails(videoId: string): Promise<Video> {
    const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${YoutubeAPIKey}`;

    try {
      const response = await axios.get(videoUrl);
      const video = response.data.items[0];

      return {
        title: video.snippet.title,
        creator: video.snippet.channelTitle,
        views: parseInt(video.statistics.viewCount, 10),
        likes: parseInt(video.statistics.likeCount, 10),
        link: `https://www.youtube.com/watch?v=${videoId}`,
      };
    } catch (error) {
      console.error(`Error fetching video details for ${videoId}:`, error);
      throw error;
    }
  }

  const Search = async () => {
    fixSearchKey(searchKey)
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?key=${YoutubeAPIKey}&q=${searchKey}&part=snippet`
    );

    const ParsedData = JSON.parse(JSON.stringify(response));
    console.log(response);

    const vidSearchArr: VidSearch[] = ParsedData.data.items.map(
      (item: VidSearch) => {
        const title = item.snippet.title;
        const videoId = item.id.videoId;

        return {
          snippet: {
            title: title,
          },
          id: {
            videoId: videoId,
          },
          finalTitle: title,
          finalID: videoId,
        };
      }
    );

    setYTSearchResults(vidSearchArr);

    const videoDetailsPromises = vidSearchArr.map((id) =>
      getVideoDetails(id.finalID as string)
    );
    const videos = await Promise.all(videoDetailsPromises);

    const VideoDeetsArr: Video[] = videos.map((video, index) => {
      return {
        ...video,
        finalTitle: vidSearchArr[index].finalTitle,
        finalID: vidSearchArr[index].finalID,
      };
    });

    setdetailsResults(VideoDeetsArr);
    console.log(detailsResults);
  };

  useEffect(() => {
    console.log(detailsResults);
  }, [detailsResults]);

  return (
    <div className="justify-center flex">
      <Input
        placeholder="Search"
        style={{
          width: "1270px",
          justifyContent: "right",
          height: "30px",
          backgroundColor: "#1C1C1C",
        }}
        onChange={(e) => setSearchKey(e.target.value)}
      ></Input>
      <div className="p-1"></div>
      <Button style={{ height: "30px" }} onClick={Search}>
        Search
      </Button>
    </div>
  );
};
export default SearchBar;
