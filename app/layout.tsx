"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from 'next-auth/react'; // 👈 NOVO: Importe o SessionProvider

import AppLayout from "@/components/appLayout";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "@/context/userContext";
import { usePathname } from "next/navigation";

import "./globals.css";
import AuthGate from "@/hooks/AuthGate";

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

          <SessionProvider>
            <UserProvider>

              <AuthGate> 
                {isLoginPage && <main>{children}</main>}
                {!isLoginPage && <AppLayout>{children}</AppLayout>}
              </AuthGate>
            </UserProvider>
          </SessionProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}