export type OrderStatus = "received" | "preparing" | "ready" | "served" | "cancelled";

export type OrderType = "dine-in" | "takeaway";

export type WaiterCallReason = "call_waiter" | "request_bill" | "water" | "help";

export type WaiterCallStatus = "pending" | "resolved";

export interface MenuOption {
  id: string;
  name: string;
  priceModifier: number; // in DZD
  isDefault?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  price: number; // in DZD
  categoryId: string;
  categoryName: string;
  image: string;
  prepTimeMinutes: number;
  calories?: number;
  isPopular?: boolean;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  isChefChoice?: boolean;
  inStock: boolean;
  sizes?: MenuOption[];
  meatOptions?: MenuOption[];
  sauces?: string[];
  extras?: MenuOption[];
}

export interface CartItemOption {
  id: string;
  name: string;
  priceModifier: number;
}

export interface CartItem {
  cartItemId: string;
  menuItemId: string;
  name: string;
  nameAr?: string;
  image: string;
  basePrice: number;
  selectedSize?: CartItemOption;
  selectedMeat?: CartItemOption;
  selectedSauces: string[];
  selectedExtras: CartItemOption[];
  specialInstructions?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber: string | number;
  customerName?: string;
  orderType: OrderType;
  items: CartItem[];
  subtotal: number;
  total: number;
  notes?: string;
  status: OrderStatus;
  paymentStatus: "pending_at_table" | "paid";
  createdAt: string;
  updatedAt: string;
}

export interface WaiterCall {
  id: string;
  tableNumber: string | number;
  reason: WaiterCallReason;
  customMessage?: string;
  status: WaiterCallStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  description: string;
}

export interface RestaurantStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalRevenue: number;
  popularItems: { name: string; count: number }[];
}
