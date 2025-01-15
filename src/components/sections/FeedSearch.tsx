"use client";
import React, { useState, useEffect, useContext } from "react";
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

const FeedSearch: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("AppContext must be used within an AppProvider");
  }

  const { searchResults, setSearchResults } = context;

  useEffect(() => {
    // This effect will run every time searchResults changes
  }, [searchResults]);

  return (
    <>
      {searchResults && searchResults.length > 0 ? (
        searchResults.map((result: VidSearch, index: number) => (
          <div className="flex flex-col" key={index}>
            { result.distracting == false ? (
              <>
                <Card>
                  <CardContent>
                    <YTMPlayer
                      url={
                        `https://www.youtube.com/watch?v=${result.finalID}` as string
                      }
                      Name={result.finalTitle as string}
                    />
                  </CardContent>
                </Card>
              </>
            ) : (
              <p>This video is marked as distracting.</p>
            )}
          </div>
        ))
      ) : (
        <p>No search results found.</p>
      )}
    </>
  );

  // return <>{searchResults}</>;
};

export default FeedSearch;
