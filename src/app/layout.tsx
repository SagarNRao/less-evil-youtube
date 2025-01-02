import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SearchBar from "@/components/sections/SearchBar";
import { AppProvider } from "./AppContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProvider>
          <SearchBar />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
