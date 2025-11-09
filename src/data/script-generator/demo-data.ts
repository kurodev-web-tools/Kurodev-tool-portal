import type { Idea, Script } from '@/app/tools/script-generator/types';

export const demoIdeas: Idea[] = [
  {
    id: 1,
    title: '超絶高難易度ゲームに初見で挑戦！',
    description:
      '視聴者から寄せられた「絶対にクリアできない」と噂のゲームに、何の予備知識もなく挑戦します。絶叫と感動のドラマが生まれること間違いなし！',
    points: ['リアクション芸が光る', '視聴者との一体感が生まれる', '切り抜き動画映えする'],
    category: 'gaming',
    estimatedDuration: 120,
    difficulty: 'hard',
  },
  {
    id: 2,
    title: '視聴者参加型！みんなで決める歌枠セットリスト',
    description:
      '配信中にアンケート機能を使って、次に歌う曲を視聴者に決めてもらうインタラクティブな歌枠。定番曲から意外な曲まで、何が飛び出すか分からない！',
    points: ['ファンサービス満点', 'コメントが盛り上がる', 'アーカイブの再生数も期待できる'],
    category: 'singing',
    estimatedDuration: 90,
    difficulty: 'easy',
  },
  {
    id: 3,
    title: '完全オリジナル！自作ゲームお披露目会',
    description:
      '数ヶ月かけて制作した自作ゲームを、ファンと一緒についにプレイ！開発秘話や裏話を交えながら、感動のエンディングを目指す。',
    points: ['クリエイターとしての一面を見せられる', '独自性が高い', '記念配信に最適'],
    category: 'gaming',
    estimatedDuration: 180,
    difficulty: 'medium',
  },
];

type DemoScript = Pick<Script, 'introduction' | 'body' | 'conclusion'>;

export const demoScript: DemoScript = {
  introduction: '皆さん、こんにちは！〇〇です！今日の配信は、なんと…！',
  body: '（ここでゲームプレイや企画の本編）\nいやー、これは難しい！でも、みんなの応援があるから頑張れる！',
  conclusion:
    'というわけで、今日の配信はここまで！たくさんのコメント、スパチャありがとう！次回もまた見てね！おつ〇〇～！',
};

