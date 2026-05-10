import { DM_Sans, Geist_Mono, Outfit } from "next/font/google";

import { ThemeProvider } from "@/core/providers/theme-provider";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import "./globals.css";

const dmSansHeading = DM_Sans({subsets:['latin'],variable:'--font-heading'});
const outfit = Outfit({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", outfit.variable, dmSansHeading.variable)}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
