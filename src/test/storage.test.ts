import { describe, it, expect, beforeEach } from "vitest";
import { StorageService } from "@/lib/storage";

describe("StorageService Business Logic", () => {
  beforeEach(() => {
    StorageService.resetForTesting();
  });

  it("creates an order correctly with calculated totals", () => {
    const order = StorageService.createOrder({
      tableNumber: 5,
      customerName: "Amine",
      orderType: "dine-in",
      items: [
        {
          cartItemId: "item-1",
          menuItemId: "tacos-le-boss",
          name: "Tacos Le Boss",
          image: "https://example.com/tacos.jpg",
          basePrice: 650,
          selectedSauces: ["Sauce Algérienne"],
          selectedExtras: [{ id: "extra-1", name: "Cheddar", priceModifier: 100 }],
          quantity: 2,
          unitPrice: 750,
          totalPrice: 1500,
        },
      ],
      notes: "Bien cuit",
    });

    expect(order.id).toBeDefined();
    expect(order.orderNumber).toMatch(/^DZ-\d{4}$/);
    expect(order.tableNumber).toBe(5);
    expect(order.customerName).toBe("Amine");
    expect(order.total).toBe(1500);
    expect(order.status).toBe("received");
    expect(order.paymentStatus).toBe("pending_at_table");

    const fetched = StorageService.getOrderById(order.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.id).toBe(order.id);
  });

  it("throws an error when trying to create an empty order", () => {
    expect(() => {
      StorageService.createOrder({
        tableNumber: 2,
        orderType: "dine-in",
        items: [],
      });
    }).toThrow("Impossible de créer une commande vide.");
  });

  it("throws an error when table number is missing for dine-in", () => {
    expect(() => {
      StorageService.createOrder({
        tableNumber: "",
        orderType: "dine-in",
        items: [
          {
            cartItemId: "item-1",
            menuItemId: "frites",
            name: "Frites",
            image: "https://example.com/frites.jpg",
            basePrice: 200,
            selectedSauces: [],
            selectedExtras: [],
            quantity: 1,
            unitPrice: 200,
            totalPrice: 200,
          },
        ],
      });
    }).toThrow("Le numéro de table est requis pour les commandes sur place.");
  });

  it("updates order status progressively", () => {
    const order = StorageService.createOrder({
      tableNumber: 4,
      orderType: "dine-in",
      items: [
        {
          cartItemId: "item-1",
          menuItemId: "selecto",
          name: "Selecto",
          image: "https://example.com/selecto.jpg",
          basePrice: 80,
          selectedSauces: [],
          selectedExtras: [],
          quantity: 1,
          unitPrice: 80,
          totalPrice: 80,
        },
      ],
    });

    const preparing = StorageService.updateOrderStatus(order.id, "preparing");
    expect(preparing?.status).toBe("preparing");

    const ready = StorageService.updateOrderStatus(order.id, "ready");
    expect(ready?.status).toBe("ready");

    const served = StorageService.updateOrderStatus(order.id, "served", "paid");
    expect(served?.status).toBe("served");
    expect(served?.paymentStatus).toBe("paid");
  });

  it("handles waiter call lifecycle", () => {
    const call = StorageService.createWaiterCall(8, "request_bill", "Addition par carte");
    expect(call.tableNumber).toBe(8);
    expect(call.reason).toBe("request_bill");
    expect(call.status).toBe("pending");

    const calls = StorageService.getAllWaiterCalls();
    expect(calls.some((c) => c.id === call.id)).toBe(true);

    const resolved = StorageService.resolveWaiterCall(call.id);
    expect(resolved?.status).toBe("resolved");
    expect(resolved?.resolvedAt).toBeDefined();
  });

  it("allows toggling menu item inStock status", () => {
    const menuBefore = StorageService.getMenu();
    const item = menuBefore[0];
    expect(item.inStock).toBe(true);

    StorageService.toggleItemStock(item.id, false);

    const menuAfter = StorageService.getMenu();
    const updatedItem = menuAfter.find((i) => i.id === item.id);
    expect(updatedItem?.inStock).toBe(false);

    StorageService.toggleItemStock(item.id, true);
    const restoredMenu = StorageService.getMenu();
    expect(restoredMenu.find((i) => i.id === item.id)?.inStock).toBe(true);
  });

  it("calculates restaurant analytics correctly", () => {
    StorageService.createOrder({
      tableNumber: 1,
      orderType: "dine-in",
      items: [
        {
          cartItemId: "i1",
          menuItemId: "tacos",
          name: "Tacos Le Boss",
          image: "",
          basePrice: 650,
          selectedSauces: [],
          selectedExtras: [],
          quantity: 2,
          unitPrice: 650,
          totalPrice: 1300,
        },
      ],
    });

    const stats = StorageService.getRestaurantStats();
    expect(stats.totalOrders).toBe(1);
    expect(stats.activeOrders).toBe(1);
    expect(stats.totalRevenue).toBe(1300);
    expect(stats.popularItems[0].name).toBe("Tacos Le Boss");
    expect(stats.popularItems[0].count).toBe(2);
  });
});
