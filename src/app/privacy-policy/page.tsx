export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">プライバシーポリシー</h1>
      <p className="text-lg mb-8">
        このプライバシーポリシーは、VTuberツールポータル（以下「当サービス」といいます）が提供するサービスにおける、ユーザーの個人情報の取り扱いについて定めるものです。
      </p>
      <h2 className="text-2xl font-semibold mb-4">1. 収集する情報</h2>
      <p className="mb-4">
        当サービスでは、以下の情報を収集することがあります。
      </p>
      <ul className="list-disc list-inside mb-8">
        <li>氏名、メールアドレスなどの個人を特定できる情報</li>
        <li>利用状況に関する情報（アクセスログ、利用履歴など）</li>
        <li>その他、当サービスが提供する機能の利用に必要な情報</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-4">2. 情報の利用目的</h2>
      <p className="mb-4">
        収集した情報は、以下の目的で利用します。
      </p>
      <ul className="list-disc list-inside mb-8">
        <li>当サービスの提供・運営のため</li>
        <li>ユーザーからのお問い合わせに対応するため</li>
        <li>当サービスの改善、新機能の開発のため</li>
        <li>利用規約に違反する行為への対応のため</li>
        <li>その他、上記利用目的に付随する目的</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-4">3. 情報の第三者提供</h2>
      <p className="mb-4">
        当サービスは、法令で認められる場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
      </p>
      <h2 className="text-2xl font-semibold mb-4">4. お問い合わせ</h2>
      <p className="mb-4">
        プライバシーポリシーに関するお問い合わせは、お問い合わせフォームよりご連絡ください。
      </p>
    </div>
  );
}