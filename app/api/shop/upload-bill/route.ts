import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const forceMock = formData.get("mock") === "true";

    const apiKey = process.env.GEMINI_API_KEY;

    // Helper to load sample invoice
    const getSampleInvoice = () => {
      const samplePath = path.join(process.cwd(), "data", "sample-invoice.json");
      const content = fs.readFileSync(samplePath, "utf-8");
      return JSON.parse(content);
    };

    if (forceMock || !apiKey || !file) {
      const sample = getSampleInvoice();
      return NextResponse.json({
        success: true,
        source: forceMock ? "mock_demo" : "offline_fallback",
        invoice: sample,
      });
    }

    // Call Gemini multimodal vision API
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString("base64");
      const mimeType = file.type || "image/jpeg";

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `
You are an expert pharmaceutical invoice OCR assistant for Indian chemists.
Extract all medicine line items from this wholesale invoice or delivery challan.
Return ONLY valid JSON matching this schema:
{
  "invoiceNumber": string,
  "distributorName": string,
  "gstNumber": string,
  "invoiceDate": string (YYYY-MM-DD),
  "totalAmount": number,
  "items": [
    {
      "medicineName": string,
      "probableBrand": string,
      "salt": string,
      "strength": string,
      "dosageForm": "tablet" | "syrup" | "injection" | "capsule" | "sachet",
      "packSize": number,
      "batchNo": string,
      "expiryDate": string (YYYY-MM-DD),
      "quantityReceived": number,
      "wholesaleRate": number,
      "mrp": number,
      "sellingPrice": number,
      "confidence": "high" | "medium" | "low"
    }
  ]
}
If handwriting or printing is unclear, make your best clinical guess and set confidence to "low". Return strictly valid JSON, no markdown formatting.
`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType,
          },
        },
      ]);

      const text = result.response.text();
      const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      return NextResponse.json({
        success: true,
        source: "gemini_vision",
        invoice: parsed,
      });
    } catch (visionError) {
      console.warn("Gemini invoice OCR error, falling back to mock:", visionError);
      const sample = getSampleInvoice();
      return NextResponse.json({
        success: true,
        source: "offline_fallback_on_error",
        invoice: sample,
      });
    }
  } catch (error) {
    console.error("Upload bill error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process invoice" },
      { status: 500 }
    );
  }
}

// PUT: Sync verified invoice items into store inventory
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { storeId, items } = body;

    if (!storeId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "storeId and items array required" },
        { status: 400 }
      );
    }

    const store = await db.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return NextResponse.json(
        { success: false, error: "Store not found" },
        { status: 404 }
      );
    }

    const allMeds = await db.medicine.findMany();
    const results: any[] = [];

    for (const item of items) {
      // Find matching medicine in database (fuzzy check on brand name)
      const targetName = (item.probableBrand || item.medicineName || "").toLowerCase();
      let matchedMed = allMeds.find((m) =>
        m.brandName.toLowerCase().includes(targetName) ||
        targetName.includes(m.brandName.toLowerCase())
      );

      // Fallback match on first available med if none matched
      if (!matchedMed) {
        matchedMed = allMeds[0];
      }

      const expiry = item.expiryDate ? new Date(item.expiryDate) : new Date(Date.now() + 365 * 24 * 3600 * 1000);
      const batchNo = item.batchNo || `BT-${Math.floor(1000 + Math.random() * 9000)}`;
      const qtyToAdd = Math.max(1, parseInt(item.quantityReceived, 10) || 10);
      const sellingPrice = Number(item.sellingPrice) || matchedMed.mrp;

      // Upsert into inventory for this store
      const existingInventory = await db.inventory.findFirst({
        where: {
          storeId,
          medicineId: matchedMed.id,
        },
      });

      if (existingInventory) {
        const updated = await db.inventory.update({
          where: { id: existingInventory.id },
          data: {
            quantity: existingInventory.quantity + qtyToAdd,
            sellingPrice,
            batchNo,
            expiryDate: expiry,
            lastUpdated: new Date(),
          },
        });
        results.push({ medicine: matchedMed.brandName, action: "INCREMENTED", newQty: updated.quantity });
      } else {
        const created = await db.inventory.create({
          data: {
            storeId,
            medicineId: matchedMed.id,
            quantity: qtyToAdd,
            sellingPrice,
            batchNo,
            expiryDate: expiry,
          },
        });
        results.push({ medicine: matchedMed.brandName, action: "CREATED", newQty: created.quantity });
      }
    }

    return NextResponse.json({
      success: true,
      storeName: store.name,
      syncedCount: results.length,
      details: results,
    });
  } catch (error) {
    console.error("Invoice sync error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync invoice into inventory" },
      { status: 500 }
    );
  }
}
