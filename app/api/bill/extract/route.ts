import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Strict Zod Schemas
const BillItemSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  batchNo: z.string().default("BATCH-DEMO"),
  expiryDate: z.string().default("2028-12-31"),
  quantity: z.coerce.number().int().positive().default(10),
  mrp: z.coerce.number().positive().default(100),
  purchaseRate: z.coerce.number().positive().default(75),
  manufacturer: z.string().default("Generic Pharma"),
});

const BillExtractResponseSchema = z.object({
  invoiceNumber: z.string().optional().default("INV-DEMO"),
  distributorName: z.string().optional().default("Awadh Pharma Distributors, Lucknow"),
  invoiceDate: z.string().optional().default(new Date().toISOString().split("T")[0]),
  items: z.array(BillItemSchema).min(1, "At least one line item required"),
});

type ExtractedBillItem = z.infer<typeof BillItemSchema>;

// Helper to fuzzy match medicine name against DB
function findBestMedicineMatch(
  queryName: string,
  medicines: Array<{
    id: string;
    brandName: string;
    mrp: number;
    ceilingPrice: number | null;
    isScheduledPriceControlled: boolean;
    manufacturer: string;
    packSize: number;
    dosageForm: string;
  }>
) {
  const q = queryName.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
  const qWords = q.split(/\s+/).filter(Boolean);

  let bestMatch: (typeof medicines)[0] | null = null;
  let highestScore = 0;

  for (const med of medicines) {
    const brand = med.brandName.toLowerCase();

    // Exact match
    if (brand === q) {
      return { med, confidence: "high" as const };
    }

    // Substring match
    if (brand.includes(q) || q.includes(brand)) {
      const score = 100 - Math.abs(brand.length - q.length);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = med;
      }
      continue;
    }

    // Word overlap match
    let matchCount = 0;
    for (const word of qWords) {
      if (word.length > 2 && brand.includes(word)) {
        matchCount += 1;
      }
    }
    if (matchCount > 0 && matchCount * 20 > highestScore) {
      highestScore = matchCount * 20;
      bestMatch = med;
    }
  }

  if (bestMatch && highestScore >= 20) {
    return {
      med: bestMatch,
      confidence: highestScore > 40 ? ("high" as const) : ("medium" as const),
    };
  }

  return { med: null, confidence: "none" as const };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const forceMock = formData.get("mock") === "true";
    const apiKey = process.env.GEMINI_API_KEY;

    // Load all DB medicines for matching
    const allMedicines = await db.medicine.findMany({
      select: {
        id: true,
        brandName: true,
        mrp: true,
        ceilingPrice: true,
        isScheduledPriceControlled: true,
        manufacturer: true,
        packSize: true,
        dosageForm: true,
      },
    });

    let extractedData: z.infer<typeof BillExtractResponseSchema> | null = null;
    let extractionSource = "fallback";

    // 1. Try Gemini Multimodal Vision if key & file provided
    if (apiKey && file && !forceMock) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString("base64");
        const mimeType = file.type || "image/jpeg";

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
You are an expert pharmaceutical invoice OCR assistant for Indian retail chemists.
Extract all medicine line items from this wholesale invoice or purchase bill.
Return ONLY valid JSON matching this exact structure:
{
  "invoiceNumber": string,
  "distributorName": string,
  "invoiceDate": string (YYYY-MM-DD),
  "items": [
    {
      "productName": string (e.g. "Dolo 650 Tablet"),
      "batchNo": string (e.g. "DL26M14"),
      "expiryDate": string (YYYY-MM-DD),
      "quantity": number (integer packs received),
      "mrp": number (maximum retail price),
      "purchaseRate": number (wholesale purchase rate per pack),
      "manufacturer": string (company name)
    }
  ]
}
If any field like batch or expiry is unclear, make your best clinical guess. Return strictly valid JSON, with no markdown code fences or comments.
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

        // Validate with Zod
        const validated = BillExtractResponseSchema.safeParse(parsed);
        if (validated.success) {
          extractedData = validated.data;
          extractionSource = "gemini_vision";
        } else {
          console.warn("Zod validation failed on Gemini bill OCR output:", validated.error);
        }
      } catch (geminiError) {
        console.warn("Gemini vision bill extraction error:", geminiError);
      }
    }

    // 2. Fallback to /data/sample-bill.json if Gemini is unavailable or failed
    if (!extractedData) {
      const samplePath = path.join(process.cwd(), "data", "sample-bill.json");
      const content = fs.readFileSync(samplePath, "utf-8");
      const sampleJson = JSON.parse(content);
      const validated = BillExtractResponseSchema.parse(sampleJson);
      extractedData = validated;
      extractionSource = forceMock ? "mock_demo" : "sample_bill_fallback";
    }

    // 3. Process each line item with fuzzy-matching against database
    const mappedItems = extractedData.items.map((item, idx) => {
      const matchResult = findBestMedicineMatch(item.productName, allMedicines);
      const med = matchResult.med;

      const effectiveMrp = med ? med.mrp : item.mrp;
      const ceilingPrice = med?.ceilingPrice || null;
      const isPriceControlled = med?.isScheduledPriceControlled || false;

      // Default selling price is MRP, or purchaseRate + 15% margin
      const defaultSellingPrice = Number(
        Math.min(effectiveMrp, item.purchaseRate * 1.15).toFixed(2)
      );

      return {
        lineId: `line-${idx + 1}`,
        productName: item.productName,
        batchNo: item.batchNo,
        expiryDate: item.expiryDate,
        quantity: item.quantity,
        mrp: effectiveMrp,
        purchaseRate: item.purchaseRate,
        manufacturer: item.manufacturer || med?.manufacturer || "Generic Pharma",
        // DB Match Fields
        matchedMedicineId: med ? med.id : null,
        matchedMedicineName: med ? med.brandName : null,
        matchedDosageForm: med ? med.dosageForm : "tablet",
        matchedPackSize: med ? med.packSize : 10,
        ceilingPrice,
        isScheduledPriceControlled: isPriceControlled,
        confidence: matchResult.confidence,
        // Shopkeeper Editable Pricing
        sellingPrice: defaultSellingPrice,
        isAboveCeiling: ceilingPrice !== null && defaultSellingPrice > ceilingPrice,
        isNewMedicine: med === null,
      };
    });

    return NextResponse.json({
      success: true,
      source: extractionSource,
      invoiceNumber: extractedData.invoiceNumber,
      distributorName: extractedData.distributorName,
      invoiceDate: extractedData.invoiceDate,
      totalItemsCount: mappedItems.length,
      matchedCount: mappedItems.filter((i) => i.matchedMedicineId !== null).length,
      unmatchedCount: mappedItems.filter((i) => i.matchedMedicineId === null).length,
      items: mappedItems,
      availableDbMedicines: allMedicines.map((m) => ({
        id: m.id,
        brandName: m.brandName,
        mrp: m.mrp,
        ceilingPrice: m.ceilingPrice,
        isScheduledPriceControlled: m.isScheduledPriceControlled,
      })),
    });
  } catch (error) {
    console.error("Bill extract error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to extract line items from bill" },
      { status: 500 }
    );
  }
}
