"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Bell, Receipt, GlassWater, MessageSquareHeart, CheckCircle, X, Loader2 } from "lucide-react";
import { WaiterCallReason } from "@/types";
import { sound } from "@/lib/sound";

interface WaiterCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultReason?: WaiterCallReason;
}

export function WaiterCallModal({ isOpen, onClose, defaultReason = "call_waiter" }: WaiterCallModalProps) {
  const { tableNumber } = useCart();
  const [reason, setReason] = useState<WaiterCallReason>(defaultReason);
  const [customMsg, setCustomMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");

  if (!isOpen) return null;

  const reasonsList = [
    {
      id: "call_waiter" as WaiterCallReason,
      title: "Appeler un serveur",
      desc: "Une question ou besoin d'assistance à table",
      icon: Bell,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      id: "request_bill" as WaiterCallReason,
      title: "Demander l'addition",
      desc: "Prêt à régler (Espèces, Carte CIB ou Dahabia)",
      icon: Receipt,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      id: "water" as WaiterCallReason,
      title: "Carafe d'eau fraîche",
      desc: "Apporter des verres ou une carafe d'eau",
      icon: GlassWater,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      id: "help" as WaiterCallReason,
      title: "Serviettes & Sauces",
      desc: "Besoin de serviettes supplémentaires ou sauces DZ",
      icon: MessageSquareHeart,
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
  ];

  const handleSubmit = async () => {
    sound.playPop();
    setIsLoading(true);

    try {
      const res = await fetch("/api/waiter-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: tableNumber || "Table Non Spécifiée",
          reason,
          customMessage: customMsg,
        }),
      });

      const data = await res.json();
      if (data.success) {
        sound.playSuccess();
        setSubmitted(true);
        setResponseMsg(data.message || "Demande transmise avec succès !");
        setTimeout(() => {
          setSubmitted(false);
          setCustomMsg("");
          onClose();
        }, 2200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Demande envoyée !</h3>
            <p className="text-sm text-gray-600 max-w-xs mx-auto">{responseMsg}</p>
            <div className="mt-4 text-xs text-amber-700 bg-amber-50 rounded-lg p-2 inline-block">
              Table {tableNumber || "Générale"} • Notre équipe arrive tout de suite
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 mb-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                Service en Salle • Table #{tableNumber || "1"}
              </div>
              <h2 className="text-xl font-bold text-gray-900">Comment pouvons-nous vous aider ?</h2>
              <p className="text-xs text-gray-500">Un membre de l'équipe recevra la notification instantanément.</p>
            </div>

            <div className="space-y-2 mb-4">
              {reasonsList.map((item) => {
                const Icon = item.icon;
                const isSelected = reason === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setReason(item.id);
                    }}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-amber-600 bg-amber-50/70 ring-1 ring-amber-600"
                        : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${item.color} shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mb-5">
              <input
                type="text"
                placeholder="Précision facultative (ex: apporter du pain chaud)..."
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50"
              >
                Fermer
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    Envoyer au Serveur
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
