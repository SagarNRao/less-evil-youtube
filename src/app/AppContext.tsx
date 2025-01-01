"use client";
import React, { useState, createContext, ReactNode } from "react";

interface Video {
  title: string;
  creator: string;
  views: number;
  likes: number;
  link: string;
}

interface AppContextProps {
  YTSearchResults: Video[];
  setYTSearchResults: (value: Video[]) => void;
  searchKey: string;
  setSearchKey: (value: string) => void;
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [YTSearchResults, setYTSearchResults] = useState<Video[]>([]);
  const [searchKey, setSearchKey] = useState("");

  return (
    <AppContext.Provider
      value={{
        YTSearchResults,
        setYTSearchResults,
        searchKey,
        setSearchKey
      }}
    ></AppContext.Provider>
  );
};
