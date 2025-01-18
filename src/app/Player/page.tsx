"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import ReactPlayer from "react-player";

export default function Player() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const name = searchParams.get("name");

  console.log("URL:", url);
  console.log("Name:", name);

  return (
    <div>
      <h1>{url}</h1>
      <ReactPlayer url={url as string} />
    </div>
  );
}