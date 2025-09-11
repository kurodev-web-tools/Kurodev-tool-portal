import { StatusFilter } from "@/components/ui/status-filter"; // StatusFilterをインポート

// ダミーデータ
const suites = [
  {
    id: "suite-1",
    title: "企画準備",
    description: "配信の企画から準備までをサポートするツール群。",
    status: "released",
  },
  {
    id: "suite-2",
    title: "動画公開",
    description: "動画の公開と視聴者へのリーチを最大化するツール群。",
    status: "beta",
    feedbackMessage: "フィードバックお待ちしております！",
  },
  {
    id: "suite-3",
    title: "配信強化",
    description: "視聴者とのインタラクションを強化するツール群。",
    status: "development",
  },
] as const;

export default async function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">VTuber配信ワークフロー連鎖ツール</h1>
      <p className="text-lg mb-8">
        VTuberの配信ワークフローを強力にサポートする連鎖ツールをご紹介します。
      </p>
      <h2 className="text-2xl font-semibold mb-4">連鎖ツールスイート</h2>
      <StatusFilter items={suites} gridCols={3} />
    </div>
  );
}