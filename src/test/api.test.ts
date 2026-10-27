import { describe, it, expect, beforeEach } from "vitest";
import { StorageService } from "@/lib/storage";
import { GET as getMenu, PATCH as patchMenu } from "@/app/api/menu/route";
import { GET as getOrders, POST as postOrders } from "@/app/api/orders/route";
import { GET as getOrderById, PATCH as patchOrderById } from "@/app/api/orders/[id]/route";
import { GET as getCalls, POST as postCall } from "@/app/api/waiter-call/route";
import { PATCH as resolveCall } from "@/app/api/waiter-call/[id]/route";
import { GET as getStats } from "@/app/api/stats/route";

describe("API Routes Integration Tests", () => {
  beforeEach(() => {
    StorageService.resetForTesting();
  });

  it("GET /api/menu returns categories and menu items", async () => {
    const res = await getMenu();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.categories.length).toBeGreaterThan(0);
    expect(data.items.length).toBeGreaterThan(0);
    expect(data.items.some((i: any) => i.name.includes("Tacos"))).toBe(true);
  });

  it("PATCH /api/menu toggles item stock", async () => {
    const req = new Request("http://localhost/api/menu", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: "tacos-le-boss", inStock: false }),
    });

    const res = await patchMenu(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);

    const menu = StorageService.getMenu();
    const item = menu.find((i) => i.id === "tacos-le-boss");
    expect(item?.inStock).toBe(false);
  });

  it("POST /api/orders creates a new table order", async () => {
    const req = new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableNumber: 4,
        customerName: "Riad",
        orderType: "dine-in",
        items: [
          {
            cartItemId: "c-100",
            menuItemId: "tacos-le-boss",
            name: "Tacos Le Boss",
            image: "",
            basePrice: 650,
            selectedSauces: ["Sauce Algérienne"],
            selectedExtras: [],
            quantity: 2,
            unitPrice: 650,
            totalPrice: 1300,
          },
        ],
        notes: "Pas trop de sauce",
      }),
    });

    const res = await postOrders(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.order.orderNumber).toMatch(/^DZ-\d{4}$/);
    expect(data.order.total).toBe(1300);

    // Verify GET /api/orders/[id]
    const getRes = await getOrderById(new Request("http://localhost"), {
      params: Promise.resolve({ id: data.order.id }),
    });
    const fetched = await getRes.json();
    expect(fetched.order.id).toBe(data.order.id);

    // Verify PATCH /api/orders/[id] status to 'preparing'
    const patchReq = new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "preparing" }),
    });
    const patchRes = await patchOrderById(patchReq, {
      params: Promise.resolve({ id: data.order.id }),
    });
    const updated = await patchRes.json();
    expect(updated.order.status).toBe("preparing");
  });

  it("POST /api/orders rejects empty order with 400", async () => {
    const req = new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableNumber: 2,
        items: [],
      }),
    });

    const res = await postOrders(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("handles waiter call and resolution through API", async () => {
    const postReq = new Request("http://localhost/api/waiter-call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableNumber: 12,
        reason: "request_bill",
      }),
    });

    const postRes = await postCall(postReq);
    const postData = await postRes.json();

    expect(postRes.status).toBe(201);
    expect(postData.call.tableNumber).toBe(12);

    const getRes = await getCalls();
    const listData = await getRes.json();
    expect(listData.calls.some((c: any) => c.id === postData.call.id)).toBe(true);

    const resolveRes = await resolveCall(new Request("http://localhost"), {
      params: Promise.resolve({ id: postData.call.id }),
    });
    const resolvedData = await resolveRes.json();
    expect(resolvedData.call.status).toBe("resolved");
  });

  it("GET /api/stats returns current metrics", async () => {
    const res = await getStats();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stats).toHaveProperty("totalOrders");
    expect(data.stats).toHaveProperty("totalRevenue");
    expect(data.stats).toHaveProperty("activeOrders");
  });
});
