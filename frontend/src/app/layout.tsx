import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SumItUp AI",
  description:
    "SumItUp AI is a cutting-edge Artificial Intelligence application that automatically extracts the most important sentences from lengthy documents, articles, and research papers using mathematical Natural Language Processing (Extractive Summarization).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${outfit.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
