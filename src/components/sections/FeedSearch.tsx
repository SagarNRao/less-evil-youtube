import React, { useState, useContext, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppContext } from "@/app/AppContext";
import axios from "axios";
import YTMPlayer from "./YTMPlayer";

const YoutubeAPIKey = process.env.YOUTBE_API_KEY;

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

export default function FeedSearch() {
  // const []

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

  return (
    <>
      {detailsResults.length > 0 ? (
        detailsResults.map((video, index) => (
          <div key={index} className="p-1">
            <div id="YoutubeVideo">
              <YTMPlayer url={video.link} Name={video.title} />
            </div>
            {/* <div id="details"></div> */}
          </div>
        ))
      ): (
        <h1>No home feed, search for what you came for</h1>
      )}
    </>
  );
}
