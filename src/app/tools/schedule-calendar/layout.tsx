export default function ScheduleCalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Tool-specific navigation can go here later */}
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}