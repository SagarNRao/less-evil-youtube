"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import ReactPlayer from "react-player";
import axios from "axios";
import { Button } from "@/components/ui/button";

export default function Player() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const name = searchParams.get("name");

  console.log("URL:", url);
  console.log("Name:", name);

  const sendDataToServer = async (data: any) => {
    try {
      const response = await axios.post('http://localhost:5000/model', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error sending data to server:', error);
    }
  };

  const data = {
    title: 'Example Title',
    description: 'Example Description',
    category: 'Example Category',
  };

  return (
    <div>
      <h1>{url}</h1>
      <ReactPlayer url={url as string} />
      <Button onClick={() => sendDataToServer(data)}>Here</Button>
    </div>
  );
}
