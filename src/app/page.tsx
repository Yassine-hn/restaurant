"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MenuItem, Category } from "@/types";
import { Navbar } from "@/components/Navbar";
import { CategoryNav } from "@/components/CategoryNav";
import { MenuCard } from "@/components/MenuCard";
import { ItemDetailModal } from "@/components/ItemDetailModal";
import { TableModal } from "@/components/TableModal";
import { useCart } from "@/context/CartContext";
import {
  Search,
  Flame,
  Sparkles,
  QrCode,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  X,
} from "lucide-react";
import { sound } from "@/lib/sound";

export default function Home() {
  const { tableNumber, cartCount, cartTotal, setIsCartOpen, addToCart } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load menu from API
  useEffect(() => {
    async function loadMenu() {
      try {
        const res = await fetch("/api/menu");
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories);
          setMenuItems(data.items);
        }
      } catch (err) {
        console.error("Failed to load menu:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMenu();
  }, []);

  // Filter items based on active category, search query, and tags
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (activeCategoryId !== "all" && item.categoryId !== activeCategoryId) {
        return false;
      }

      // Tag filter
      if (selectedTag === "popular" && !item.isPopular) return false;
      if (selectedTag === "spicy" && !item.isSpicy) return false;
      if (selectedTag === "vegetarian" && !item.isVegetarian) return false;
      if (selectedTag === "special" && !item.isChefChoice) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesNameAr = item.nameAr?.includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCategory = item.categoryName.toLowerCase().includes(query);
        if (!matchesName && !matchesNameAr && !matchesDesc && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [menuItems, activeCategoryId, selectedTag, searchQuery]);

  const handleSelectItem = (item: MenuItem) => {
    sound.playPop();
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleQuickAdd = (item: MenuItem) => {
    addToCart({
      cartItemId: `${item.id}-${Date.now()}`,
      menuItemId: item.id,
      name: item.name,
      nameAr: item.nameAr,
      image: item.image,
      basePrice: item.price,
      selectedSauces: ["Sauce Algérienne Maison 🌶️"],
      selectedExtras: [],
      quantity: 1,
      unitPrice: item.price,
      totalPrice: item.price,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 pb-24 sm:pb-16">
      <Navbar />

      {/* Hero Welcome & Table Status Banner */}
      <section className="relative bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800 text-white overflow-hidden py-6 sm:py-8 shadow-md">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-semibold text-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Fast-Food Algérien Moderne • Service à Table</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-xs">
                Bienvenue chez El Bahia Fast Food !
              </h1>
              <p className="text-xs sm:text-sm text-amber-100/90 max-w-xl">
                Explorez nos tacos gratinés, chawarma à la broche artisanale et smash burgers.
                Commandez directement depuis votre smartphone, nous vous servons à table.
              </p>
            </div>

            {/* Table indicator card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 flex items-center justify-between gap-4 shrink-0 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-amber-700 flex items-center justify-center shadow-md">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-amber-200 uppercase tracking-wider font-semibold">
                    Emplacement client
                  </div>
                  <div className="text-sm font-black">
                    {tableNumber ? `Table N° ${tableNumber}` : "Aucune table choisie"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setIsTableModalOpen(true);
                }}
                className="py-1.5 px-3 rounded-xl bg-white text-amber-800 hover:bg-amber-50 text-xs font-bold transition-all shadow-xs"
              >
                {tableNumber ? "Modifier" : "Sélectionner"}
              </button>
            </div>
          </div>

          {/* Search bar & Tag filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un plat, ingrédient (ex: tacos, chawarma, selecto, piquant)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white text-gray-900 text-xs sm:text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-md"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Tag Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: "all", label: "Tous les plats" },
                { id: "popular", label: "🔥 Best-Sellers" },
                { id: "special", label: "⭐ Spécialités DZ" },
                { id: "spicy", label: "🌶️ Piquant" },
                { id: "vegetarian", label: "🌱 Végétarien" },
              ].map((tag) => {
                const isActive = selectedTag === tag.id;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setSelectedTag(tag.id);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-white text-amber-800 shadow-md scale-102"
                        : "bg-black/20 text-white/90 hover:bg-black/30"
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation Bar */}
      <CategoryNav
        categories={categories}
        activeCategoryId={activeCategoryId}
        onSelectCategory={setActiveCategoryId}
      />

      {/* Main Menu Grid Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        {/* Results Counter & Active Category Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900">
              {categories.find((c) => c.id === activeCategoryId)?.name || "Tous les plats"}
            </h2>
            <p className="text-xs text-gray-500">
              {filteredItems.length} {filteredItems.length > 1 ? "plats disponibles" : "plat disponible"}
            </p>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl h-72 border border-gray-100 animate-pulse p-4 space-y-3"
              >
                <div className="w-full h-36 bg-gray-200 rounded-xl" />
                <div className="w-3/4 h-4 bg-gray-200 rounded-md" />
                <div className="w-1/2 h-3 bg-gray-100 rounded-md" />
                <div className="w-full h-8 bg-gray-100 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty Search State */
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs max-w-md mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Aucun résultat trouvé</h3>
            <p className="text-xs text-gray-500 mt-1">
              Essayez un autre mot-clé ou réinitialisez les filtres pour découvrir notre carte.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveCategoryId("all");
                setSelectedTag("all");
              }}
              className="mt-4 px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-xl hover:bg-amber-700 transition-colors"
            >
              Voir tout le menu
            </button>
          </div>
        ) : (
          /* Menu Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredItems.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onSelect={handleSelectItem}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar for Mobile & Desktop */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 z-40 max-w-md sm:w-96 mx-auto">
          <button
            type="button"
            onClick={() => {
              sound.playPop();
              setIsCartOpen(true);
            }}
            className="w-full p-3.5 bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 text-white rounded-2xl shadow-2xl shadow-amber-600/40 flex items-center justify-between border border-amber-400/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                  {cartCount}
                </span>
              </div>
              <div className="text-left">
                <div className="text-xs font-extrabold uppercase tracking-wider text-amber-200">
                  {tableNumber ? `Table #${tableNumber}` : "Votre Panier"}
                </div>
                <div className="text-sm font-black">{cartTotal} DA</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-md">
              <span>Voir la commande</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Item Customization Modal */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedItem(null);
        }}
      />

      {/* Table Change Modal */}
      <TableModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-gray-100 py-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-gray-900">EL BAHIA FAST FOOD</span>
              <p className="text-[11px] text-gray-400">
                Commande à table par QR Code • Viandes 100% Halal certifiées
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Service Ouvert 7j/7 (11h30 - 01h00)
            </span>
            <span>Alger, Algérie 🇩🇿</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
