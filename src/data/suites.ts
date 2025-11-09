export type SuiteStatus = 'released' | 'beta' | 'development';

export interface Suite {
  id: string;
  title: string;
  description: string;
  status: SuiteStatus;
  href?: string;
  iconName?: string;
  color?: string;
  stats?: string;
}

export const suites: Suite[] = [
  {
    id: 'suite-1',
    title: '企画準備',
    description:
      'コンテンツの企画から準備までをサポートするツール群。スケジュール管理、台本作成、素材準備などを効率化します。',
    status: 'released',
    href: '/tools/schedule-calendar',
    iconName: 'sparkles',
    color: 'from-[#20B2AA] to-[#20B2AA]',
    stats: '8つのツール',
  },
  {
    id: 'suite-2',
    title: '動画公開',
    description:
      'コンテンツの公開とオーディエンスへのリーチを最大化するツール群。タイトル生成、サムネイル作成、SEO最適化などを自動化します。',
    status: 'development',
    href: '/tools/title-generator',
    iconName: 'trending-up',
    color: 'from-[#FF6B6B] to-[#FF6B6B]',
    stats: '5つのツール',
  },
  {
    id: 'suite-3',
    title: '配信強化',
    description:
      'オーディエンスとのインタラクションを強化するツール群。コメント分析、感情分析、リアルタイム支援などで配信・ライブをサポートします。',
    status: 'development',
    href: '/tools',
    iconName: 'users',
    color: 'from-[#A0A0A0] to-[#A0A0A0]',
    stats: '6つのツール',
  },
];

