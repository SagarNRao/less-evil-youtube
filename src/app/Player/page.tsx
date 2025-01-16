"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import YTMPlayer from "@/components/sections/YTMPlayer";

export default function Player() {
  const searchParams = useSearchParams();
  const here = searchParams.get("search");
  console.log(searchParams.get("search"));

  return (
    <YTMPlayer
      url={searchParams.get("url") as string}
      Name={searchParams.get("name") as string}
    ></YTMPlayer>
  );
}
