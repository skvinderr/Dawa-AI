import { NextRequest, NextResponse } from "next/server";
import { getSubstitutesForMedicine } from "@/lib/substitution";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const medicineId = searchParams.get("medicineId");

    if (!medicineId) {
      return NextResponse.json(
        { error: "medicineId query parameter is required" },
        { status: 400 }
      );
    }

    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const onlyInStockParam = searchParams.get("onlyInStock");

    const userLat = latParam ? parseFloat(latParam) : undefined;
    const userLng = lngParam ? parseFloat(lngParam) : undefined;
    const onlyInStock = onlyInStockParam !== null ? onlyInStockParam === "true" : true;

    const result = await getSubstitutesForMedicine(medicineId, {
      userLat,
      userLng,
      onlyInStock,
    });

    if (!result) {
      return NextResponse.json(
        { error: `Medicine with ID '${medicineId}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Substitutes API route error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
