'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CalendarPlus, MessageSquare, Settings, Plus } from "lucide-react";
import { ScheduleModal } from '@/components/schedule/schedule-modal';
import { ScheduleProvider, useSchedule } from '@/contexts/ScheduleContext';
import { ScheduleList } from '@/components/schedule/schedule-list';
import { SnsPostTab } from '@/app/tools/schedule-calendar/components/sns-post-tab';
import { SettingsTab, SettingsProvider } from '@/app/tools/schedule-calendar/components/settings-tab';
import { useSidebar } from '@/hooks/use-sidebar';
import { Sidebar, SidebarToggle } from '@/components/layouts/Sidebar';

function ScheduleCalendarView({ children }: { children: React.ReactNode }) {
  const { isOpen: isSidebarOpen, setIsOpen: setIsSidebarOpen, isDesktop } = useSidebar({
    defaultOpen: false,
    desktopDefaultOpen: true,
  });
  const [selectedTab, setSelectedTab] = React.useState("schedule-management");
  const { setIsModalOpen } = useSchedule();

  // サイドバーコンテンツ
  const sidebarContent = (
    <div className="w-full">
      {isDesktop ? (
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
            <TabsTrigger value="schedule-management">予定管理</TabsTrigger>
            <TabsTrigger value="sns-posting">SNS投稿</TabsTrigger>
            <TabsTrigger value="settings">設定</TabsTrigger>
          </TabsList>
          <div className="flex-1">
            <TabsContent value="schedule-management" className="mt-4">
              <div className="space-y-4">
                <Button onClick={() => setIsModalOpen(true)}>予定を追加</Button>
                <ScheduleList />
              </div>
            </TabsContent>
            <TabsContent value="sns-posting" className="mt-4">
              <SnsPostTab />
            </TabsContent>
            <TabsContent value="settings" className="mt-4">
              <SettingsTab />
            </TabsContent>
          </div>
        </Tabs>
      ) : (
        // モバイル表示では設定タブのみ
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">設定</h3>
          <SettingsTab />
        </div>
      )}
    </div>
  );

  return (
    <div className="relative flex flex-col h-screen overflow-hidden">
      {/* モバイル用オーバーレイ（サイドバーが開いている時のみ表示） */}
      {isSidebarOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col lg:flex-row flex-grow h-full overflow-hidden">
        <main className="flex-grow p-2 lg:p-4 w-full lg:w-auto overflow-hidden">
          {children}
        </main>

        {/* サイドバーが閉じている場合の開くボタン */}
        {!isSidebarOpen && (
          <SidebarToggle
            onOpen={() => setIsSidebarOpen(true)}
            isDesktop={isDesktop}
            tabs={[
              { id: "schedule-management", label: "予定", icon: <CalendarPlus className="h-4 w-4" /> },
              { id: "sns-posting", label: "SNS", icon: <MessageSquare className="h-4 w-4" /> },
              { id: "settings", label: "設定", icon: <Settings className="h-4 w-4" /> }
            ]}
            onTabClick={setSelectedTab}
          />
        )}

        {/* サイドバー */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          title=""
          isDesktop={isDesktop}
          className="lg:w-1/4"
        >
          {sidebarContent}
        </Sidebar>
      </div>
      
      <ScheduleModal />

      {/* Floating Action Button for Mobile - Fixed Position */}
      <div className="fixed bottom-4 right-4 z-20 lg:hidden">
        <Button
          size="icon"
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

export default function ScheduleCalendarLayout({ children }: { children:React.ReactNode }) {
  return (
    <ScheduleProvider>
      <SettingsProvider>
        <ScheduleCalendarView>{children}</ScheduleCalendarView>
      </SettingsProvider>
    </ScheduleProvider>
  );
}