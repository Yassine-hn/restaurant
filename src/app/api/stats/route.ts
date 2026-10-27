import { NextResponse } from "next/server";
import { StorageService } from "@/lib/storage";

export async function GET() {
  try {
    const stats = StorageService.getRestaurantStats();
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { success: false, error: "Impossible de récupérer les statistiques" },
      { status: 500 }
    );
  }
}
