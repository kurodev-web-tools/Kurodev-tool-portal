import Script from 'next/script';

interface StructuredDataProps {
  type?: 'website' | 'webapplication' | 'softwareapplication';
  name?: string;
  description?: string;
  url?: string;
  image?: string;
  author?: string;
  publisher?: string;
  datePublished?: string;
  dateModified?: string;
  inLanguage?: string;
  isAccessibleForFree?: boolean;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    price?: string;
    priceCurrency?: string;
  };
}

export function StructuredData({
  type = 'webapplication',
  name = 'VTuber Tools Portal',
  description = 'VTuber・配信者・クリエイター向けの配信ワークフロー連鎖ツールポータル。スケジュール管理、素材制作、配信準備を効率化する無料ツール集。',
  url = 'https://kurodev-web-tools.github.io',
  image = 'https://kurodev-web-tools.github.io/og-image.png',
  author = 'Kurodev Tools',
  publisher = 'Kurodev Tools',
  datePublished = '2025-01-01',
  dateModified = new Date().toISOString().split('T')[0],
  inLanguage = 'ja-JP',
  isAccessibleForFree = true,
  applicationCategory = 'MultimediaApplication',
  operatingSystem = 'Web Browser',
  offers = {
    price: '0',
    priceCurrency: 'JPY'
  }
}: StructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": type === 'webapplication' ? 'WebApplication' : type === 'softwareapplication' ? 'SoftwareApplication' : 'WebSite',
    name,
    description,
    url,
    image,
    author: {
      "@type": "Organization",
      name: author
    },
    publisher: {
      "@type": "Organization",
      name: publisher
    },
    datePublished,
    dateModified,
    inLanguage,
    isAccessibleForFree,
    ...(type === 'webapplication' || type === 'softwareapplication' ? {
      applicationCategory,
      operatingSystem,
      offers: {
        "@type": "Offer",
        price: offers.price,
        priceCurrency: offers.priceCurrency
      }
    } : {}),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/tools?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    mainEntity: {
      "@type": "ItemList",
      name: "配信ツール一覧",
      description: "VTuber・配信者向けの無料ツール集",
      numberOfItems: 15,
      itemListElement: [
        {
          "@type": "SoftwareApplication",
          position: 1,
          name: "スケジュールカレンダー",
          description: "配信スケジュールを管理するカレンダーツール",
          url: `${url}/tools/schedule-calendar`,
          applicationCategory: "ProductivityApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "JPY"
          }
        },
        {
          "@type": "SoftwareApplication",
          position: 2,
          name: "イベント用素材制作",
          description: "配信イベント用の素材を簡単に制作するツール",
          url: `${url}/tools/asset-creator`,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "JPY"
          }
        },
        {
          "@type": "SoftwareApplication",
          position: 3,
          name: "配信準備チェックリスト",
          description: "配信前の準備を漏れなく確認するチェックリスト",
          url: `${url}/tools/stream-prep`,
          applicationCategory: "ProductivityApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "JPY"
          }
        }
      ]
    }
  };

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
}

// 個別ページ用の構造化データ
export function ToolStructuredData({
  name,
  description,
  url,
  image,
  author = 'Kurodev Tools',
  datePublished,
  dateModified = new Date().toISOString().split('T')[0],
  applicationCategory = 'MultimediaApplication',
  operatingSystem = 'Web Browser'
}: {
  name: string;
  description: string;
  url: string;
  image?: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  applicationCategory?: string;
  operatingSystem?: string;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url,
    image: image || 'https://kurodev-web-tools.github.io/og-image.png',
    author: {
      "@type": "Organization",
      name: author
    },
    datePublished: datePublished || new Date().toISOString().split('T')[0],
    dateModified,
    applicationCategory,
    operatingSystem,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY"
    },
    isAccessibleForFree: true,
    inLanguage: "ja-JP"
  };

  return (
    <Script
      id="tool-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
}
