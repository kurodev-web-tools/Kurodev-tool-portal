"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ToolCard } from "@/components/ui/tool-card"; // ToolCardをインポート

interface Item {
  id: string;
  title: string;
  description: string;
  status: "released" | "beta" | "development";
  feedbackMessage?: string;
  href?: string;
}

interface StatusFilterProps {
  items: readonly Item[];
  gridCols?: 3 | 4;
}

export function StatusFilter({ items, gridCols = 3 }: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.push(pathname + "?" + params.toString(), { scroll: false });
  };

  const currentStatus = searchParams.get("status") || "all";

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

  return (
    <>
      <ToggleGroup
        type="single"
        value={currentStatus}
        onValueChange={handleFilterChange}
        className="mb-4"
      >
        <ToggleGroupItem value="all" aria-label="すべてのステータス">
          すべて
        </ToggleGroupItem>
        <ToggleGroupItem value="released" aria-label="公開済み">
          公開済み
        </ToggleGroupItem>
        <ToggleGroupItem value="beta" aria-label="ベータ版">
          ベータ版
        </ToggleGroupItem>
        <ToggleGroupItem value="development" aria-label="開発中">
          開発中
        </ToggleGroupItem>
      </ToggleGroup>
      <div className={`grid grid-cols-1 md:grid-cols-2 ${gridLayout[gridCols]} gap-4 auto-rows-[8rem]`}>
        {filteredAndSortedItems.map((item) => (
          <ToolCard
            key={item.id}
            title={item.title}
            description={item.description}
            status={item.status}
            feedbackMessage={item.feedbackMessage}
            hoverable={true}
            href={item.href}
          />
        ))}
      </div>
    </>
  );
}