'use client';

import { useEffect, useState } from 'react';

interface ContextualDisplay {
  theme: 'day' | 'night' | 'auto';
  brightness: 'normal' | 'dim' | 'bright';
  recommendedTools: string[];
  greeting: string;
}

export function useContextualDisplay() {
  const [context, setContext] = useState<ContextualDisplay>({
    theme: 'auto',
    brightness: 'normal',
    recommendedTools: [],
    greeting: 'おはようございます',
  });

  useEffect(() => {
    const updateContext = () => {
      const hour = new Date().getHours();
      const isNight = hour >= 22 || hour <= 6;
      const isEvening = hour >= 18 && hour < 22;
      const isMorning = hour >= 6 && hour < 12;

      // Determine theme based on time
      let theme: 'day' | 'night' | 'auto' = 'auto';
      let brightness: 'normal' | 'dim' | 'bright' = 'normal';
      let greeting = 'こんにちは';

      if (isNight) {
        theme = 'night';
        brightness = 'dim';
        greeting = 'こんばんは！お疲れ様です！';
      } else if (isMorning) {
        theme = 'day';
        brightness = 'bright';
        greeting = 'おはようございます！今日も配信頑張りましょう！';
      } else if (isEvening) {
        theme = 'day';
        brightness = 'normal';
        greeting = 'こんばんは！配信の準備はできていますか？';
      } else {
        greeting = 'こんにちは！お疲れ様です！';
      }

      // Recommend tools based on time
      const recommendedTools = getRecommendedTools(hour);

      setContext({
        theme,
        brightness,
        recommendedTools,
        greeting,
      });
    };

    // Update context immediately
    updateContext();

    // Update context every hour
    const interval = setInterval(updateContext, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return context;
}

function getRecommendedTools(hour: number): string[] {
  const tools = {
    morning: ['schedule-calendar', 'script-generator', 'branding-generator'],
    afternoon: ['thumbnail-generator', 'title-generator', 'asset-creator'],
    evening: ['virtual-bg-generator', 'schedule-adjuster'],
    night: ['schedule-calendar', 'script-generator'],
  };

  if (hour >= 6 && hour < 12) {
    return tools.morning;
  } else if (hour >= 12 && hour < 18) {
    return tools.afternoon;
  } else if (hour >= 18 && hour < 22) {
    return tools.evening;
  } else {
    return tools.night;
  }
}

// Context-aware CSS classes
export function getContextualClasses(context: ContextualDisplay) {
  const brightnessClasses = {
    normal: 'brightness-100',
    dim: 'brightness-75',
    bright: 'brightness-125',
  };

  const themeClasses = {
    day: 'bg-slate-50 text-slate-900',
    night: 'bg-slate-900 text-slate-100',
    auto: 'bg-slate-800 text-slate-100',
  };

  return {
    brightness: brightnessClasses[context.brightness],
    theme: themeClasses[context.theme],
    container: `${brightnessClasses[context.brightness]} ${themeClasses[context.theme]}`,
  };
}
