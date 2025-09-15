'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { PanelLeftOpen, PanelLeftClose, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from '@/hooks/use-media-query';

function ThumbnailGeneratorView({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false); // Default to closed
  const [selectedTab, setSelectedTab] = React.useState("settings"); // デフォルトは設定タブ
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  React.useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(true); // デスクトップではデフォルトで開く
    }
  }, [isDesktop]);

  return (
    <div className="relative flex flex-col lg:h-screen bg-gray-900 text-white font-sans">
      {/* Mobile-only drawer open button */}
      <div className="absolute top-4 right-4 z-20 lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
          <PanelLeftOpen className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row flex-grow lg:h-full lg:overflow-y-auto">
        <main className="flex-grow p-4 w-full lg:w-auto">
          {children} {/* ここにpage.tsxの内容がレンダリングされる */}
        </main>

        {/* Overlay for mobile when drawer is open */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar/Drawer */}
        <aside
          className={[
            "fixed top-0 right-0 h-full w-4/5 max-w-sm bg-background p-4 border-l z-40",
            "transition-transform duration-300 ease-in-out",
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full',
            "lg:static lg:w-1/4 lg:translate-x-0 lg:z-auto",
            isSidebarOpen ? 'lg:block' : 'lg:hidden'
          ].join(' ')}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">設定パネル</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
              <PanelLeftClose className="h-5 w-5" />
            </Button>
          </div>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-1"> {/* タブは1つなのでgrid-cols-1 */}
              <TabsTrigger value="settings">設定</TabsTrigger>
            </TabsList>
            <TabsContent value="settings" className="mt-4">
              {/* ここに現在の設定パネルの内容が入る */}
              <div className="h-full border border-gray-700 p-4"> {/* p-4を追加 */}
                <h2 className="text-xl font-semibold mb-4">設定パネル</h2>
                <p className="text-gray-400">ここに設定パネル（テンプレート選択、テキスト入力など）が入ります。</p>
              </div>
            </TabsContent>
          </Tabs>
        </aside>

        {/* Icon bar for PC when sidebar is closed */}
        {!isSidebarOpen && (
          <div className="hidden lg:flex p-4 border-l flex-shrink-0 flex-col items-center justify-start space-y-4">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
              <PanelLeftOpen className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { setIsSidebarOpen(true); setSelectedTab("settings"); }}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ThumbnailGeneratorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThumbnailGeneratorView>{children}</ThumbnailGeneratorView>
  );
}
