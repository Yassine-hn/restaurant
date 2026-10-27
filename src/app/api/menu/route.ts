import { NextResponse } from "next/server";
import { StorageService } from "@/lib/storage";
import { CATEGORIES } from "@/lib/menu-data";

export async function GET() {
  try {
    const items = StorageService.getMenu();
    return NextResponse.json({
      success: true,
      categories: CATEGORIES,
      items,
    });
  } catch (error) {
    console.error("Failed to fetch menu:", error);
    return NextResponse.json(
      { success: false, error: "Impossible de charger le menu" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { itemId, inStock } = body;

    if (!itemId || typeof inStock !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Données invalides (itemId et inStock requis)" },
        { status: 400 }
      );
    }

    StorageService.toggleItemStock(itemId, inStock);
    return NextResponse.json({ success: true, itemId, inStock });
  } catch (error) {
    console.error("Failed to update item stock:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour du stock" },
      { status: 500 }
    );
  }
}
