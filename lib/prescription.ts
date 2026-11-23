import { z } from "zod";

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
