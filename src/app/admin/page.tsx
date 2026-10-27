"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Order, OrderStatus, WaiterCall, MenuItem, RestaurantStats } from "@/types";
import {
  ChefHat,
  Bell,
  QrCode,
  ListCheck,
  BarChart3,
  Clock,
  CheckCircle,
  ArrowRight,
  Printer,
  Sparkles,
  RefreshCw,
  Utensils,
  Receipt,
  AlertTriangle,
  Flame,
} from "lucide-react";
import QRCode from "qrcode";
import { sound } from "@/lib/sound";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"kds" | "calls" | "qr" | "menu" | "stats">("kds");
  const [orders, setOrders] = useState<Order[]>([]);
  const [calls, setCalls] = useState<WaiterCall[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // QR Code generator states
  const [selectedTableForQR, setSelectedTableForQR] = useState<string>("1");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Track previous order count to play sound on new orders
  const prevOrdersCountRef = useRef<number>(0);

  const fetchAllData = async () => {
    try {
      const [ordersRes, callsRes, menuRes, statsRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/waiter-call"),
        fetch("/api/menu"),
        fetch("/api/stats"),
      ]);

      const [ordersData, callsData, menuData, statsData] = await Promise.all([
        ordersRes.json(),
        callsRes.json(),
        menuRes.json(),
        statsRes.json(),
      ]);

      if (ordersData.success) {
        if (
          prevOrdersCountRef.current > 0 &&
          ordersData.orders.length > prevOrdersCountRef.current
        ) {
          sound.playKitchenAlert();
        }
        prevOrdersCountRef.current = ordersData.orders.length;
        setOrders(ordersData.orders);
      }

      if (callsData.success) {
        setCalls(callsData.calls);
      }

      if (menuData.success) {
        setMenuItems(menuData.items);
      }

      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Generate QR Code whenever selected table changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const origin = window.location.origin;
    const tableUrl = `${origin}/?table=${encodeURIComponent(selectedTableForQR)}`;

    QRCode.toDataURL(tableUrl, { width: 320, margin: 2, color: { dark: "#18181b", light: "#ffffff" } })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code error:", err));
  }, [selectedTableForQR]);

  const handleUpdateStatus = async (
    orderId: string,
    status: OrderStatus,
    paymentStatus?: "pending_at_table" | "paid"
  ) => {
    sound.playPop();
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, paymentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveCall = async (callId: string) => {
    sound.playPop();
    try {
      const res = await fetch(`/api/waiter-call/${callId}`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStock = async (itemId: string, inStock: boolean) => {
    sound.playPop();
    try {
      const res = await fetch("/api/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, inStock }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrintQR = () => {
    window.print();
  };

  // Group orders for KDS Kanban
  const receivedOrders = orders.filter((o) => o.status === "received");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const readyOrders = orders.filter((o) => o.status === "ready");
  const completedOrders = orders.filter((o) => o.status === "served");
  const pendingCalls = calls.filter((c) => c.status === "pending");

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      {/* Top Admin Header */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 py-4 border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white">
                  EL BAHIA • KITCHEN & SERVICE
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  LIVE KDS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Écran tactile cuisine, service en salle & gestion des tables
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setIsRefreshing(true);
                fetchAllData().then(() => setIsRefreshing(false));
              }}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>

            <Link
              href="/"
              className="py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Voir le Menu Client</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-slate-800/80 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab("kds")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "kds"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Commandes Cuisine (KDS)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                receivedOrders.length + preparingOrders.length > 0
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              {receivedOrders.length + preparingOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("calls")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "calls"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Appels Serveur</span>
            {pendingCalls.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-black animate-bounce">
                {pendingCalls.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("qr")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "qr"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Générateur QR Tables</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("menu")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "menu"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <ListCheck className="w-4 h-4" />
            <span>Gestion Stocks Menu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("stats")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "stats"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Statistiques & Recettes</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* Pending Waiter Calls Alert Bar */}
        {pendingCalls.length > 0 && activeTab !== "calls" && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600 text-white rounded-xl">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-red-900 text-sm">
                  {pendingCalls.length} appel(s) de table en attente !
                </h4>
                <p className="text-xs text-red-700">
                  {pendingCalls.map((c) => `Table #${c.tableNumber} (${c.reason})`).join(" • ")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("calls")}
              className="py-1.5 px-3 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
            >
              Voir les appels
            </button>
          </div>
        )}

        {/* TAB 1: KDS KANBAN */}
        {activeTab === "kds" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Column 1: Received / Nouvelles */}
              <div className="flex flex-col bg-white rounded-2xl border border-blue-200/60 shadow-sm overflow-hidden">
                <div className="p-3.5 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-900">
                      1. Reçues
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-200 text-blue-900 text-xs font-bold">
                    {receivedOrders.length}
                  </span>
                </div>
                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[72vh]">
                  {receivedOrders.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Aucune commande en attente
                    </div>
                  ) : (
                    receivedOrders.map((order) => (
                      <OrderKdsCard
                        key={order.id}
                        order={order}
                        actionLabel="Passer en cuisine 🍳"
                        actionColor="bg-amber-600 hover:bg-amber-700 text-white"
                        onAction={() => handleUpdateStatus(order.id, "preparing")}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Column 2: Preparing / En Cuisine */}
              <div className="flex flex-col bg-white rounded-2xl border border-amber-200/60 shadow-sm overflow-hidden">
                <div className="p-3.5 bg-amber-50/70 border-b border-amber-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                      2. En Cuisine
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-xs font-bold">
                    {preparingOrders.length}
                  </span>
                </div>
                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[72vh]">
                  {preparingOrders.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Aucune commande sur les fourneaux
                    </div>
                  ) : (
                    preparingOrders.map((order) => (
                      <OrderKdsCard
                        key={order.id}
                        order={order}
                        actionLabel="Marquer Prête 🛎️"
                        actionColor="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onAction={() => handleUpdateStatus(order.id, "ready")}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Column 3: Ready / Prêtes */}
              <div className="flex flex-col bg-white rounded-2xl border border-emerald-200/60 shadow-sm overflow-hidden">
                <div className="p-3.5 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                      3. Prêtes à Servir
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-xs font-bold">
                    {readyOrders.length}
                  </span>
                </div>
                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[72vh]">
                  {readyOrders.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Rien à servir pour le moment
                    </div>
                  ) : (
                    readyOrders.map((order) => (
                      <OrderKdsCard
                        key={order.id}
                        order={order}
                        actionLabel="Servie & Payée ✅"
                        actionColor="bg-slate-900 hover:bg-slate-800 text-white"
                        onAction={() => handleUpdateStatus(order.id, "served", "paid")}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Column 4: Completed / Servies */}
              <div className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-400" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      4. Historique (Servies)
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                    {completedOrders.length}
                  </span>
                </div>
                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[72vh]">
                  {completedOrders.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Aucune commande archivée
                    </div>
                  ) : (
                    completedOrders.slice(0, 10).map((order) => (
                      <div
                        key={order.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 opacity-75 hover:opacity-100 transition-opacity"
                      >
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>
                            #{order.orderNumber} • Table {order.tableNumber}
                          </span>
                          <span className="text-emerald-700">{order.total} DA</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Servie à {new Date(order.updatedAt).toLocaleTimeString("fr-FR")}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WAITER CALLS */}
        {activeTab === "calls" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Appels Serveurs & Demandes en Salle
                </h2>
                <p className="text-xs text-slate-500">
                  Notifications transmises directement par les clients depuis leur table
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                {pendingCalls.length} en attente
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {calls.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Aucun appel enregistré pour l'instant
                </div>
              ) : (
                calls.map((call) => {
                  const isPending = call.status === "pending";
                  return (
                    <div
                      key={call.id}
                      className={`py-4 flex items-center justify-between gap-4 ${
                        isPending ? "bg-amber-50/50 -mx-6 px-6" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                            isPending
                              ? "bg-red-500 text-white animate-bounce"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {call.reason === "request_bill" ? (
                            <Receipt className="w-5 h-5" />
                          ) : (
                            <Bell className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900">
                              Table #{call.tableNumber}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                call.reason === "request_bill"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {call.reason === "request_bill"
                                ? "Demande d'addition"
                                : call.reason === "water"
                                ? "Carafe d'eau"
                                : "Appel serveur"}
                            </span>
                          </div>
                          {call.customMessage && (
                            <p className="text-xs text-slate-600 mt-0.5 italic">
                              « {call.customMessage} »
                            </p>
                          )}
                          <p className="text-[10px] text-slate-400 mt-1">
                            Reçu à {new Date(call.createdAt).toLocaleTimeString("fr-FR")}
                          </p>
                        </div>
                      </div>

                      <div>
                        {isPending ? (
                          <button
                            type="button"
                            onClick={() => handleResolveCall(call.id)}
                            className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                          >
                            Acquitter / Traité ✅
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            Traité
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: QR CODE GENERATOR */}
        {activeTab === "qr" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Générateur de QR Code pour les Tables
                </h2>
                <p className="text-xs text-slate-500">
                  Imprimez et posez sur chaque table pour permettre aux clients de scanner et commander
                </p>
              </div>

              <button
                type="button"
                onClick={handlePrintQR}
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer le Chevalet</span>
              </button>
            </div>

            {/* Table Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Sélectionnez le numéro de table à générer
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "10",
                  "11",
                  "12",
                  "Terrasse 1",
                  "Terrasse 2",
                ].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setSelectedTableForQR(t);
                    }}
                    className={`py-2 px-3.5 rounded-xl text-xs font-bold border transition-all ${
                      selectedTableForQR === t
                        ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Table {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Printable Preview Card (Chevalet de table) */}
            <div className="flex justify-center p-6 bg-slate-100 rounded-3xl border border-slate-200">
              <div
                id="printable-card"
                className="w-80 bg-white rounded-3xl shadow-xl border-4 border-amber-500 p-6 flex flex-col items-center text-center space-y-4"
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                    <Flame className="w-5 h-5" />
                  </div>
                  <span className="font-black text-lg text-slate-900 tracking-tight">
                    EL BAHIA FAST FOOD
                  </span>
                </div>

                <div className="py-1 px-4 rounded-full bg-slate-900 text-white font-black text-sm tracking-widest uppercase">
                  TABLE N° {selectedTableForQR}
                </div>

                {/* QR Code Image */}
                <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-inner">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`QR Code Table ${selectedTableForQR}`}
                      className="w-48 h-48"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                      Génération...
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    Scannez pour Explorer & Commander
                  </h4>
                  <p className="text-[11px] text-slate-500 max-w-xs leading-snug">
                    Accédez directement à la carte sur votre smartphone et suivez votre commande en direct.
                  </p>
                </div>

                <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 w-full flex justify-between">
                  <span>🇩🇿 Street Food Authentique</span>
                  <span>Service à table</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 bg-amber-50 p-3 rounded-xl border border-amber-200">
              <span>Lien direct généré :</span>
              <a
                href={`/?table=${encodeURIComponent(selectedTableForQR)}`}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-amber-700 hover:underline"
              >
                /?table={selectedTableForQR} (Tester en ouvrant un nouvel onglet)
              </a>
            </div>
          </div>
        )}

        {/* TAB 4: MENU STOCK MANAGEMENT */}
        {activeTab === "menu" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Gestion des Disponibilités Menu en Temps Réel
              </h2>
              <p className="text-xs text-slate-500">
                Passez un article en rupture de stock en un clic si les ingrédients manquent en cuisine.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                    <p className="text-[11px] text-amber-700 font-bold">{item.price} DA</p>
                    <span
                      className={`inline-block text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full ${
                        item.inStock
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.inStock ? "En Stock" : "Rupture de Stock"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleStock(item.id, !item.inStock)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      item.inStock
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    {item.inStock ? "Mettre en rupture" : "Réactiver"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: STATS */}
        {activeTab === "stats" && stats && (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Chiffre d'Affaires
                </span>
                <div className="text-2xl font-black text-amber-700 mt-1">
                  {stats.totalRevenue.toLocaleString()} <span className="text-sm font-bold">DA</span>
                </div>
                <span className="text-xs text-emerald-600 font-medium">Aujourd'hui</span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Commandes
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalOrders}</div>
                <span className="text-xs text-slate-500">Toutes tables confondues</span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Commandes en Cours
                </span>
                <div className="text-2xl font-black text-blue-600 mt-1">{stats.activeOrders}</div>
                <span className="text-xs text-blue-600 font-medium">En salle / cuisine</span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Commandes Servies
                </span>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  {stats.completedOrders}
                </div>
                <span className="text-xs text-emerald-600 font-medium">Terminées</span>
              </div>
            </div>

            {/* Popular Items Chart */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md">
              <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Top 5 des Plats les Plus Commandés
              </h3>

              <div className="space-y-3">
                {stats.popularItems.map((item, idx) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-800">
                        #{idx + 1} {item.name}
                      </span>
                      <span className="text-amber-700">{item.count} portions</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(15, (item.count / (stats.totalOrders || 1)) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Subcomponent for KDS Order Card
function OrderKdsCard({
  order,
  actionLabel,
  actionColor,
  onAction,
}: {
  order: Order;
  actionLabel: string;
  actionColor: string;
  onAction: () => void;
}) {
  const timeElapsed = Math.floor(
    (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60)
  );

  return (
    <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs flex flex-col justify-between space-y-3 transition-all">
      <div className="space-y-2">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-white font-black text-xs">
              Table #{order.tableNumber}
            </span>
            <span className="text-[11px] font-bold text-slate-500">#{order.orderNumber}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-amber-700 font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeElapsed}m</span>
          </div>
        </div>

        {order.customerName && (
          <p className="text-[11px] text-slate-600 font-semibold">
            Client : {order.customerName}
          </p>
        )}

        {/* Item list */}
        <div className="space-y-1.5">
          {order.items.map((item) => (
            <div key={item.cartItemId} className="text-xs text-slate-800">
              <div className="flex items-start justify-between font-bold">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span className="text-slate-500 text-[11px]">{item.totalPrice} DA</span>
              </div>

              {/* Customizations */}
              <div className="pl-3 text-[10px] text-slate-500 space-y-0.5">
                {item.selectedSize && <div>• Format : {item.selectedSize.name}</div>}
                {item.selectedMeat && <div>• Viande : {item.selectedMeat.name}</div>}
                {item.selectedSauces.length > 0 && (
                  <div>• Sauces : {item.selectedSauces.join(", ")}</div>
                )}
                {item.selectedExtras.length > 0 && (
                  <div className="text-amber-700 font-semibold">
                    • Extras : {item.selectedExtras.map((e) => e.name).join(", ")}
                  </div>
                )}
                {item.specialInstructions && (
                  <div className="text-red-600 font-black uppercase">
                    ⚠️ {item.specialInstructions}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {order.notes && (
          <div className="p-2 bg-amber-100/70 border border-amber-200 rounded-lg text-[10px] text-amber-900 font-semibold">
            Note : {order.notes}
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
        <span className="text-xs font-black text-slate-900">{order.total} DA</span>
        <button
          type="button"
          onClick={onAction}
          className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm ${actionColor}`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
