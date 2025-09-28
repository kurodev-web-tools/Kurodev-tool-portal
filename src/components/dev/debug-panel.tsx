'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Download, Trash2, Eye, EyeOff, Bug, Database, Clock, MemoryStick } from 'lucide-react';
import { logger, LogLevel, LogEntry } from '@/lib/logger';
import { toast } from 'sonner';

interface DebugPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function DebugPanel({ isOpen, onToggle }: DebugPanelProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel>(LogLevel.DEBUG);
  const [memoryInfo, setMemoryInfo] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setLogs(logger.getLogs());
      updateMemoryInfo();
      updatePerformanceMetrics();
    }
  }, [isOpen]);

  const updateMemoryInfo = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMemoryInfo({
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
      });
    }
  };

  const updatePerformanceMetrics = () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      setPerformanceMetrics({
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      });
    }
  };

  const filteredLogs = logs.filter(log => log.level >= selectedLevel);

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.DEBUG: return 'bg-gray-500';
      case LogLevel.INFO: return 'bg-blue-500';
      case LogLevel.WARN: return 'bg-yellow-500';
      case LogLevel.ERROR: return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getLevelName = (level: LogLevel) => {
    return LogLevel[level];
  };

  const copyLogs = () => {
    const logText = filteredLogs.map(log => 
      `${log.timestamp} [${getLevelName(log.level)}] ${log.component ? `[${log.component}]` : ''}: ${log.message}${log.data ? `\nData: ${JSON.stringify(log.data, null, 2)}` : ''}`
    ).join('\n');
    
    navigator.clipboard.writeText(logText);
    toast.success('ログをクリップボードにコピーしました');
  };

  const downloadLogs = () => {
    const logData = logger.exportLogs();
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('ログをダウンロードしました');
  };

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
    toast.success('ログをクリアしました');
  };

  const refreshData = () => {
    setLogs(logger.getLogs());
    updateMemoryInfo();
    updatePerformanceMetrics();
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 bg-gray-900 border-gray-700 hover:bg-gray-800"
      >
        <Bug className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-96 z-50 bg-gray-900 border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bug className="h-4 w-4" />
            デバッグパネル
          </CardTitle>
          <div className="flex gap-1">
            <Button
              onClick={refreshData}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              onClick={onToggle}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <EyeOff className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-3">
        <Tabs defaultValue="logs" className="h-full">
          <TabsList className="grid w-full grid-cols-3 mb-2">
            <TabsTrigger value="logs" className="text-xs">ログ</TabsTrigger>
            <TabsTrigger value="memory" className="text-xs">メモリ</TabsTrigger>
            <TabsTrigger value="performance" className="text-xs">パフォーマンス</TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="h-64">
            <div className="space-y-2">
              <div className="flex gap-1 mb-2">
                <Button
                  onClick={copyLogs}
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  コピー
                </Button>
                <Button
                  onClick={downloadLogs}
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  ダウンロード
                </Button>
                <Button
                  onClick={clearLogs}
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  クリア
                </Button>
              </div>

              <div className="flex gap-1 mb-2">
                {Object.values(LogLevel).filter(v => typeof v === 'number').map((level) => (
                  <Button
                    key={level}
                    onClick={() => setSelectedLevel(level as LogLevel)}
                    variant={selectedLevel === level ? "default" : "outline"}
                    size="sm"
                    className={`h-6 text-xs ${selectedLevel === level ? getLevelColor(level as LogLevel) : ''}`}
                  >
                    {getLevelName(level as LogLevel)}
                  </Button>
                ))}
              </div>

              <ScrollArea className="h-48">
                <div className="space-y-1">
                  {filteredLogs.map((log, index) => (
                    <div key={index} className="text-xs p-2 bg-gray-800 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${getLevelColor(log.level)} text-white text-xs px-1 py-0`}>
                          {getLevelName(log.level)}
                        </Badge>
                        <span className="text-gray-400">{log.timestamp.split('T')[1].split('.')[0]}</span>
                        {log.component && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {log.component}
                          </Badge>
                        )}
                      </div>
                      <div className="text-gray-200">{log.message}</div>
                      {log.data && (
                        <pre className="text-xs text-gray-400 mt-1 overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="memory" className="h-64">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MemoryStick className="h-4 w-4" />
                <span className="text-sm font-medium">メモリ使用量</span>
              </div>
              
              {memoryInfo ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>使用中:</span>
                    <span className="text-red-400">{memoryInfo.used}MB</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>合計:</span>
                    <span className="text-blue-400">{memoryInfo.total}MB</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>制限:</span>
                    <span className="text-green-400">{memoryInfo.limit}MB</span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(memoryInfo.used / memoryInfo.limit) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-400">メモリ情報が利用できません</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="h-64">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">パフォーマンス</span>
              </div>
              
              {performanceMetrics ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>DOM Content Loaded:</span>
                    <span className="text-green-400">{performanceMetrics.domContentLoaded}ms</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Load Complete:</span>
                    <span className="text-blue-400">{performanceMetrics.loadComplete}ms</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>First Paint:</span>
                    <span className="text-yellow-400">{performanceMetrics.firstPaint}ms</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>First Contentful Paint:</span>
                    <span className="text-purple-400">{performanceMetrics.firstContentfulPaint}ms</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-400">パフォーマンス情報が利用できません</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
