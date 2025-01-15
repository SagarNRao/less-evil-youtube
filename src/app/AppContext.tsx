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
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [searchResults, setSearchResults] = useState<VidSearch[] | null>(null);

  return (
    <AppContext.Provider
      value={{
        searchResults,
        setSearchResults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
