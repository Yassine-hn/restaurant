import { NextResponse } from "next/server";
import { StorageService } from "@/lib/storage";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableParam = searchParams.get("table");
    const statusParam = searchParams.get("status");

    let orders = tableParam
      ? StorageService.getOrdersByTable(tableParam)
      : StorageService.getAllOrders();

    if (statusParam) {
      orders = orders.filter((o) => o.status === statusParam);
    }

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { success: false, error: "Impossible de récupérer les commandes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableNumber, customerName, orderType, items, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Votre panier est vide." },
        { status: 400 }
      );
    }

    if (!tableNumber && orderType !== "takeaway") {
      return NextResponse.json(
        { success: false, error: "Veuillez indiquer ou scanner votre numéro de table." },
        { status: 400 }
      );
    }

    const newOrder = StorageService.createOrder({
      tableNumber: tableNumber || "À Emporter",
      customerName,
      orderType: orderType || "dine-in",
      items,
      notes,
    });

    return NextResponse.json(
      {
        success: true,
        order: newOrder,
        message: "Commande enregistrée avec succès !",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors de la création de la commande" },
      { status: 400 }
    );
  }
}
