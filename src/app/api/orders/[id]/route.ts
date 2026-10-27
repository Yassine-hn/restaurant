import { NextResponse } from "next/server";
import { StorageService } from "@/lib/storage";
import { OrderStatus } from "@/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = StorageService.getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Commande introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus } = body;

    const validStatuses: OrderStatus[] = ["received", "preparing", "ready", "served", "cancelled"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Statut de commande invalide" },
        { status: 400 }
      );
    }

    const updated = StorageService.updateOrderStatus(id, status, paymentStatus);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Commande introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: updated,
    });
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
