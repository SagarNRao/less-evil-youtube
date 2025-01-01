import React, { useState, useContext } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppContext } from "@/app/AppContext";

const YoutubeAPIKey = process.env.YOUTBE_API_KEY;

interface Video {
  title: string;
  creator: string;
  views: number;
  likes: number;
  link: string;
}

export default function FeedSearch() {

  const context = useContext(AppContext)

  if (!context) {
    throw new Error("AppContext must be used within an AppProvider");
  }

  const {YTSearchResults, setYTSearchResults} = context

  const Search = () => {
    const response = fetch(`https://www.googleapis.com/youtube/v3/search?key=${YoutubeAPIKey}&q=`)
  }

  return (
    <Card>
      <CardHeader></CardHeader>
    </Card>
  );
}
