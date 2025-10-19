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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
      setIsVisible(scrollTop > 200);

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
    <TooltipProvider>
      {/* デスクトップナビゲーション */}
      <div className={cn(
        "hidden lg:flex fixed right-8 top-32 z-40",
        "flex-col space-y-2",
        className
      )}>
        {showQuickNav && (
          <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-sm p-1 shadow-xl min-w-[60px] warm-cyber-glow">
            {navigationItems.map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => scrollToSection(item.href)}
                    className={cn(
                      "w-full justify-center text-xs text-gray-200 hover:text-[#20B2AA] hover:bg-[#20B2AA]/20 h-10 px-1 touch-manipulation border border-gray-600 hover:border-[#20B2AA] cyber-hover",
                      activeSection === item.id && "text-[#20B2AA] bg-[#20B2AA]/20 border-[#20B2AA] warm-cyber-glow"
                    )}
                  >
                    <item.icon className="h-3 w-3" />
                    <span className="sr-only">{item.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-gray-800 border-gray-600 text-gray-200">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}

      </div>

      {/* モバイルナビゲーション */}
      <div className="block lg:hidden">
        {/* フローティングボタン（開くボタンのみ） */}
        {!isMobileMenuOpen && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-12 h-12 p-0 bg-gray-900/95 backdrop-blur-sm border border-gray-600 text-gray-200 hover:text-[#20B2AA] hover:bg-[#20B2AA]/20 hover:border-[#20B2AA] rounded-full shadow-xl touch-manipulation cyber-hover"
            style={{ 
              position: 'fixed', 
              bottom: '20px',
              right: '16px', 
              zIndex: 40 
            }}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <div 
            className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-sm p-3 shadow-xl w-[calc(100vw-32px)] max-w-[200px] min-w-[160px] warm-cyber-glow"
            style={{ 
              position: 'fixed', 
              bottom: '20px', 
              right: '16px', 
              zIndex: 39 
            }}
          >
            {/* メニューヘッダー */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700">
              <span className="text-sm font-medium text-gray-300">メニュー</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 p-0 text-gray-400 hover:text-[#20B2AA] hover:bg-[#20B2AA]/10 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* ナビゲーション項目 */}
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollToSection(item.href)}
                  className={cn(
                    "w-full justify-start text-sm text-gray-200 hover:text-[#20B2AA] hover:bg-[#20B2AA]/20 h-10 px-3 touch-manipulation border border-gray-600 hover:border-[#20B2AA] cyber-hover",
                    activeSection === item.id && "text-[#20B2AA] bg-[#20B2AA]/20 border-[#20B2AA] warm-cyber-glow"
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
    </TooltipProvider>
  );
}
