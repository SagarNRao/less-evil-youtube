"use client";
import React, { useState, createContext, ReactNode } from "react";

interface Video {
  title: string;
  creator: string;
  views: number;
  likes: number;
  link: string;
}

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

interface AppContextProps {
  YTSearchResults: VidSearch[];
  setYTSearchResults: (value: VidSearch[]) => void;
  searchKey: string;
  setSearchKey: (value: string) => void;
  detailsResults: Video[];
  setdetailsResults: (value: Video[]) => void;
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [YTSearchResults, setYTSearchResults] = useState<VidSearch[]>([]);
  const [detailsResults, setdetailsResults] = useState<Video[]>([]);
  const [searchKey, setSearchKey] = useState("");

  return (
    <AppContext.Provider
      value={{
        YTSearchResults,
        setYTSearchResults,
        searchKey,
        setSearchKey,
        detailsResults,
        setdetailsResults
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
