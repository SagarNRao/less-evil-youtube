"use client";
import React, { createContext, useState, ReactNode } from "react";

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

interface AppContextProps {
  searchResults: VidSearch[] | null;
  setSearchResults: (value: VidSearch[] | null) => void;
  searchTrigger: boolean;
  setSearchTrigger: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [searchResults, setSearchResults] = useState<VidSearch[] | null>(null);
  const [searchTrigger, setSearchTrigger] = useState<boolean>(false);
  return (
    <AppContext.Provider
      value={{
        searchResults,
        setSearchResults,
        searchTrigger,
        setSearchTrigger,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
