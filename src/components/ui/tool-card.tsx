import Link from "next/link"; // Linkをインポート
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";

type ToolStatus = "released" | "beta" | "development";

interface ToolCardProps {
  title: string;
  description: string;
  status: ToolStatus;
  feedbackMessage?: string;
  hoverable?: boolean;
  href?: string; // href を追加
}

export function ToolCard({
  title,
  description,
  status,
  feedbackMessage,
  hoverable = false,
  href, // href を受け取る
}: ToolCardProps) {
  const statusMap = {
    released: { text: "公開中", variant: "default" },
    beta: { text: "ベータ版", variant: "warning" }, // ここを修正
    development: { text: "開発中", variant: "danger" }, // ここを修正
  };

  const currentStatus = statusMap[status];
  let cardClasses: string = ""; // cardClassesを定義

  switch (status) {
    case "released":
      cardClasses = "bg-blue-100 text-blue-800"; // 薄い青
      break;
    case "beta":
      cardClasses = "bg-yellow-100 text-yellow-800"; // 薄い黄色
      break;
    case "development":
      cardClasses = "bg-red-100 text-red-800"; // 薄い赤
      break;
    default:
      break;
  }

  return (
    <Link href={href || "#"} passHref> {/* href があれば Link でラップ */}
      <Card className={`h-full flex flex-col ${cardClasses}`} hoverable={hoverable}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              {title}
              <Badge variant={currentStatus.variant as "default" | "warning" | "danger"}>{currentStatus.text}</Badge>
            </CardTitle>
            <CardDescription className="dark:text-black">{description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {status === "beta" && feedbackMessage && (
              <p className="text-sm text-yellow-800">{feedbackMessage}</p>
            )}
          </CardContent>
          <CardFooter>
            {/* ここに詳細リンクやボタンなどを追加できます */}
          </CardFooter>
        </Card>
    </Link>
  );
}