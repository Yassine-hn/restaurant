import fs from "fs";
import path from "path";
import { MenuItem, Order, OrderStatus, RestaurantStats, WaiterCall, WaiterCallReason } from "@/types";
import { INITIAL_MENU_ITEMS } from "./menu-data";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const WAITER_CALLS_FILE = path.join(DATA_DIR, "waiter_calls.json");
const MENU_OVERRIDES_FILE = path.join(DATA_DIR, "menu_overrides.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function safeReadJSON<T>(filePath: string, fallback: T): T {
  try {
    ensureDirectoryExists();
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    if (!raw.trim()) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return fallback;
  }
}

function safeWriteJSON<T>(filePath: string, data: T): void {
  try {
    ensureDirectoryExists();
    const tempFile = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempFile, filePath);
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
  }
}

function generateOrderNumber(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `DZ-${randomNum}`;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Initial seed orders for demonstration if storage is empty
const INITIAL_SEED_ORDERS: Order[] = [
  {
    id: "seed-order-1",
    orderNumber: "DZ-1042",
    tableNumber: 3,
    customerName: "Yacine",
    orderType: "dine-in",
    status: "preparing",
    paymentStatus: "pending_at_table",
    subtotal: 1330,
    total: 1330,
    notes: "Sauce algérienne bien piquante svp !",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    items: [
      {
        cartItemId: "c-1",
        menuItemId: "tacos-le-boss",
        name: "Tacos Le Boss (2 Viandes)",
        nameAr: "تاكوس البوس (لحمين)",
        image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80",
        basePrice: 650,
        selectedSize: { id: "size-l", name: "Taille L (2 Viandes)", priceModifier: 0 },
        selectedMeat: { id: "meat-poulet-viande", name: "Poulet Mariné & Viande Hachée", priceModifier: 0 },
        selectedSauces: ["Sauce Algérienne Maison 🌶️", "Sauce Fromagère Onctueuse 🧀"],
        selectedExtras: [{ id: "extra-gratine-four", name: "Gratiné au four (Cheddar & Mozzarella)", priceModifier: 150 }],
        quantity: 1,
        unitPrice: 800,
        totalPrice: 800,
      },
      {
        cartItemId: "c-2",
        menuItemId: "burger-crispy-dz",
        name: "Le Crispy DZ Burger",
        image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80",
        basePrice: 520,
        selectedSauces: ["Sauce Samouraï 🌶️"],
        selectedExtras: [],
        quantity: 1,
        unitPrice: 520,
        totalPrice: 520,
      },
      {
        cartItemId: "c-3",
        menuItemId: "hamoud-selecto-33cl",
        name: "Hamoud Boualem Selecto (33cl)",
        image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
        basePrice: 80,
        selectedSauces: [],
        selectedExtras: [],
        quantity: 1,
        unitPrice: 80,
        totalPrice: 80,
      },
    ],
  },
  {
    id: "seed-order-2",
    orderNumber: "DZ-1043",
    tableNumber: 7,
    customerName: "Meriem",
    orderType: "dine-in",
    status: "received",
    paymentStatus: "pending_at_table",
    subtotal: 950,
    total: 950,
    notes: "Sans oignons dans le smash burger",
    createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    items: [
      {
        cartItemId: "c-4",
        menuItemId: "smash-casbah-double",
        name: "Le Smash Casbah (Double Cheese)",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        basePrice: 580,
        selectedSauces: ["Sauce Algérienne Maison 🌶️"],
        selectedExtras: [{ id: "extra-cheddar", name: "Tranche Cheddar supplémentaire", priceModifier: 80 }],
        specialInstructions: "Sans oignons svp",
        quantity: 1,
        unitPrice: 660,
        totalPrice: 660,
      },
      {
        cartItemId: "c-5",
        menuItemId: "frites-maison-trio",
        name: "Portion Frites Maison & Trio Sauces",
        image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80",
        basePrice: 200,
        selectedSauces: ["Sauce Fromagère Onctueuse 🧀", "Harissa Traditionnelle 🌶️🌶️"],
        selectedExtras: [],
        quantity: 1,
        unitPrice: 200,
        totalPrice: 200,
      },
      {
        cartItemId: "c-6",
        menuItemId: "hamoud-blanche-33cl",
        name: "Hamoud Boualem Blanche (33cl)",
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        basePrice: 80,
        selectedSauces: [],
        selectedExtras: [],
        quantity: 1,
        unitPrice: 80,
        totalPrice: 80,
      },
    ],
  },
];

const INITIAL_SEED_CALLS: WaiterCall[] = [
  {
    id: "call-1",
    tableNumber: 3,
    reason: "water",
    customMessage: "Une carafe d'eau fraîche svp",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
];

export class StorageService {
  public static getAllOrders(): Order[] {
    const orders = safeReadJSON<Order[]>(ORDERS_FILE, INITIAL_SEED_ORDERS);
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static getOrderById(id: string): Order | null {
    const orders = this.getAllOrders();
    return orders.find((o) => o.id === id || o.orderNumber === id) || null;
  }

  public static getOrdersByTable(tableNumber: string | number): Order[] {
    const orders = this.getAllOrders();
    const tableStr = String(tableNumber);
    return orders.filter((o) => String(o.tableNumber) === tableStr);
  }

  public static createOrder(data: {
    tableNumber: string | number;
    customerName?: string;
    orderType: Order["orderType"];
    items: Order["items"];
    notes?: string;
  }): Order {
    if (!data.items || data.items.length === 0) {
      throw new Error("Impossible de créer une commande vide.");
    }

    if (!data.tableNumber && data.orderType === "dine-in") {
      throw new Error("Le numéro de table est requis pour les commandes sur place.");
    }

    const subtotal = data.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const total = subtotal;

    const newOrder: Order = {
      id: generateId(),
      orderNumber: generateOrderNumber(),
      tableNumber: data.tableNumber,
      customerName: data.customerName?.trim() || `Client Table ${data.tableNumber}`,
      orderType: data.orderType || "dine-in",
      items: data.items,
      subtotal,
      total,
      notes: data.notes?.trim() || "",
      status: "received",
      paymentStatus: "pending_at_table",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const orders = this.getAllOrders();
    orders.unshift(newOrder);
    safeWriteJSON(ORDERS_FILE, orders);

    return newOrder;
  }

  public static updateOrderStatus(
    id: string,
    status: OrderStatus,
    paymentStatus?: "pending_at_table" | "paid"
  ): Order | null {
    const orders = this.getAllOrders();
    const index = orders.findIndex((o) => o.id === id || o.orderNumber === id);

    if (index === -1) return null;

    orders[index] = {
      ...orders[index],
      status,
      paymentStatus: paymentStatus || orders[index].paymentStatus,
      updatedAt: new Date().toISOString(),
    };

    safeWriteJSON(ORDERS_FILE, orders);
    return orders[index];
  }

  public static getAllWaiterCalls(): WaiterCall[] {
    const calls = safeReadJSON<WaiterCall[]>(WAITER_CALLS_FILE, INITIAL_SEED_CALLS);
    return calls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static createWaiterCall(
    tableNumber: string | number,
    reason: WaiterCallReason,
    customMessage?: string
  ): WaiterCall {
    if (!tableNumber) {
      throw new Error("Le numéro de table est requis.");
    }

    const newCall: WaiterCall = {
      id: generateId(),
      tableNumber,
      reason,
      customMessage: customMessage?.trim(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const calls = this.getAllWaiterCalls();
    calls.unshift(newCall);
    safeWriteJSON(WAITER_CALLS_FILE, calls);

    return newCall;
  }

  public static resolveWaiterCall(id: string): WaiterCall | null {
    const calls = this.getAllWaiterCalls();
    const index = calls.findIndex((c) => c.id === id);

    if (index === -1) return null;

    calls[index] = {
      ...calls[index],
      status: "resolved",
      resolvedAt: new Date().toISOString(),
    };

    safeWriteJSON(WAITER_CALLS_FILE, calls);
    return calls[index];
  }

  public static getMenu(): MenuItem[] {
    const overrides = safeReadJSON<Record<string, { inStock: boolean }>>(MENU_OVERRIDES_FILE, {});
    return INITIAL_MENU_ITEMS.map((item) => {
      if (overrides[item.id] !== undefined) {
        return { ...item, inStock: overrides[item.id].inStock };
      }
      return item;
    });
  }

  public static toggleItemStock(itemId: string, inStock: boolean): boolean {
    const overrides = safeReadJSON<Record<string, { inStock: boolean }>>(MENU_OVERRIDES_FILE, {});
    overrides[itemId] = { inStock };
    safeWriteJSON(MENU_OVERRIDES_FILE, overrides);
    return true;
  }

  public static getRestaurantStats(): RestaurantStats {
    const orders = this.getAllOrders();
    const activeOrders = orders.filter((o) => o.status === "received" || o.status === "preparing" || o.status === "ready").length;
    const completedOrders = orders.filter((o) => o.status === "served").length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== "cancelled" ? o.total : 0), 0);

    const itemCounts: Record<string, number> = {};
    for (const order of orders) {
      if (order.status !== "cancelled") {
        for (const item of order.items) {
          itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
        }
      }
    }

    const popularItems = Object.entries(itemCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalOrders: orders.length,
      activeOrders,
      completedOrders,
      totalRevenue,
      popularItems,
    };
  }

  public static resetForTesting(): void {
    safeWriteJSON(ORDERS_FILE, []);
    safeWriteJSON(WAITER_CALLS_FILE, []);
    safeWriteJSON(MENU_OVERRIDES_FILE, {});
  }
}
