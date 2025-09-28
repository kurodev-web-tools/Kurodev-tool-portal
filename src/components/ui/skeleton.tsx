import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "skeleton-pulse rounded-md bg-gray-700/50",
        className
      )}
    />
  );
}

// ツールカード用のスケルトン
export function ToolCardSkeleton() {
  return (
    <div className="h-full flex flex-col group border-gray-800 shadow-sm bg-gray-900/30 rounded-lg p-4">
      {/* ヘッダー部分 */}
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      
      {/* タイトル */}
      <Skeleton className="h-6 w-3/4 mb-2" />
      
      {/* 説明文 */}
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      
      {/* 統計情報 */}
      <div className="flex items-center gap-2 mt-auto">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

// 統計カード用のスケルトン
export function StatsCardSkeleton() {
  return (
    <div className="bg-gray-900/30 border-gray-800 rounded-lg p-6">
      {/* アイコンとタイトル */}
      <div className="flex items-center space-x-3 mb-4">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="h-6 w-32" />
      </div>
      
      {/* 数値 */}
      <div className="flex items-baseline space-x-2 mb-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-8" />
      </div>
      
      {/* 説明文 */}
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

// 進捗カード用のスケルトン
export function ProgressCardSkeleton() {
  return (
    <div className="bg-gray-900/30 border-gray-800 rounded-lg p-6">
      {/* タイトル */}
      <div className="flex items-center space-x-2 mb-4">
        <Skeleton className="w-5 h-5 rounded" />
        <Skeleton className="h-6 w-24" />
      </div>
      
      {/* 進捗バー */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-8" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
        <div className="flex items-center justify-between text-xs">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

// クイックアクセス用のスケルトン
export function QuickAccessSkeleton() {
  return (
    <div className="bg-gray-900/30 border-gray-800 rounded-lg p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-24" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
      
      {/* コンテンツ */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/50">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="w-12 h-5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ページ全体用のスケルトン
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>
        
        {/* クイックアクセス */}
        <div className="mb-12">
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <QuickAccessSkeleton key={i} />
            ))}
          </div>
        </div>
        
        {/* ツールスイート */}
        <div className="mb-12">
          <Skeleton className="h-10 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <ToolCardSkeleton key={i} />
            ))}
          </div>
        </div>
        
        {/* 統計情報 */}
        <div>
          <Skeleton className="h-10 w-32 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}