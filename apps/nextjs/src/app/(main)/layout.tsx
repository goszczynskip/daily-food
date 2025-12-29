import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { env } from "@tonik/env";
import { cn } from "@tonik/ui";
import { Toaster } from "@tonik/ui/sonner";
import { ThemeProvider } from "@tonik/ui/theme";

import { TRPCReactProvider } from "~/trpc/react";

import "./globals.css";
import "@total-typescript/ts-reset";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://boring.tonik.com"
      : "http://localhost:3000",
  ),
  title: "Boring stack",
  description: "The most boring stack you'll ever need",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" suppressHydrationWarning>
    <body
      className={cn(
        "bg-background text-foreground min-h-screen font-sans antialiased",
        GeistSans.variable,
        GeistMono.variable,
      )}
      suppressHydrationWarning
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster />
      </ThemeProvider>
    </body>
  </html>
);

export default Layout;
