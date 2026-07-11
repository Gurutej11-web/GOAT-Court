import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  weight: ["500", "700"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex",
  weight: ["400", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GOAT Court: Pick Two Legends, Settle the Debate",
  description:
    "Argue your athlete is the greatest of all time against an AI that fires back with real stats, then let an AI judge decide. Basketball, soccer, tennis, football, and boxing legends.",
  manifest: "/manifest.json",
  openGraph: {
    title: "GOAT Court: Pick Two Legends, Settle the Debate",
    description:
      "Pick two sports legends, argue your case against an AI, and let the AI judge decide who's the GOAT.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#c2760a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${grotesk.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('goat-court-theme');if(t==='dark'){document.documentElement.dataset.theme=t;}}catch(e){}})();",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
