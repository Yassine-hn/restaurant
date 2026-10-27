"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { QrCode, X, Check, MapPin } from "lucide-react";
import { sound } from "@/lib/sound";

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TableModal({ isOpen, onClose }: TableModalProps) {
  const { tableNumber, setTableNumber } = useCart();
  const [selectedTable, setSelectedTable] = useState<string>(tableNumber || "1");
  const [customTable, setCustomTable] = useState<string>("");

  if (!isOpen) return null;

  const quickTables = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "Terrasse 1", "Terrasse 2"];

  const handleSave = () => {
    sound.playPop();
    const finalTable = customTable.trim() || selectedTable;
    setTableNumber(finalTable);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-amber-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Numéro de votre Table</h2>
            <p className="text-xs text-gray-500">
              Scanné via QR Code ou sélectionné manuellement
            </p>
          </div>
        </div>

        <div className="p-3 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Votre commande sera directement servie à cette table par nos serveurs.
          </span>
        </div>

        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
          Sélection rapide
        </label>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {quickTables.map((t) => {
            const isSelected = selectedTable === t && !customTable;
            return (
              <button
                key={t}
                type="button"
                onClick={() => {
                  sound.playPop();
                  setSelectedTable(t);
                  setCustomTable("");
                }}
                className={`py-2 px-1 text-sm font-semibold rounded-xl border transition-all ${
                  isSelected
                    ? "bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-200"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {t.startsWith("Terrasse") ? t : `T-${t}`}
              </button>
            );
          })}
        </div>

        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Ou saisie personnalisée
          </label>
          <input
            type="text"
            placeholder="Ex: Table 15 ou Étage 2..."
            value={customTable}
            onChange={(e) => setCustomTable(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-amber-600/20"
          >
            <Check className="w-4 h-4" />
            Confirmer la table
          </button>
        </div>
      </div>
    </div>
  );
}
