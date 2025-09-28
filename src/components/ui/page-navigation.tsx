'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Grid3X3, 
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageNavigationProps {
  className?: string;
  showQuickNav?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavItem[] = [
  {
    id: 'quick-access',
    label: 'クイックアクセス',
    href: '#quick-access',
    icon: Zap
  },
  {
    id: 'suites',
    label: '連鎖ツールスイート',
    href: '#suites',
    icon: Grid3X3
  },
  {
    id: 'statistics',
    label: '詳細統計',
    href: '#statistics',
    icon: BarChart3
  }
];

export function PageNavigation({ 
  className, 
  showQuickNav = true 
}: PageNavigationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  // スクロール位置を監視
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsVisible(scrollTop > 300);

      // アクティブセクションを判定
      const sections = navigationItems.map(item => ({
        id: item.id,
        element: document.querySelector(item.href)
      }));

      for (const section of sections) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      const headerHeight = 80; // ヘッダーの高さを考慮
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - headerHeight,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  if (!isVisible && !showQuickNav) {
    return null;
  }

  return (
    <>
      {/* デスクトップナビゲーション */}
      <div className={cn(
        "hidden lg:flex fixed right-6 top-24 z-40",
        "flex-col space-y-2",
        className
      )}>
        {showQuickNav && (
          <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-1 shadow-xl min-w-[120px]">
            {navigationItems.map((item) => (
                     <Button
                       key={item.id}
                       variant="ghost"
                       size="sm"
                       onClick={() => scrollToSection(item.href)}
                       className={cn(
                         "w-full justify-start text-xs text-gray-200 hover:text-blue-300 hover:bg-blue-500/20 h-10 px-2 touch-manipulation border border-gray-600 hover:border-blue-400",
                         activeSection === item.id && "text-blue-300 bg-blue-500/20 border-blue-400"
                       )}
                     >
                <item.icon className="h-3 w-3 mr-1" />
                <span className="truncate">{item.label}</span>
              </Button>
            ))}
          </div>
        )}

      </div>

      {/* モバイルナビゲーション */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <div className="flex flex-col space-y-2">
          {/* メニューボタン */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-12 h-12 p-0 bg-gray-900/95 backdrop-blur-sm border border-gray-600 text-gray-200 hover:text-blue-300 hover:bg-blue-500/20 hover:border-blue-400 rounded-full shadow-xl touch-manipulation"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* モバイルメニュー */}
          {isMobileMenuOpen && (
            <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl min-w-[200px]">
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => scrollToSection(item.href)}
                    className={cn(
                      "w-full justify-start text-sm text-gray-200 hover:text-blue-300 hover:bg-blue-500/20 h-10 px-3 touch-manipulation border border-gray-600 hover:border-blue-400",
                      activeSection === item.id && "text-blue-300 bg-blue-500/20 border-blue-400"
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                ))}
                
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
