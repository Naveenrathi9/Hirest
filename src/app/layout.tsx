import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hirest - Real 1-on-1 Online Mock Interviews with Industry Pros",
  description: "Practice real interviews and land your dream job. Hirest connects job seekers with experienced industry professionals for 1-on-1 online mock interviews at minimal cost.",
  keywords: ["mock interview", "tech interview prep", "system design", "data structures", "hirest", "job preparation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Direct static standalone stylesheet guaranteeing 100% reliable CSS delivery */}
        <link rel="stylesheet" href="/tailwind.css" />
      </head>
      <body className="antialiased min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
