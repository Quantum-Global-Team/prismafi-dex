import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AppShell } from "@/components/layout/AppShell"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "Tessera — Institutional Forex DEX",
  description:
    "Trade tokenized fiat assets with institutional precision. Tessera brings TradFi-grade forex to the Polkadot EVM.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn("dark", "font-sans", fontSans.variable)}
      suppressHydrationWarning
    >
      <body
        className={cn(
          "min-h-screen bg-background antialiased",
          fontSans.variable,
          fontMono.variable,
          "font-sans",
        )}
      >
        <ThemeProvider>
          <TooltipProvider>
            <AppShell>{children}</AppShell>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
