"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReactPlayer from "react-player";
import { useState, useContext } from "react";
// import { AppContext } from "@/app/AppContext";
import Link from "next/link";

interface YTMProps {
  url: string;
  Name: string;
}

const YTMPlayer: React.FC<YTMProps> = ({ url, Name }) => {
  const [playing, setPlaying] = useState<boolean>(false);

  return (
    <Card className="flex">
      <div>
        <ReactPlayer
          playing={playing}
          url={url}
          width={"447px"}
          height={"245px"}
        ></ReactPlayer>
      </div>
      <div>
        <CardContent className="text-2xl">{Name}</CardContent>
        {playing == false ? (
          <Button>
            <Link
              href={{
                pathname: "/Player",
                query: {
                  url: url,
                  name: Name,
                },
              }}
            >
              Play
            </Link>
          </Button>
        ) : (
          <Button
            onClick={() => {
              setPlaying(false);
            }}
          >
            Pause
          </Button>
        )}{" "}
      </div>
    </Card>
  );
};

export default YTMPlayer;
