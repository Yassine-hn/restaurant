import { NextResponse } from "next/server";
import { StorageService } from "@/lib/storage";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resolved = StorageService.resolveWaiterCall(id);

    if (!resolved) {
      return NextResponse.json(
        { success: false, error: "Appel introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      call: resolved,
    });
  } catch (error) {
    console.error("Failed to resolve waiter call:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
