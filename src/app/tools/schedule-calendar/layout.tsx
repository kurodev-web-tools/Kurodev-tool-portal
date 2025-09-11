export default function ScheduleCalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Tool-specific navigation can go here later, e.g., tabs for calendar views */}
      <div className="flex flex-grow">
        {/* Main content area (left ~70%) */}
        <main className="flex-grow w-full lg:w-3/4 p-4">
          {children}
        </main>
        {/* Sidebar area (right ~30%) */}
        <aside className="hidden lg:block w-1/4 p-4 border-l">
          {/* Sidebar content will go here */}
          <h2 className="text-xl font-semibold mb-4">サイドパネル</h2>
          <p>ここに予定管理やSNS投稿の設定が入ります。</p>
        </aside>
      </div>
    </div>
  );
}