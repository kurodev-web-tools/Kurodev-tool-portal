import type { Metadata } from "next";
import { 
  Noto_Sans_JP, 
  Montserrat, 
  M_PLUS_Rounded_1c, 
  Bebas_Neue,
  Roboto,
  Open_Sans,
  Lato,
  Source_Sans_3,
  Nunito,
  Poppins,
  Inter,
  Playfair_Display,
  Merriweather,
  Lora,
  Crimson_Text,
  Oswald,
  Anton,
  Dancing_Script,
  Pacifico,
  Great_Vibes,
  Roboto_Mono,
  Source_Code_Pro,
  Fira_Code,
  JetBrains_Mono,
  Kosugi_Maru,
  Sawarabi_Mincho,
  Noto_Serif_JP
} from "next/font/google";
import "./globals.css";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { ThemeProvider } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary"; // ErrorBoundary をインポート
import { StructuredData } from "@/components/seo/structured-data";
import { DebugPanelProvider } from "@/components/dev/debug-panel-provider";

// 日本語フォント
const notoSansJP = Noto_Sans_JP({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: 'swap',
});

const mPlusRounded1c = M_PLUS_Rounded_1c({
  weight: ["800"],
  subsets: ["latin"],
  variable: "--font-m-plus-rounded-1c",
  display: 'swap',
});

const kosugiMaru = Kosugi_Maru({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-kosugi-maru",
  display: 'swap',
});

const sawarabiMincho = Sawarabi_Mincho({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-sawarabi-mincho",
  display: 'swap',
});

const notoSerifJP = Noto_Serif_JP({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-noto-serif-jp",
  display: 'swap',
});

// 英語フォント - Sans Serif
const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: 'swap',
});

const openSans = Open_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: 'swap',
});

const lato = Lato({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-lato",
  display: 'swap',
});

const montserrat = Montserrat({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: 'swap',
});

const sourceSans3 = Source_Sans_3({
  weight: ["300", "400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-source-sans-3",
  display: 'swap',
});

const nunito = Nunito({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-nunito",
  display: 'swap',
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: 'swap',
});

const inter = Inter({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

// 英語フォント - Serif
const playfairDisplay = Playfair_Display({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: 'swap',
});

const merriweather = Merriweather({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: 'swap',
});

const lora = Lora({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-lora",
  display: 'swap',
});

const crimsonText = Crimson_Text({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-crimson-text",
  display: 'swap',
});

// 装飾フォント
const bebasNeue = Bebas_Neue({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: 'swap',
});

const oswald = Oswald({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-oswald",
  display: 'swap',
});

const anton = Anton({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-anton",
  display: 'swap',
});

const dancingScript = Dancing_Script({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-dancing-script",
  display: 'swap',
});

const pacifico = Pacifico({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-pacifico",
  display: 'swap',
});

const greatVibes = Great_Vibes({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-great-vibes",
  display: 'swap',
});

// モノスペースフォント
const robotoMono = Roboto_Mono({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: 'swap',
});

const sourceCodePro = Source_Code_Pro({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-source-code-pro",
  display: 'swap',
});

const firaCode = Fira_Code({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: 'swap',
});

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
        className={`${notoSansJP.variable} ${mPlusRounded1c.variable} ${kosugiMaru.variable} ${sawarabiMincho.variable} ${notoSerifJP.variable} ${roboto.variable} ${openSans.variable} ${lato.variable} ${montserrat.variable} ${sourceSans3.variable} ${nunito.variable} ${poppins.variable} ${inter.variable} ${playfairDisplay.variable} ${merriweather.variable} ${lora.variable} ${crimsonText.variable} ${bebasNeue.variable} ${oswald.variable} ${anton.variable} ${dancingScript.variable} ${pacifico.variable} ${greatVibes.variable} ${robotoMono.variable} ${sourceCodePro.variable} ${firaCode.variable} ${jetBrainsMono.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <ErrorBoundary fallback={<div>Something went wrong in AuthProvider or its children.</div>}> {/* ErrorBoundary でラップ */}
              <DebugPanelProvider>
                <Header />
                <main className="flex-grow">
                  {children}
                </main>
                <Footer />
              </DebugPanelProvider>
            </ErrorBoundary>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}