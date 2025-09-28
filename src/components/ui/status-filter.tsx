"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ToolCard } from "@/components/ui/tool-card"; // ToolCardをインポート
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Item {
  id: string;
  title: string;
  description: string;
  status: "released" | "beta" | "development";
  feedbackMessage?: string;
  href?: string;
  iconName?: string;
  color?: string;
  stats?: string;
}

interface StatusFilterProps {
  items: readonly Item[];
  gridCols?: 3 | 4;
  layout?: "grid" | "list";
  onItemClick?: (item: Item) => void;
}

export function StatusFilter({ items, gridCols = 3, layout = "grid", onItemClick }: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');

    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.push(pathname + "?" + params.toString(), { scroll: false });
  };

  const currentStatus = searchParams?.get("status") || "all";

  const sortedItems = [...items].sort((a, b) => {
    const order = {
      released: 1,
      beta: 2,
      development: 3,
    };
    return order[a.status] - order[b.status];
  });

  const filteredAndSortedItems = sortedItems.filter((item) => {
    if (currentStatus === "all") {
      return true;
    }
    return currentStatus === item.status;
  });

  const gridLayout = {
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
  };

  // アイコンマッピング
  const iconMap = {
    "sparkles": "✨",
    "trending-up": "📈",
    "users": "👥",
    "calendar": "📅",
    "image": "🖼️",
    "brain": "🧠",
    "bar-chart": "📊",
  };

  const statusMap = {
    released: { text: "公開中", color: "bg-green-100 text-green-800 border-green-200" },
    beta: { text: "ベータ版", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    development: { text: "開発中", color: "bg-red-100 text-red-800 border-red-200" },
  };

  return (
    <>
      <ToggleGroup
        type="single"
        value={currentStatus}
        onValueChange={handleFilterChange}
        className="mb-4 md:mb-6 bg-gray-900/50 backdrop-blur-sm p-1 rounded-lg shadow-lg border border-gray-700/50 flex flex-wrap gap-1"
      >
        <ToggleGroupItem 
          value="all" 
          aria-label="すべてのステータス"
          className="text-xs md:text-sm font-medium text-gray-300 data-[state=on]:bg-gradient-to-r data-[state=on]:from-blue-500 data-[state=on]:to-cyan-500 data-[state=on]:text-white data-[state=on]:shadow-lg transition-all duration-200 hover:text-blue-400 px-4 py-2 tracking-normal"
        >
          すべて
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="released" 
          aria-label="公開済み"
          className="text-xs md:text-sm font-medium text-gray-300 data-[state=on]:bg-gradient-to-r data-[state=on]:from-green-500 data-[state=on]:to-emerald-500 data-[state=on]:text-white data-[state=on]:shadow-lg transition-all duration-200 hover:text-green-400 px-4 py-2 tracking-normal"
        >
          公開済み
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="beta" 
          aria-label="ベータ版"
          className="text-xs md:text-sm font-medium text-gray-300 data-[state=on]:bg-gradient-to-r data-[state=on]:from-yellow-500 data-[state=on]:to-orange-500 data-[state=on]:text-white data-[state=on]:shadow-lg transition-all duration-200 hover:text-yellow-400 px-4 py-2 tracking-normal"
        >
          ベータ版
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="development" 
          aria-label="開発中"
          className="text-xs md:text-sm font-medium text-gray-300 data-[state=on]:bg-gradient-to-r data-[state=on]:from-red-500 data-[state=on]:to-orange-500 data-[state=on]:text-white data-[state=on]:shadow-lg transition-all duration-200 hover:text-red-400 px-4 py-2 tracking-normal"
        >
          開発中
        </ToggleGroupItem>
      </ToggleGroup>
      
      {layout === "grid" ? (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}>
          {filteredAndSortedItems.map((item, index) => (
            <div
              key={item.id}
              className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ToolCard
                id={item.id}
                title={item.title}
                description={item.description}
                status={item.status}
                feedbackMessage={item.feedbackMessage}
                hoverable={true}
                href={item.href}
                iconName={item.iconName}
                color={item.color}
                stats={item.stats}
                onClick={() => onItemClick?.(item)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAndSortedItems.map((item, index) => {
            const iconEmoji = item.iconName ? iconMap[item.iconName as keyof typeof iconMap] || "🔧" : "🔧";
            const currentStatus = statusMap[item.status];
            
            return (
              <div
                key={item.id}
                className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 bg-gray-900/30 hover:bg-gray-900/40 border border-gray-800 rounded-lg p-4 transition-all duration-300 hover:shadow-lg group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg text-xl">
                      {iconEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-semibold text-white group-hover:text-blue-400 transition-colors leading-tight tracking-wide">
                        {item.title}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-400 truncate leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={`text-xs font-medium ${currentStatus.color}`}>
                      {currentStatus.text}
                    </Badge>
                    {item.href && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="group-hover:bg-blue-600 group-hover:text-white transition-colors"
                        asChild
                      >
                        <Link href={item.href} className="flex items-center gap-1">
                          使用する
                          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}