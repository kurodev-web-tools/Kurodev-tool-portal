'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen, PanelLeftClose, CalendarPlus, MessageSquare, Settings } from "lucide-react";
import { ScheduleModal } from '@/components/schedule/schedule-modal';
import { ScheduleProvider, useSchedule } from '@/contexts/ScheduleContext';
import { ScheduleList } from '@/components/schedule/schedule-list';
import { SnsPostTab } from '@/app/tools/schedule-calendar/components/sns-post-tab';
import { SettingsTab, SettingsProvider } from '@/app/tools/schedule-calendar/components/settings-tab';

function ScheduleCalendarView({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [selectedTab, setSelectedTab] = React.useState("schedule-management");
  const { setIsModalOpen } = useSchedule();

  return (
    <div className="flex flex-col lg:h-screen">
      <div className="flex flex-col lg:flex-row flex-grow lg:h-full lg:overflow-y-auto">
        <main className={`flex-grow p-4 w-full ${isSidebarOpen ? "lg:w-3/4" : "lg:w-full"}`}>
          {children}
        </main>
        <aside className={`p-4 border-l flex-shrink-0 w-full lg:w-1/4 ${isSidebarOpen ? 'block' : 'hidden'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">サイドパネル</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
            </Button>
          </div>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="schedule-management">予定管理</TabsTrigger>
              <TabsTrigger value="sns-posting">SNS投稿</TabsTrigger>
              <TabsTrigger value="settings">設定</TabsTrigger>
            </TabsList>
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
          </Tabs>
        </aside>
        {!isSidebarOpen && (
          <div className="hidden lg:flex p-4 border-l flex-shrink-0 flex-col items-center justify-start space-y-4">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
              <PanelLeftOpen className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { setIsSidebarOpen(true); setSelectedTab("schedule-management"); }}>
              <CalendarPlus className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { setIsSidebarOpen(true); setSelectedTab("sns-posting"); }}>
              <MessageSquare className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { setIsSidebarOpen(true); setSelectedTab("settings"); }}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
      <ScheduleModal />
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
