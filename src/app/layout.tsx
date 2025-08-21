import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { UserProvider } from "@/lib/UserContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flux Krea AI - Free AI Image Generator, Fast HD Art Creation",
  description: "Create stunning AI images from text prompts powered by Flux.1 Krea dev Model, No-Signup,High-Quality, Realistic 4K art creation and maker in secongs.",
  keywords: [
    "Flux Krea",
    "AI image generator",
    "Free AI art generator",
    "Text to image",
    "Free image generator",
    "Professional AI images",
    "FLUX.1 Krea",
    "Free Image Generation",
    "AI Art Creation"
  ],
};

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
        <UserProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
