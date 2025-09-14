import { StatusFilter } from "@/components/ui/status-filter";

// ダミーデータ
const tools = [
  {
    id: "tool-1",
    title: "スケジュールカレンダー",
    description: "配信スケジュールを管理するツール。",
    status: "released",
    href: "/tools/schedule-calendar", // リンクを追加
  },
  {
    id: "tool-2",
    title: "動画タイトル・概要欄自動生成AI",
    description: "AIが動画のタイトルと概要欄を自動生成。",
    status: "beta",
    feedbackMessage: "フィードバックお待ちしております！",
  },
  {
    id: "tool-3",
    title: "バーチャル背景自動生成AI",
    description: "AIが配信用のバーチャル背景を自動生成。",
    status: "development",
  },
  {
    id: "tool-4",
    title: "コメント感情分析ツール",
    description: "視聴者のコメントから感情を分析。",
    status: "released",
  },
  {
    id: "tool-5",
    title: "サムネイル自動生成ツール",
    description: "動画のサムネイルをAIが自動生成。",
    status: "beta",
    feedbackMessage: "フィードバックお待ちしております！",
  },
  {
    id: "tool-6",
    title: "歌ってみた支援ソフト",
    description: "歌ってみた動画制作をサポート。",
    status: "development",
  },
  {
    id: "tool-7",
    title: "企画・台本サポートAI",
    description: "配信の企画や台本作成をAIがサポート。",
    status: "released",
  },
  {
    id: "tool-8",
    title: "切り抜き動画作成支援ソフト",
    description: "ハイライトから簡単切り抜き。",
    status: "beta",
    feedbackMessage: "フィードバックお待ちしております！",
  },
  {
    id: "tool-9",
    title: "AI自動編集アシスタント",
    description: "長尺動画の編集をAIが自動化。",
    status: "development",
  },
  {
    id: "tool-10",
    title: "ASMR配信向け音響調整ソフト",
    description: "ASMR配信に特化した音響調整機能。",
    status: "released",
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