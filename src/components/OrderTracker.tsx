"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Order, OrderStatus } from "@/types";
import {
  CheckCircle,
  Clock,
  ChefHat,
  BellRing,
  Utensils,
  Receipt,
  ArrowLeft,
  Sparkles,
  PhoneCall,
} from "lucide-react";
import { sound } from "@/lib/sound";
import { WaiterCallModal } from "./WaiterCallModal";

interface OrderTrackerProps {
  initialOrder: Order;
}

export function OrderTracker({ initialOrder }: OrderTrackerProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [waiterReason, setWaiterReason] = useState<"call_waiter" | "request_bill">("call_waiter");

  // Polling order status every 3 seconds
  useEffect(() => {
    let prevStatus = initialOrder.status;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${initialOrder.id}`);
        const data = await res.json();
        if (data.success && data.order) {
          if (data.order.status !== prevStatus) {
            sound.playSuccess();
            prevStatus = data.order.status;
          }
          setOrder(data.order);
        }
      } catch (err) {
        console.error("Failed to poll order status:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [initialOrder.id, initialOrder.status]);

  const steps: { key: OrderStatus; label: string; icon: React.ElementType; desc: string }[] = [
    {
      key: "received",
      label: "Commande reçue",
      icon: CheckCircle,
      desc: "Transmise à l'équipe de cuisine",
    },
    {
      key: "preparing",
      label: "En préparation",
      icon: ChefHat,
      desc: "Cuisson sur grill et dressage",
    },
    {
      key: "ready",
      label: "Prête à servir",
      icon: BellRing,
      desc: "Le serveur arrive à votre table",
    },
    {
      key: "served",
      label: "Servie & Dégustée",
      icon: Utensils,
      desc: "Bon appétit chez El Bahia !",
    },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case "received":
        return 0;
      case "preparing":
        return 1;
      case "ready":
        return 2;
      case "served":
        return 3;
      case "cancelled":
        return -1;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  const openService = (reason: "call_waiter" | "request_bill") => {
    sound.playPop();
    setWaiterReason(reason);
    setIsWaiterModalOpen(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-amber-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au menu
        </Link>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
          ● En direct
        </span>
      </div>

      {/* Main Status Hero Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-amber-500/10 to-transparent rounded-full blur-2xl" />

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                Commande #{order.orderNumber}
              </span>
              <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                Table #{order.tableNumber}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
              Suivi de votre commande
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {order.customerName ? `Pour ${order.customerName}` : "Service en salle"} •{" "}
              {order.orderType === "dine-in" ? "Sur Place" : "À Emporter"}
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-amber-700">{order.total}</span>
            <span className="text-xs font-bold text-gray-500 ml-1">DA</span>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="space-y-4 my-8">
          <div className="grid grid-cols-4 gap-2">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.key} className="flex flex-col items-center text-center">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-500 mb-2 ${
                      isCurrent
                        ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30 scale-110 ring-4 ring-amber-100"
                        : isPast
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-bold leading-tight ${
                      isCurrent
                        ? "text-amber-700"
                        : isPast
                        ? "text-emerald-700"
                        : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Current Status Message Box */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-600 text-white shrink-0">
              <Clock className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">
                {steps[currentStepIdx]?.label || "Statut de commande"}
              </div>
              <div className="text-xs text-gray-600">
                {steps[currentStepIdx]?.desc || "Votre commande est prise en charge."}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons for Table Services */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => openService("call_waiter")}
            className="py-2.5 px-3 rounded-xl border border-gray-200 hover:border-amber-400 bg-gray-50 hover:bg-amber-50/50 text-gray-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <PhoneCall className="w-4 h-4 text-amber-600" />
            Appeler Serveur
          </button>
          <button
            type="button"
            onClick={() => openService("request_bill")}
            className="py-2.5 px-3 rounded-xl border border-gray-200 hover:border-emerald-400 bg-gray-50 hover:bg-emerald-50/50 text-gray-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Receipt className="w-4 h-4 text-emerald-600" />
            Demander l'Addition
          </button>
        </div>
      </div>

      {/* Order Details Breakdown Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-4">
        <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          Détail des articles commandés
        </h3>

        <div className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.cartItemId} className="py-3 flex items-start justify-between gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                {item.image && (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-amber-700">x{item.quantity}</span>
                  <h4 className="font-bold text-xs text-gray-900 truncate">{item.name}</h4>
                </div>
                {item.selectedSize && (
                  <p className="text-[11px] text-gray-600">Taille : {item.selectedSize.name}</p>
                )}
                {item.selectedMeat && (
                  <p className="text-[11px] text-gray-600">Viande : {item.selectedMeat.name}</p>
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
              <div className="text-right">
                <span className="text-xs font-bold text-gray-900">{item.totalPrice} DA</span>
              </div>
            </div>
          ))}
        </div>

        {order.notes && (
          <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600 border border-gray-100">
            <span className="font-bold text-gray-800">Note cuisine :</span> {order.notes}
          </div>
        )}

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-sm font-extrabold text-gray-900">
          <span>Total de la commande</span>
          <span className="text-amber-700 text-base">{order.total} DA</span>
        </div>
      </div>

      <WaiterCallModal
        isOpen={isWaiterModalOpen}
        onClose={() => setIsWaiterModalOpen(false)}
        defaultReason={waiterReason}
      />
    </div>
  );
}
