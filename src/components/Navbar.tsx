"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Flame, ShoppingBag, Bell, Receipt, QrCode, ChefHat, Sparkles } from "lucide-react";
import { TableModal } from "./TableModal";
import { WaiterCallModal } from "./WaiterCallModal";
import { WaiterCallReason } from "@/types";
import { sound } from "@/lib/sound";

export function Navbar() {
  const { cartCount, cartTotal, tableNumber, setIsCartOpen, activeOrder } = useCart();
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [waiterReason, setWaiterReason] = useState<WaiterCallReason>("call_waiter");

  const openWaiterCall = (reason: WaiterCallReason) => {
    sound.playPop();
    setWaiterReason(reason);
    setIsWaiterModalOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-red-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                  <Flame className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base tracking-tight text-gray-900">
                      EL BAHIA
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                      DZ 🇩🇿
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium hidden sm:block">
                    Fast-Food & Tacos Algériens Authentiques
                  </p>
                </div>
              </Link>
            </div>

            {/* Table Badge & Quick Actions */}
            <div className="flex items-center gap-2">
              {/* Table Selector Pill */}
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setIsTableModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition-colors shadow-2xs"
                title="Changer de table"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-600" />
                <span>{tableNumber ? `Table #${tableNumber}` : "Choisir Table"}</span>
              </button>

              {/* Call Waiter */}
              <button
                type="button"
                onClick={() => openWaiterCall("call_waiter")}
                className="p-2 rounded-xl text-gray-700 bg-gray-100 hover:bg-amber-50 hover:text-amber-700 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium"
                title="Appeler un serveur"
              >
                <Bell className="w-4 h-4 text-amber-600" />
                <span className="hidden md:inline">Appeler</span>
              </button>

              {/* Request Bill */}
              <button
                type="button"
                onClick={() => openWaiterCall("request_bill")}
                className="p-2 rounded-xl text-gray-700 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium"
                title="Demander l'addition"
              >
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span className="hidden md:inline">Addition</span>
              </button>

              {/* KDS Kitchen Link */}
              <Link
                href="/admin"
                className="p-2 rounded-xl text-gray-600 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
                title="Accès Cuisine / KDS"
              >
                <ChefHat className="w-4 h-4 text-blue-600" />
                <span className="hidden lg:inline">Cuisine / KDS</span>
              </Link>

              {/* Active order status quick pill if any */}
              {activeOrder && (
                <Link
                  href={`/order/${activeOrder.id}`}
                  className="px-2.5 py-1.5 rounded-xl bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold flex items-center gap-1 animate-pulse"
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  <span className="hidden sm:inline">Suivi</span> #{activeOrder.orderNumber}
                </Link>
              )}

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setIsCartOpen(true);
                }}
                className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md shadow-amber-600/20 active:scale-95 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden xs:inline">Panier</span>
                {cartCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white text-amber-700 text-[11px] font-extrabold animate-bounce">
                    {cartCount}
                  </span>
                )}
                {cartTotal > 0 && (
                  <span className="border-l border-amber-500/60 pl-2 font-bold hidden sm:inline">
                    {cartTotal} DA
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Table Selector Modal */}
      <TableModal isOpen={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} />

      {/* Waiter Call Modal */}
      <WaiterCallModal
        isOpen={isWaiterModalOpen}
        onClose={() => setIsWaiterModalOpen(false)}
        defaultReason={waiterReason}
      />
    </>
  );
}
