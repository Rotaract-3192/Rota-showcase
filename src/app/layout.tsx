import type { Metadata } from "next";
import { Libre_Caslon_Text, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectDetailModal from "@/components/ProjectDetailModal";
import { QueryProvider } from "@/components/providers/query-provider";

const libreCaslon = Libre_Caslon_Text({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-caslon",
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Rotaract District 3192 | Ocean of Impact",
  description: "Explore the collective community service projects, clubs, active volunteers, and social impact stories in Rotaract District 3192.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${libreCaslon.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-navy-deep text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-electric-blue">
        <QueryProvider>
          {/* Sticky Global Navigation */}
          <Navbar />
          
          {/* Main Content Area */}
          <main className="flex-grow pt-20">
            {children}
          </main>
          
          {/* Detail assessment overlay */}
          <ProjectDetailModal />
          
          {/* Footer */}
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
