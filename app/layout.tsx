"use client";

import { Geist, Geist_Mono } from "next/font/google";

import AppLayout from "@/components/appLayout";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "@/context/userContext";
import { usePathname } from "next/navigation";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isLoginPage = pathname === "/Login";
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          value={{
            light: "light",
            dark: "dark",
            purple: "purple",
            green: "green",
          }}
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            {!isLoginPage && <AppLayout>{children}</AppLayout>}
            {isLoginPage && <main>{children}</main>}
          </UserProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
