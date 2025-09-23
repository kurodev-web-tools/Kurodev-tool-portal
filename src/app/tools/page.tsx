import { StatusFilter } from "@/components/ui/status-filter";

// ダミーデータ
const tools = [
  {
    id: "tool-1",
    title: "スケジュールカレンダー",
    description: "配信スケジュールを管理するツール。",
    status: "beta",
    href: "/tools/schedule-calendar",
    feedbackMessage: "フィードバックお待ちしております！",
  },
  {
    id: "tool-7",
    title: "企画・台本サポートAI",
    description: "配信の企画や台本作成をAIがサポート。",
    status: "beta",
    href: "/tools/script-generator",
    feedbackMessage: "フィードバックお待ちしております！",
  },
  {
    id: "tool-5",
    title: "サムネイル自動生成ツール",
    description: "動画のサムネイルをAIが自動生成。",
    status: "beta",
    href: "/tools/thumbnail-generator",
    feedbackMessage: "フィードバックお待ちしております！",
  },
  {
    id: "tool-11",
    title: "コンセプト・ブランディング提案",
    description: "AIがあなたのブランドコンセプトを提案します。",
    status: "development",
    href: "/tools/branding-generator",
  },
  {
    id: "tool-2",
    title: "動画タイトル・概要欄自動生成AI",
    description: "AIが動画のタイトルと概要欄を自動生成。",
    status: "development",
    href: "/tools/title-generator",
  },
    {
    id: "tool-12",
    title: "配信スケジュール自動調整",
    description: "コラボ相手との配信スケジュールを自動調整。",
    status: "development",
    href: "/tools/schedule-adjuster",
  },
  {
    id: "tool-13",
    title: "イベント用素材制作",
    description: "Canvaのようにイベント用の素材を制作。",
    status: "development",
  },
  {
    id: "tool-3",
    title: "バーチャル背景自動生成AI",
    description: "AIが配信用のバーチャル背景を自動生成。",
    status: "development",
  },
] as const;

export default async function ToolsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">個別ツール一覧</h1>
      <p className="text-lg mb-8">
        VTuber活動を支援する個別のツールをご紹介します。
      </p>
      <StatusFilter items={tools} gridCols={4} />
    </div>
  );
}