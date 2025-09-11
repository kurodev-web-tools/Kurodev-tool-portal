export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">利用規約</h1>
      <p className="text-lg mb-8">
        この利用規約は、VTuberツールポータル（以下「当サービス」といいます）が提供するサービスの利用に関する条件を定めるものです。
      </p>
      <h2 className="text-2xl font-semibold mb-4">1. 適用</h2>
      <p className="mb-4">
        本規約は、ユーザーと当サービスとの間の、当サービスの利用に関わる一切の関係に適用されるものとします。
      </p>
      <h2 className="text-2xl font-semibold mb-4">2. 利用登録</h2>
      <p className="mb-4">
        当サービスにおいて利用登録が必要な場合、ユーザーは当サービスの定める方法によって利用登録を申請し、当サービスがこれを承認することによって、利用登録が完了するものとします。
      </p>
      <h2 className="text-2xl font-semibold mb-4">3. 禁止事項</h2>
      <p className="mb-4">
        ユーザーは、当サービスの利用にあたり、以下の行為をしてはなりません。
      </p>
      <ul className="list-disc list-inside mb-8">
        <li>法令または公序良俗に違反する行為</li>
        <li>犯罪行為に関連する行為</li>
        <li>当サービスのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
        <li>当サービスの運営を妨害するおそれのある行為</li>
        <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
        <li>不正アクセスをする、またはこれを試みる行為</li>
        <li>当サービスが許諾しない方法で、当サービスに関する広告、宣伝、勧誘、または営業行為を行う行為</li>
        <li>その他、当サービスが不適切と判断する行為</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-4">4. 免責事項</h2>
      <p className="mb-4">
        当サービスは、当サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。
      </p>
      <h2 className="text-2xl font-semibold mb-4">5. 規約の変更</h2>
      <p className="mb-4">
        当サービスは、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
      </p>
    </div>
  );
}