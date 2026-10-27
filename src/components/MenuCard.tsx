"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MenuItem } from "@/types";
import { Plus, Flame, Sparkles, Clock, Check } from "lucide-react";
import { sound } from "@/lib/sound";

interface MenuCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
  onQuickAdd?: (item: MenuItem) => void;
}

export function MenuCard({ item, onSelect, onQuickAdd }: MenuCardProps) {
  const [imgError, setImgError] = useState(false);
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  const fallbackImage =
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.inStock) return;

    if (item.sizes?.length || item.meatOptions?.length || (item.extras && item.extras.length > 0)) {
      // If item has customizable options, open the detail modal
      onSelect(item);
    } else {
      sound.playPop();
      if (onQuickAdd) {
        onQuickAdd(item);
      } else {
        onSelect(item);
      }
      setIsAddedRecently(true);
      setTimeout(() => setIsAddedRecently(false), 1200);
    }
  };

  return (
    <div
      onClick={() => item.inStock && onSelect(item)}
      className={`group relative flex flex-col bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-xl hover:border-amber-200 transition-all duration-300 overflow-hidden cursor-pointer ${
        !item.inStock ? "opacity-60 grayscale-[40%] cursor-not-allowed" : ""
      }`}
    >
      {/* Image Container with Badges */}
      <div className="relative w-full h-44 overflow-hidden bg-gray-100">
        <Image
          src={imgError ? fallbackImage : item.image}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgError(true)}
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          {item.isPopular && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
              <Flame className="w-3 h-3" />
              Populaire
            </span>
          )}
          {item.isChefChoice && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-600 text-white shadow-xs">
              <Sparkles className="w-3 h-3" />
              Spécialité DZ
            </span>
          )}
          {item.isSpicy && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-xs">
              🌶️ Épicé
            </span>
          )}
          {item.isVegetarian && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
              🌱 Végétarien
            </span>
          )}
        </div>

        {/* Preparation time badge */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-medium">
          <Clock className="w-3 h-3 text-amber-300" />
          <span>{item.prepTimeMinutes} min</span>
        </div>

        {/* Out of stock badge */}
        {!item.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="px-3 py-1 bg-red-600 text-white font-bold text-xs rounded-full uppercase tracking-wider">
              Épuisé pour le moment
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-gray-900 text-sm group-hover:text-amber-600 transition-colors line-clamp-1">
              {item.name}
            </h3>
          </div>

          {item.nameAr && (
            <div className="text-[11px] text-amber-700/80 font-medium mb-1.5 text-right font-serif" dir="rtl">
              {item.nameAr}
            </div>
          )}

          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>
        </div>

        {/* Price & Add Button */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            <span className="text-base font-extrabold text-amber-700">
              {item.price}
            </span>
            <span className="text-xs font-bold text-gray-500 ml-1">DA</span>
          </div>

          {item.inStock && (
            <button
              type="button"
              onClick={handleQuickAddClick}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                isAddedRecently
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/20"
              }`}
            >
              {isAddedRecently ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Ajouté</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {item.sizes?.length || item.meatOptions?.length ? "Choisir" : "Ajouter"}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
