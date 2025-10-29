import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { ThemeProvider } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/error-boundary"; // ErrorBoundary をインポート
import { StructuredData } from "@/components/seo/structured-data";
import { DebugPanelProvider } from "@/components/dev/debug-panel-provider";
import { getAllFontVariables } from "@/config/fonts";
import { CustomThemeProvider } from "@/contexts/ThemeContext";
import { FavoritesInitializer } from "@/components/favorites-initializer";
import { RootHeaderFooter } from "@/components/RootHeaderFooter";

export const metadata: Metadata = {
  title: {
    default: "VTuber配信ワークフロー連鎖ツール ポータル",
    template: "%s | VTuber Tools Portal"
  },
  description: "VTuber・配信者・クリエイター向けの配信ワークフロー連鎖ツールポータル。スケジュール管理、素材制作、配信準備を効率化する無料ツール集。",
  keywords: [
    "VTuber",
    "配信者",
    "クリエイター",
    "配信ツール",
    "ワークフロー",
    "スケジュール管理",
    "素材制作",
    "配信準備",
    "無料ツール",
    "配信支援"
  ],
  authors: [{ name: "Kurodev Tools" }],
  creator: "Kurodev Tools",
  publisher: "Kurodev Tools",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
  },
  metadataBase: new URL("https://kurodev-web-tools.github.io"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://kurodev-web-tools.github.io",
    siteName: "VTuber Tools Portal",
    title: "VTuber配信ワークフロー連鎖ツール ポータル",
    description: "VTuber・配信者・クリエイター向けの配信ワークフロー連鎖ツールポータル。スケジュール管理、素材制作、配信準備を効率化する無料ツール集。",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VTuber Tools Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VTuber配信ワークフロー連鎖ツール ポータル",
    description: "VTuber・配信者・クリエイター向けの配信ワークフロー連鎖ツールポータル。",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  other: {
    "msapplication-TileColor": "#1a1a1a",
    "theme-color": "#1a1a1a",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "VTuber Tools Portal",
    "application-name": "VTuber Tools Portal",
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning className="dark">
      <head>
        <StructuredData />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="VTuber Tools Portal" />
        <meta name="application-name" content="VTuber Tools Portal" />
        <meta name="msapplication-TileColor" content="#1a1a1a" />
        <meta name="theme-color" content="#1a1a1a" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${getAllFontVariables()} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <CustomThemeProvider>
            <AuthProvider>
              <ErrorBoundary> {/* ErrorBoundary でラップ */}
                <DebugPanelProvider>
                  <FavoritesInitializer />
                  <RootHeaderFooter 
                    header={<Header />}
                    footer={<Footer />}
                  >
                    {children}
                  </RootHeaderFooter>
                </DebugPanelProvider>
              </ErrorBoundary>
            </AuthProvider>
          </CustomThemeProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}