import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";

// Self-hosted by next/font at build time, so visitors' browsers never contact Google. The
// variables are the ones @thebensage-dev/ui's tokens read for font-sans and font-mono.
const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui",
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-code" });

export const fontVariables = `${sans.variable} ${mono.variable}`;
