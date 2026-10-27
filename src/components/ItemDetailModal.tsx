"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MenuItem, MenuOption, CartItem, CartItemOption } from "@/types";
import { useCart } from "@/context/CartContext";
import { X, Plus, Minus, Flame, Clock, Sparkles, Check, ShoppingBag } from "lucide-react";
import { sound } from "@/lib/sound";

interface ItemDetailModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ItemDetailModal({ item, isOpen, onClose }: ItemDetailModalProps) {
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState<MenuOption | undefined>(undefined);
  const [selectedMeat, setSelectedMeat] = useState<MenuOption | undefined>(undefined);
  const [selectedSauces, setSelectedSauces] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<MenuOption[]>([]);
  const [instructions, setInstructions] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [imgError, setImgError] = useState<boolean>(false);

  // Initialize defaults whenever modal opens for an item
  useEffect(() => {
    if (item) {
      // Default size
      const defaultSize = item.sizes?.find((s) => s.isDefault) || item.sizes?.[0];
      setSelectedSize(defaultSize);

      // Default meat
      const defaultMeat = item.meatOptions?.find((m) => m.isDefault) || item.meatOptions?.[0];
      setSelectedMeat(defaultMeat);

      // Default sauces (e.g. Sauce Algérienne & Fromagère by default if available)
      const initialSauces: string[] = [];
      if (item.sauces?.some((s) => s.includes("Algérienne"))) {
        initialSauces.push(item.sauces.find((s) => s.includes("Algérienne"))!);
      }
      if (item.sauces?.some((s) => s.includes("Fromagère"))) {
        initialSauces.push(item.sauces.find((s) => s.includes("Fromagère"))!);
      }
      setSelectedSauces(initialSauces);

      setSelectedExtras([]);
      setInstructions("");
      setQuantity(1);
      setImgError(false);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  // Calculate unit price
  const sizeDiff = selectedSize?.priceModifier || 0;
  const meatDiff = selectedMeat?.priceModifier || 0;
  const extrasSum = selectedExtras.reduce((sum, e) => sum + e.priceModifier, 0);
  const unitPrice = Math.max(0, item.price + sizeDiff + meatDiff + extrasSum);
  const totalPrice = unitPrice * quantity;

  const toggleSauce = (sauce: string) => {
    sound.playPop();
    setSelectedSauces((prev) =>
      prev.includes(sauce) ? prev.filter((s) => s !== sauce) : [...prev, sauce]
    );
  };

  const toggleExtra = (extra: MenuOption) => {
    sound.playPop();
    setSelectedExtras((prev) =>
      prev.some((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra]
    );
  };

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      cartItemId: `${item.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      menuItemId: item.id,
      name: item.name,
      nameAr: item.nameAr,
      image: item.image,
      basePrice: item.price,
      selectedSize: selectedSize
        ? { id: selectedSize.id, name: selectedSize.name, priceModifier: selectedSize.priceModifier }
        : undefined,
      selectedMeat: selectedMeat
        ? { id: selectedMeat.id, name: selectedMeat.name, priceModifier: selectedMeat.priceModifier }
        : undefined,
      selectedSauces,
      selectedExtras: selectedExtras.map((e) => ({
        id: e.id,
        name: e.name,
        priceModifier: e.priceModifier,
      })),
      specialInstructions: instructions.trim() || undefined,
      quantity,
      unitPrice,
      totalPrice,
    };

    addToCart(cartItem);
    onClose();
  };

  const fallbackImage =
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-gray-100">
        {/* Header with image */}
        <div className="relative w-full h-52 sm:h-56 bg-gray-100 shrink-0">
          <Image
            src={imgError ? fallbackImage : item.image}
            alt={item.name}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges on image */}
          <div className="absolute top-4 left-4 flex gap-1.5">
            {item.isPopular && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-md">
                <Flame className="w-3.5 h-3.5" />
                Best-Seller
              </span>
            )}
            {item.isChefChoice && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-600 text-white shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                Spécialité Maison
              </span>
            )}
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <h2 className="text-xl sm:text-2xl font-black leading-tight drop-shadow-md">
              {item.name}
            </h2>
            {item.nameAr && (
              <p className="text-amber-300 text-sm font-semibold font-serif drop-shadow-sm mt-0.5" dir="rtl">
                {item.nameAr}
              </p>
            )}
          </div>
        </div>

        {/* Scrollable Customization Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-gray-800">
          {/* Description & Metadata */}
          <div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {item.description}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-amber-600" />
                Prêt en ~{item.prepTimeMinutes} min
              </span>
              {item.calories && <span>🔥 {item.calories} kcal</span>}
            </div>
          </div>

          {/* Format / Sizes if available */}
          {item.sizes && item.sizes.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
                1. Choisissez votre format / taille
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {item.sizes.map((size) => {
                  const isSelected = selectedSize?.id === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        setSelectedSize(size);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? "border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-600"
                          : "border-gray-200 hover:border-gray-300 text-gray-700 bg-gray-50/50"
                      }`}
                    >
                      <span>{size.name}</span>
                      <span className="text-amber-700 font-bold">
                        {size.priceModifier > 0 ? `+${size.priceModifier} DA` : size.priceModifier < 0 ? `${size.priceModifier} DA` : "Inclus"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Meat Options if available */}
          {item.meatOptions && item.meatOptions.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
                2. Choix de la viande
              </label>
              <div className="grid grid-cols-1 gap-2">
                {item.meatOptions.map((meat) => {
                  const isSelected = selectedMeat?.id === meat.id;
                  return (
                    <button
                      key={meat.id}
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        setSelectedMeat(meat);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? "border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-600"
                          : "border-gray-200 hover:border-gray-300 text-gray-700 bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-amber-600 bg-amber-600 text-white" : "border-gray-300"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{meat.name}</span>
                      </div>
                      <span className="text-amber-700 font-bold">
                        {meat.priceModifier > 0 ? `+${meat.priceModifier} DA` : "Inclus"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sauces DZ */}
          {item.sauces && item.sauces.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Sauces au choix (plusieurs possibles)
                </label>
                <span className="text-[11px] text-gray-500">Gratuit</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {item.sauces.map((sauce) => {
                  const isSelected = selectedSauces.includes(sauce);
                  return (
                    <button
                      key={sauce}
                      type="button"
                      onClick={() => toggleSauce(sauce)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? "border-amber-600 bg-amber-50/80 text-amber-900 font-bold"
                          : "border-gray-200 hover:border-gray-300 text-gray-700 bg-gray-50/40"
                      }`}
                    >
                      <span className="truncate">{sauce}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extras / Suppléments */}
          {item.extras && item.extras.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
                Suppléments gourmands & Gratinage
              </label>
              <div className="space-y-2">
                {item.extras.map((extra) => {
                  const isSelected = selectedExtras.some((e) => e.id === extra.id);
                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => toggleExtra(extra)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? "border-amber-600 bg-amber-50/80 text-amber-900 font-semibold ring-1 ring-amber-600"
                          : "border-gray-200 hover:border-gray-300 text-gray-700 bg-gray-50/40"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isSelected ? "border-amber-600 bg-amber-600 text-white" : "border-gray-300"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{extra.name}</span>
                      </div>
                      <span className="font-bold text-amber-700">+{extra.priceModifier} DA</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special request / notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
              Instructions spéciales en cuisine
            </label>
            <input
              type="text"
              placeholder="Ex: Sans oignons, harissa à part, bien cuit..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Footer sticky bar with Quantity and Add Button */}
        <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 p-1">
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() => {
                sound.playPop();
                setQuantity((q) => Math.max(1, q - 1));
              }}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-white hover:text-gray-900 disabled:opacity-30 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-gray-900">{quantity}</span>
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setQuantity((q) => q + 1);
              }}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-white hover:text-gray-900 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add CTA */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-bold text-sm shadow-lg shadow-amber-600/25 flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Ajouter au panier
            </span>
            <span className="bg-amber-700/60 px-2.5 py-0.5 rounded-lg text-xs font-black">
              {totalPrice} DA
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
