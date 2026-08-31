import type { Metadata } from "next";
import { Geist, Nunito } from "next/font/google";
import "./globals.css";
import { Header } from "@/features/provider/header";
import { QueryProvider } from "@/features/provider/query-provider";
import { ThemeProvider } from "@/features/provider/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProgrammingTail — turn tutorials into practice",
  description: "Paste a tutorial transcript or a YouTube link and get a hands-on coding exercise, tests, and hints generated from it.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${nunito.variable} h-full antialiased`}>
      <body className="container mx-auto">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <Header />
            <main className="min-h-screen bg-background text-foreground">
              {children}
            </main>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
