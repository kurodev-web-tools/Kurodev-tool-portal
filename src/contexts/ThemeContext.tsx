'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemePreferences {
  primaryColor: string;
  layout: 'grid' | 'list';
  animations: 'subtle' | 'enhanced' | 'minimal';
  brightness: 'normal' | 'dim' | 'bright';
  contrast: 'normal' | 'high';
}

interface ThemeContextType {
  preferences: ThemePreferences;
  updatePreferences: (updates: Partial<ThemePreferences>) => void;
  resetToDefault: () => void;
}

const defaultPreferences: ThemePreferences = {
  primaryColor: '#20B2AA', // Blue 500
  layout: 'grid',
  animations: 'enhanced',
  brightness: 'normal',
  contrast: 'normal',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<ThemePreferences>(defaultPreferences);

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPreferences = localStorage.getItem('vtuber-tools-theme-preferences');
      if (savedPreferences) {
        try {
          const parsed = JSON.parse(savedPreferences);
          setPreferences({ ...defaultPreferences, ...parsed });
        } catch (error) {
          console.error('Failed to parse theme preferences:', error);
        }
      }
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vtuber-tools-theme-preferences', JSON.stringify(preferences));
    }
  }, [preferences]);

  const updatePreferences = (updates: Partial<ThemePreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const resetToDefault = () => {
    setPreferences(defaultPreferences);
  };

  return (
    <ThemeContext.Provider value={{ preferences, updatePreferences, resetToDefault }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a CustomThemeProvider');
  }
  return context;
}

// Theme utility functions
export function getPersonalizedTheme(preferences: ThemePreferences) {
  const colorMap = {
    '#20B2AA': 'warm-cyan',      // Blue 500
    '#f59e0b': 'amber',     // Amber 500
    '#06b6d4': 'cyan',      // Cyan 500
    '#8b5cf6': 'violet',    // Violet 500
    '#10b981': 'emerald',   // Emerald 500
  };

  const animationMap = {
    subtle: 'transition-all duration-200',
    enhanced: 'transition-all duration-400',
    minimal: 'transition-none',
  };

  const brightnessMap = {
    normal: 'brightness-100',
    dim: 'brightness-75',
    bright: 'brightness-125',
  };

  return {
    primaryColor: preferences.primaryColor,
    primaryColorName: colorMap[preferences.primaryColor as keyof typeof colorMap] || 'blue',
    layout: preferences.layout,
    animationClass: animationMap[preferences.animations],
    brightnessClass: brightnessMap[preferences.brightness],
    contrast: preferences.contrast,
  };
}
