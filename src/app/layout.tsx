import type { Metadata } from "next";
import { Noto_Sans_JP, Montserrat, M_PLUS_Rounded_1c, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { ThemeProvider } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary"; // ErrorBoundary をインポート

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: 'swap',
});

const montserrat = Montserrat({
  weight: ["700"],
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: 'swap',
});

const mPlusRounded1c = M_PLUS_Rounded_1c({
  weight: ["800"],
  subsets: ["latin"],
  variable: "--font-m-plus-rounded-1c",
  display: 'swap',
});

const bebasNeue = Bebas_Neue({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "VTuber配信ワークフロー連鎖ツール ポータル",
  description: "VTuberの配信ワークフローを強力にサポートする連鎖ツールをご紹介します。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${notoSansJP.variable} ${montserrat.variable} ${mPlusRounded1c.variable} ${bebasNeue.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ErrorBoundary fallback={<div>Something went wrong in AuthProvider or its children.</div>}> {/* ErrorBoundary でラップ */}
              <Header />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </ErrorBoundary>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}