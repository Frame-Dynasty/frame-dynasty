import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const handorty = localFont({
  src: "../../public/fonts/Handorty.otf",
  variable: "--font-handorty",
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Frame Dynasty — Frames That Carry Stories",
  description:
    "Exhibition website for the Benin Past frame collection by Frame Dynasty. Every frame tells a story.",
  openGraph: {
    title: "Frame Dynasty — Frames That Carry Stories",
    description:
      "Exhibition website for the Benin Past frame collection by Frame Dynasty.",
    siteName: "Frame Dynasty",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${handorty.variable} ${montserrat.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
