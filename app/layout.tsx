import type { Metadata } from "next";
import { Libre_Caslon_Text, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const caslon = Libre_Caslon_Text({
  variable: "--font-caslon",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const publicSans = Public_Sans({
  variable: "--font-public",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex",
  weight: ["400", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GOAT Court — Put Greatness on Trial",
  description:
    "Argue that your athlete is the greatest of all time against an AI opposing counsel armed with real stats, and let the AI judge deliver the verdict. Any sport, any two legends.",
  openGraph: {
    title: "GOAT Court — Put Greatness on Trial",
    description:
      "Pick any two athletes from any sport, argue your case against an AI lawyer, and let the AI judge decide who's the GOAT.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${caslon.variable} ${publicSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
