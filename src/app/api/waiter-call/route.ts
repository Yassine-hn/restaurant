import { NextResponse } from "next/server";
import { StorageService } from "@/lib/storage";
import { WaiterCallReason } from "@/types";

export async function GET() {
  try {
    const calls = StorageService.getAllWaiterCalls();
    return NextResponse.json({
      success: true,
      calls,
    });
  } catch (error) {
    console.error("Failed to fetch waiter calls:", error);
    return NextResponse.json(
      { success: false, error: "Impossible de récupérer les appels" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableNumber, reason, customMessage } = body;

    if (!tableNumber) {
      return NextResponse.json(
        { success: false, error: "Le numéro de table est requis." },
        { status: 400 }
      );
    }

    const validReasons: WaiterCallReason[] = ["call_waiter", "request_bill", "water", "help"];
    const callReason = validReasons.includes(reason) ? reason : "call_waiter";

    const call = StorageService.createWaiterCall(tableNumber, callReason, customMessage);

    return NextResponse.json(
      {
        success: true,
        call,
        message:
          reason === "request_bill"
            ? "L'addition a été demandée, le serveur arrive !"
            : "Le serveur a été notifié et arrive à votre table.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create waiter call:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erreur serveur" },
      { status: 400 }
    );
  }
}
