import type { Metadata } from "next";
import { ToolStructuredData } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "イベント用素材制作",
  description: "配信イベント用の素材を簡単に制作するツール。テンプレートから選択して、テキストや画像をカスタマイズして高品質な素材を作成できます。",
  keywords: [
    "素材制作",
    "配信素材",
    "イベント素材",
    "テンプレート",
    "画像編集",
    "配信準備",
    "VTuber",
    "配信者"
  ],
  openGraph: {
    title: "イベント用素材制作 | VTuber Tools Portal",
    description: "配信イベント用の素材を簡単に制作するツール。テンプレートから選択して、テキストや画像をカスタマイズして高品質な素材を作成できます。",
    type: "website",
    url: "https://kurodev-web-tools.github.io/tools/asset-creator",
    images: [
      {
        url: "/og-image-asset-creator.png",
        width: 1200,
        height: 630,
        alt: "イベント用素材制作ツール",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "イベント用素材制作 | VTuber Tools Portal",
    description: "配信イベント用の素材を簡単に制作するツール。",
    images: ["/og-image-asset-creator.png"],
  },
  alternates: {
    canonical: "/tools/asset-creator",
  },
};

export default function AssetCreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToolStructuredData
        name="イベント用素材制作"
        description="配信イベント用の素材を簡単に制作するツール。テンプレートから選択して、テキストや画像をカスタマイズして高品質な素材を作成できます。"
        url="https://kurodev-web-tools.github.io/tools/asset-creator"
        image="https://kurodev-web-tools.github.io/og-image-asset-creator.png"
        applicationCategory="MultimediaApplication"
        datePublished="2025-01-01"
      />
      {children}
    </>
  );
}