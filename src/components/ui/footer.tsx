import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
        <nav className="flex space-x-4 mt-4 md:mt-0">
          <Link href="/privacy-policy" className="hover:underline">
            プライバシーポリシー
          </Link>
          <Link href="/terms-of-service" className="hover:underline">
            利用規約
          </Link>
        </nav>
      </div>
    </footer>
  );
}