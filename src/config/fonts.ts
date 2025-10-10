/**
 * アプリケーション全体のフォント設定
 * UIフォントとツール用フォントを分離して管理
 */

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

/**
 * UI用の基本フォント（常に読み込む）
 */

// 日本語メインフォント
export const notoSansJP = Noto_Sans_JP({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: 'swap',
  preload: true, // UI用なので優先的に読み込む
});

// 英語メインフォント（高頻度使用）
export const inter = Inter({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
  preload: true,
});

export const montserrat = Montserrat({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: 'swap',
  preload: true,
});

/**
 * ツール用フォント（サムネイル/素材作成ツールで使用）
 * display: 'swap'で遅延読み込み
 */

// 日本語フォント
export const mPlusRounded1c = M_PLUS_Rounded_1c({
  weight: ["800"],
  subsets: ["latin"],
  variable: "--font-m-plus-rounded-1c",
  display: 'swap',
  preload: false,
});

export const kosugiMaru = Kosugi_Maru({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-kosugi-maru",
  display: 'swap',
  preload: false,
});

export const sawarabiMincho = Sawarabi_Mincho({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-sawarabi-mincho",
  display: 'swap',
  preload: false,
});

export const notoSerifJP = Noto_Serif_JP({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-noto-serif-jp",
  display: 'swap',
  preload: false,
});

// 英語フォント - Sans Serif
export const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: 'swap',
  preload: false,
});

export const openSans = Open_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: 'swap',
  preload: false,
});

export const lato = Lato({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-lato",
  display: 'swap',
  preload: false,
});

export const sourceSans3 = Source_Sans_3({
  weight: ["300", "400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-source-sans-3",
  display: 'swap',
  preload: false,
});

export const nunito = Nunito({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-nunito",
  display: 'swap',
  preload: false,
});

export const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: 'swap',
  preload: false,
});

// 英語フォント - Serif
export const playfairDisplay = Playfair_Display({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: 'swap',
  preload: false,
});

export const merriweather = Merriweather({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: 'swap',
  preload: false,
});

export const lora = Lora({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-lora",
  display: 'swap',
  preload: false,
});

export const crimsonText = Crimson_Text({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-crimson-text",
  display: 'swap',
  preload: false,
});

// 装飾フォント
export const bebasNeue = Bebas_Neue({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: 'swap',
  preload: false,
});

export const oswald = Oswald({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-oswald",
  display: 'swap',
  preload: false,
});

export const anton = Anton({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-anton",
  display: 'swap',
  preload: false,
});

export const dancingScript = Dancing_Script({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-dancing-script",
  display: 'swap',
  preload: false,
});

export const pacifico = Pacifico({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-pacifico",
  display: 'swap',
  preload: false,
});

export const greatVibes = Great_Vibes({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-great-vibes",
  display: 'swap',
  preload: false,
});

// モノスペースフォント
export const robotoMono = Roboto_Mono({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: 'swap',
  preload: false,
});

export const sourceCodePro = Source_Code_Pro({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-source-code-pro",
  display: 'swap',
  preload: false,
});

export const firaCode = Fira_Code({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: 'swap',
  preload: false,
});

export const jetBrainsMono = JetBrains_Mono({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: 'swap',
  preload: false,
});

/**
 * 全てのフォントのCSS変数クラス名を取得
 */
export function getAllFontVariables(): string {
  return [
    // UI用（preload）
    notoSansJP.variable,
    inter.variable,
    montserrat.variable,
    // ツール用（遅延読み込み）
    mPlusRounded1c.variable,
    kosugiMaru.variable,
    sawarabiMincho.variable,
    notoSerifJP.variable,
    roboto.variable,
    openSans.variable,
    lato.variable,
    sourceSans3.variable,
    nunito.variable,
    poppins.variable,
    playfairDisplay.variable,
    merriweather.variable,
    lora.variable,
    crimsonText.variable,
    bebasNeue.variable,
    oswald.variable,
    anton.variable,
    dancingScript.variable,
    pacifico.variable,
    greatVibes.variable,
    robotoMono.variable,
    sourceCodePro.variable,
    firaCode.variable,
    jetBrainsMono.variable,
  ].join(' ');
}


