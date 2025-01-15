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

  return (
    <>
      {searchResults && searchResults.length > 0 ? (
        searchResults.map((result: VidSearch, index: number) => (
          <div className="flex flex-col" key={index}>
            <Card key={index} className="">
              <CardHeader>
                <CardTitle>{result.snippet.title}</CardTitle>
              </CardHeader>
              <CardContent>here</CardContent>
              <CardFooter>
                <CardDescription>Video ID: {result.finalID}</CardDescription>
              </CardFooter>
            </Card>
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
