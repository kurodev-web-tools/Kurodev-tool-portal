import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleForm } from "@/components/schedule/schedule-form"; // Import ScheduleForm

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
          <h2 className="text-xl font-semibold mb-4">サイドパネル</h2>
          <Tabs defaultValue="schedule-management" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="schedule-management">予定管理</TabsTrigger>
              <TabsTrigger value="sns-posting">SNS投稿</TabsTrigger>
            </TabsList>
            <TabsContent value="schedule-management" className="mt-4">
              <div className="space-y-4">
                {/* Place ScheduleForm here */}
                <ScheduleForm />
              </div>
            </TabsContent>
            <TabsContent value="sns-posting" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">SNS投稿</h3>
                <p>ここにSNS投稿文の生成機能が表示されます。</p>
              </div>
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}