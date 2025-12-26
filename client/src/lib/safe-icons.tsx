import { lazy, Suspense, type ComponentType } from "react";
import type { LucideProps } from "lucide-react";

type IconComponent = ComponentType<LucideProps>;

const iconModules: Record<string, IconComponent | null> = {};
let iconLoadPromise: Promise<typeof import("lucide-react")> | null = null;

function loadIcons() {
  if (!iconLoadPromise) {
    iconLoadPromise = import("lucide-react");
  }
  return iconLoadPromise;
}

export function getSafeIcon(name: string): IconComponent | null {
  if (iconModules[name] !== undefined) {
    return iconModules[name];
  }
  
  try {
    const lucide = require("lucide-react");
    if (lucide && lucide[name]) {
      iconModules[name] = lucide[name];
      return iconModules[name];
    }
  } catch (e) {
    return null;
  }
  
  return null;
}

export function SafeIcon({ 
  name, 
  className = "", 
  ...props 
}: { 
  name: string; 
  className?: string;
} & Partial<LucideProps>) {
  const Icon = getSafeIcon(name);
  
  if (!Icon) {
    return <span className={`inline-block w-4 h-4 ${className}`} />;
  }
  
  return <Icon className={className} {...props} />;
}

export function createIconGetter() {
  const iconCache: Record<string, IconComponent | null> = {};
  
  return function getIcon(name: string): IconComponent {
    if (iconCache[name]) {
      return iconCache[name]!;
    }
    
    try {
      const lucide = require("lucide-react");
      if (lucide && lucide[name]) {
        iconCache[name] = lucide[name];
        return iconCache[name]!;
      }
    } catch (e) {
      return () => null;
    }
    
    return () => null;
  };
}

export const getIcon = createIconGetter();
