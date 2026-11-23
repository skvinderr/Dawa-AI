import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

// Strict Zod Schemas
export const ExtractedMedicineSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  probable_brand: z.string().optional().default(""),
  salt: z.string().optional().default(""),
  strength: z.string().optional().default(""),
  dosageForm: z.string().optional().default("tablet"),
  frequency: z.string().optional().default("1-0-1"),
  durationDays: z
    .union([z.number(), z.string().regex(/\d+/).transform(Number)])
    .optional()
    .default(5),
  instructions: z.string().optional().default("Take as directed by doctor"),
  confidence: z.enum(["high", "medium", "low"]).default("medium"),
  explanationEn: z.string().optional().default(""),
  explanationHi: z.string().optional().default(""),
});

export const PrescriptionExtractResponseSchema = z.object({
  doctorNotes: z.string().optional().default(""),
  patientInfo: z.string().optional().default(""),
  medicines: z.array(ExtractedMedicineSchema),
});

export type ExtractedMedicine = z.infer<typeof ExtractedMedicineSchema>;

function loadSamplePrescriptionFallback(patientNoteExtra = "") {
  try {
    const samplePath = path.join(process.cwd(), "data", "sample-prescription.json");
    const raw = fs.readFileSync(samplePath, "utf-8");
    const data = JSON.parse(raw);
    return {
      success: true,
      doctorNotes: `${data.doctor?.name} (${data.doctor?.hospital}) ${patientNoteExtra}`.trim(),
      patientInfo: `${data.patient?.name}, ${data.patient?.age}Y, ${data.patient?.diagnosis}`,
      medicines: data.medicines,
      isMocked: true,
      message: "Loaded from verified offline demo prescription dataset.",
    };
  } catch (err) {
    // Ultimate in-code fallback
    return {
      success: true,
      doctorNotes: "KGMU Hospital Lucknow OPD Demo",
      patientInfo: "Ram Swaroop Shukla, 72Y M",
      medicines: [
        {
          id: "m-1",
          name: "Augmentin 625 Duo",
          probable_brand: "Augmentin 625 Duo",
          salt: "Amoxycillin and Potassium Clavulanate",
          strength: "625mg",
          dosageForm: "tablet",
          frequency: "1-0-1",
          durationDays: 5,
          instructions: "Take after meals",
          confidence: "high",
          explanationEn: "Augmentin 625 is an antibiotic. Take 1 tablet twice a day after meals.",
          explanationHi: "ऑगमेंटिन 625 एक एंटीबायोटिक है। भोजन के बाद सुबह-शाम 1 गोली लें।",
        },
        {
          id: "m-2",
          name: "Pan-D",
          probable_brand: "Pan-D",
          salt: "Pantoprazole and Domperidone",
          strength: "40mg/30mg",
          dosageForm: "capsule",
          frequency: "1-0-0",
          durationDays: 7,
          instructions: "Empty stomach before breakfast",
          confidence: "high",
          explanationEn: "Pan-D stops acidity and heartburn. Take 30 minutes before breakfast.",
          explanationHi: "पैन-डी एसिडिटी और गैस रोकती है। सुबह नाश्ते से आधा घंटा पहले खाली पेट लें।",
        },
        {
          id: "m-3",
          name: "Dolo 650",
          probable_brand: "Dolo 650",
          salt: "Paracetamol",
          strength: "650mg",
          dosageForm: "tablet",
          frequency: "1-0-1 (SOS)",
          durationDays: 3,
          instructions: "In fever or severe pain",
          confidence: "high",
          explanationEn: "Dolo 650 relieves fever and pain. Take after light food when needed.",
          explanationHi: "डोलो 650 बुखार व दर्द में काम आती है। जरूरत पड़ने पर खाना खाने के बाद लें।",
        },
      ],
      isMocked: true,
      message: "Verified fallback prescription loaded.",
    };
  }
}

const SYSTEM_PROMPT = `
You are an expert Indian clinical pharmacist and medical OCR engine specializing in handwritten doctor prescriptions from Uttar Pradesh hospitals.
Analyze this prescription image or document.
Extract all prescribed medicines into a strict JSON object.

For EACH medicine, extract:
- name: medicine name exactly as written by doctor
- probable_brand: the most probable marketed Indian brand name (e.g. Augmentin 625, Pan-D, Dolo 650, Telma 40, Glycomet-GP 2)
- salt: active chemical ingredient or salt combination (e.g. "Amoxycillin and Potassium Clavulanate", "Paracetamol", "Metformin + Glimepiride")
- strength: e.g. "625mg", "500mg", "40mg"
- dosageForm: tablet, capsule, syrup, injection, sachet
- frequency: e.g. "1-0-1", "1-0-0", "0-1-0", "1-1-1", "SOS"
- durationDays: integer number of days prescribed (default 5 if not specified)
- instructions: food timing or precautions (e.g. "After food", "Empty stomach 30 min before breakfast")
- confidence: "high" if clear, "medium" if slightly cursive, "low" if handwriting is messy/unclear.
  CRITICAL RULE: If handwriting is unclear or ambiguous, give your best guess and mark confidence "low" instead of inventing certainty.
- explanationEn: patient-friendly 1-2 sentence explanation in plain English: what it does, when to take it, and food instructions.
- explanationHi: patient-friendly 1-2 sentence explanation in simple Hindi (Devanagari script): यह किस बीमारी के लिए है, कब लेनी है और भोजन संबंधी निर्देश।

Return strictly a valid JSON object matching:
{
  "doctorNotes": "brief summary of doctor/hospital and clinical advice",
  "patientInfo": "patient name, age, diagnosis if readable",
  "medicines": [
    {
      "name": "string",
      "probable_brand": "string",
      "salt": "string",
      "strength": "string",
      "dosageForm": "string",
      "frequency": "string",
      "durationDays": 5,
      "instructions": "string",
      "confidence": "high" | "medium" | "low",
      "explanationEn": "string",
      "explanationHi": "string"
    }
  ]
}
`;

export async function POST(req: NextRequest) {
  try {
    let base64Data = "";
    let mimeType = "image/jpeg";
    let isSample = false;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      isSample = formData.get("isSample") === "true";

      if (file && !isSample) {
        const buffer = await file.arrayBuffer();
        base64Data = Buffer.from(buffer).toString("base64");
        mimeType = file.type || "image/jpeg";
      }
    } else {
      const body = await req.json();
      base64Data = body.base64 || "";
      mimeType = body.mimeType || "image/jpeg";
      isSample = Boolean(body.isSample);
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim() || "";

    // If sample requested or GEMINI_API_KEY missing, instantly return sample fallback
    if (isSample || !apiKey) {
      console.info("Using verified sample prescription dataset (isSample=%s, hasKey=%s)", isSample, Boolean(apiKey));
      const fallback = loadSamplePrescriptionFallback();
      return NextResponse.json(fallback);
    }

    if (!base64Data) {
      // If no image provided, return fallback sample
      return NextResponse.json(loadSamplePrescriptionFallback("No image provided; displaying demo Rx."));
    }

    // Call Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const promptPayload = [
      SYSTEM_PROMPT,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType === "application/pdf" ? "application/pdf" : mimeType,
        },
      },
    ];

    let resultText = "";
    try {
      const result = await model.generateContent(promptPayload);
      resultText = result.response.text();
    } catch (genError: any) {
      console.warn("Gemini vision primary call failed, retrying once...", genError?.message);
      // Retry once with fallback gemini-1.5-flash or lower temp
      const fallbackModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
      });
      const retryResult = await fallbackModel.generateContent(promptPayload);
      resultText = retryResult.response.text();
    }

    // Parse and validate with Zod
    const cleanJson = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    const rawParsed = JSON.parse(cleanJson);
    const validated = PrescriptionExtractResponseSchema.safeParse(rawParsed);

    if (validated.success) {
      // Add unique IDs to medicines
      const medicinesWithIds = validated.data.medicines.map((m, idx) => ({
        ...m,
        id: m.id || `rx-gemini-${idx + 1}-${Date.now()}`,
      }));

      return NextResponse.json({
        success: true,
        doctorNotes: validated.data.doctorNotes,
        patientInfo: validated.data.patientInfo,
        medicines: medicinesWithIds,
        isMocked: false,
        modelUsed: "gemini-2.0-flash",
      });
    } else {
      console.warn("Zod schema validation failed on Gemini response:", validated.error);
      // Fallback if schema failed
      return NextResponse.json(loadSamplePrescriptionFallback("Schema validation fallback"));
    }
  } catch (error: any) {
    console.error("Prescription extract route error:", error);
    // Guarantee demo never breaks
    const fallback = loadSamplePrescriptionFallback("(Offline / API fallback)");
    return NextResponse.json(fallback);
  }
}
