"use client";

import React from "react";
import { Category } from "@/types";
import {
  Utensils,
  Flame,
  Sandwich,
  Beef,
  Sparkles,
  Boxes,
  CupSoda,
  CakeSlice,
} from "lucide-react";
import { sound } from "@/lib/sound";

interface CategoryNavProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Utensils,
  Flame,
  Sandwich,
  Beef,
  Sparkles,
  Boxes,
  CupSoda,
  CakeSlice,
};

export function CategoryNav({
  categories,
  activeCategoryId,
  onSelectCategory,
}: CategoryNavProps) {
  return (
    <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 py-2.5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 scroll-smooth">
          {categories.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || Utensils;
            const isActive = activeCategoryId === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  sound.playPop();
                  onSelectCategory(cat.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isActive
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/25 scale-102"
                    : "bg-gray-100/80 text-gray-700 hover:bg-gray-200/80 hover:text-gray-900"
                }`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-amber-600"}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
