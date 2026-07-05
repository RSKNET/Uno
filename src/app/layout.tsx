import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ConnectionStatus } from "@/components/connection-status";
import { MaintenanceGuard } from "@/components/maintenance-guard";

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Uno Skors",
  description: "Pencatat skor digital UNO modern, estetik, support offline mode, dan unduh PDF. Dirancang untuk anak muda.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${outfit.variable} ${plusJakartaSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: "var __name = (t, v) => t; window.__name = __name;" }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <MaintenanceGuard>
            <div className="bg-grain" />
            <ConnectionStatus />
            <div className="flex-1 flex flex-col">
              {children}
            </div>
          </MaintenanceGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
