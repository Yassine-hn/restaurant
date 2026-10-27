"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Sparkles,
  QrCode,
  Loader2,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";
import { sound } from "@/lib/sound";
import { TableModal } from "./TableModal";

export function CartDrawer() {
  const router = useRouter();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    cartTotal,
    cartCount,
    tableNumber,
    customerName,
    setCustomerName,
    orderType,
    setOrderType,
    notes,
    setNotes,
    updateQuantity,
    removeFromCart,
    clearCart,
    setActiveOrder,
  } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  if (!isCartOpen) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#d97706", "#dc2626", "#16a34a", "#ffffff"],
      });
    } catch {}
  };

  const handleCheckout = async () => {
    sound.playPop();
    setErrorMsg("");

    if (cart.length === 0) {
      setErrorMsg("Votre panier est vide.");
      return;
    }

    if (!tableNumber && orderType === "dine-in") {
      setIsTableModalOpen(true);
      setErrorMsg("Veuillez d'abord sélectionner votre numéro de table.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: orderType === "dine-in" ? tableNumber : "À Emporter",
          customerName: customerName.trim() || undefined,
          orderType,
          items: cart,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Une erreur est survenue lors de la commande.");
      }

      sound.playSuccess();
      triggerConfetti();

      // Set active order in context
      setActiveOrder(data.order);
      clearCart();
      setIsCartOpen(false);

      // Navigate to order tracking page
      router.push(`/order/${data.order.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-fade-in">
        <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-gray-100 animate-slide-left">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Mon Panier</h2>
                  <p className="text-xs text-gray-500 font-medium">
                    {cartCount} {cartCount > 1 ? "articles sélectionnés" : "article sélectionné"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Order Mode Toggle: Dine-In vs Takeaway */}
              <div className="p-1 bg-gray-100 rounded-xl flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setOrderType("dine-in");
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    orderType === "dine-in"
                      ? "bg-white text-gray-900 shadow-xs"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  🍽️ Sur Place (À Table)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setOrderType("takeaway");
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    orderType === "takeaway"
                      ? "bg-white text-gray-900 shadow-xs"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  🥡 À Emporter
                </button>
              </div>

              {/* Table assignment bar */}
              {orderType === "dine-in" && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/80 border border-amber-200">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="text-xs text-gray-600">Servir à la </span>
                      <span className="text-xs font-bold text-gray-900">
                        {tableNumber ? `Table #${tableNumber}` : "Table non définie"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTableModalOpen(true)}
                    className="text-xs font-semibold text-amber-700 hover:underline"
                  >
                    Changer
                  </button>
                </div>
              )}

              {/* Customer Name */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Votre Prénom (facultatif)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Karim, Amira..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Cart Items List */}
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400 mb-3">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-700">Votre panier est vide</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                    Explorez notre carte et ajoutez vos tacos, chawarmas ou burgers favoris.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Articles
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        clearCart();
                      }}
                      className="text-[11px] text-red-500 hover:text-red-700 font-medium"
                    >
                      Vider le panier
                    </button>
                  </div>

                  {cart.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                          {item.image && (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-gray-900 truncate">
                            {item.name}
                          </h4>
                          {item.selectedSize && (
                            <p className="text-[11px] text-amber-700 font-medium">
                              Taille : {item.selectedSize.name}
                            </p>
                          )}
                          {item.selectedMeat && (
                            <p className="text-[11px] text-gray-600">
                              Viande : {item.selectedMeat.name}
                            </p>
                          )}
                          {item.selectedSauces.length > 0 && (
                            <p className="text-[10px] text-gray-500">
                              Sauces : {item.selectedSauces.join(", ")}
                            </p>
                          )}
                          {item.selectedExtras.length > 0 && (
                            <p className="text-[10px] text-amber-600 font-medium">
                              + {item.selectedExtras.map((e) => e.name).join(", ")}
                            </p>
                          )}
                          {item.specialInstructions && (
                            <p className="text-[10px] text-gray-400 italic">
                              « {item.specialInstructions} »
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quantity & Item Total */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                        <div className="flex items-center rounded-lg border border-gray-200 bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cartItemId, -1)}
                            className="p-1 text-gray-600 hover:text-gray-900"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cartItemId, 1)}
                            className="p-1 text-gray-600 hover:text-gray-900"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-900">
                            {item.totalPrice} DA
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* General Order Notes */}
              {cart.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Instructions générales pour la commande
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Servir les boissons bien fraîches, apporter de la harissa en pot..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 bg-white border-t border-gray-100 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Sous-total</span>
                    <span>{cartTotal} DA</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Service à table</span>
                    <span className="text-emerald-600 font-semibold">Offert</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-100">
                    <span>Total à régler</span>
                    <span className="text-amber-700">{cartTotal} DA</span>
                  </div>
                </div>

                <div className="text-[11px] text-gray-500 text-center bg-gray-50 p-2 rounded-xl">
                  💳 Paiement à table lors du service (Espèces ou CIB / Dahabia)
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleCheckout}
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-bold text-sm shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Envoi de la commande en cuisine...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Confirmer et Commander</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <TableModal isOpen={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} />
    </>
  );
}
