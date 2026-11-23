"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import {
  UploadCloud,
  FileText,
  RotateCw,
  Trash2,
  Plus,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Store as StoreIcon,
  MapPin,
  Clock,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Info
} from "lucide-react";
import { CardSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { SubstitutePanel } from "@/components/SubstitutePanel";

interface ExtractedMedicineItem {
  id: string;
  name: string;
  probable_brand: string;
  salt: string;
  strength: string;
  dosageForm: string;
  frequency: string;
  durationDays: number;
  instructions: string;
  confidence: "high" | "medium" | "low";
  explanationEn: string;
  explanationHi: string;
}

interface MatchResult {
  prescribedName: string;
  extractedItem: ExtractedMedicineItem;
  dbMedicine: {
    id: string;
    brandName: string;
    manufacturer: string;
    dosageForm: string;
    packSize: number;
    mrp: number;
    isJanAushadhi: boolean;
    isGeneric: boolean;
    lowestPrice: number;
    inStockCount: number;
    salts: Array<{
      name: string;
      strength: string;
      category: string;
      isNarrowTherapeuticIndex: boolean;
    }>;
  };
  genericSubstitute: {
    id: string;
    brandName: string;
    manufacturer: string;
    mrp: number;
    lowestPrice: number | null;
    isJanAushadhi: boolean;
    inStockCount: number;
    savingsAmount: number;
    savingsPercent: number;
  } | null;
}

export default function PrescriptionUploadPage() {
  const { t, dict, language } = useTranslation();

  // Upload & File State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [rotation, setRotation] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extraction State
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedMedicines, setExtractedMedicines] = useState<ExtractedMedicineItem[]>([]);
  const [doctorNotes, setDoctorNotes] = useState<string>("");
  const [patientInfo, setPatientInfo] = useState<string>("");
  const [isDemoMock, setIsDemoMock] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  // Matching & Store Basket State
  const [isMatching, setIsMatching] = useState(false);
  const [matchedResults, setMatchedResults] = useState<MatchResult[]>([]);
  const [basketResult, setBasketResult] = useState<any>(null);
  const [showBasketModal, setShowBasketModal] = useState(false);

  // Audio / Speech Synthesis State
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadFile(file);
    }
  };

  const loadFile = (file: File) => {
    setSelectedFile(file);
    setRotation(0);
    const pdfCheck = file.type === "application/pdf" || file.name.endsWith(".pdf");
    setIsPdf(pdfCheck);

    if (pdfCheck) {
      setPreviewUrl(null);
    } else {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Load sample demo prescription
  const handleLoadSample = async () => {
    setRotation(0);
    setIsPdf(false);
    setPreviewUrl("/samples/sample-prescription.svg");
    setSelectedFile(null);
    await triggerExtraction(true);
  };

  // Trigger OCR extraction
  const triggerExtraction = async (useSample: boolean = false) => {
    setIsExtracting(true);
    setHasScanned(false);

    try {
      let res: Response;
      if (useSample || !selectedFile) {
        res = await fetch("/api/prescription/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isSample: true }),
        });
      } else {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("isSample", "false");
        res = await fetch("/api/prescription/extract", {
          method: "POST",
          body: formData,
        });
      }

      const data = await res.json();
      if (data.medicines && Array.isArray(data.medicines)) {
        setExtractedMedicines(data.medicines);
        setDoctorNotes(data.doctorNotes || "");
        setPatientInfo(data.patientInfo || "");
        setIsDemoMock(Boolean(data.isMocked));
        setHasScanned(true);

        // Automatically match with DB
        await matchWithDatabase(data.medicines);
      }
    } catch (err) {
      console.error("Extraction error:", err);
    } finally {
      setIsExtracting(false);
    }
  };

  // Match extracted medicines with DB and compute basket
  const matchWithDatabase = async (medicinesList: ExtractedMedicineItem[]) => {
    setIsMatching(true);
    try {
      const res = await fetch("/api/prescription/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicines: medicinesList,
          userLat: 26.8528, // Central Lucknow (Hazratganj)
          userLng: 80.9463,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMatchedResults(data.matches || []);
        setBasketResult(data.basket || null);
      }
    } catch (err) {
      console.error("Match error:", err);
    } finally {
      setIsMatching(false);
    }
  };

  // Table row editing
  const updateMedicineRow = (id: string, field: keyof ExtractedMedicineItem, value: any) => {
    setExtractedMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const deleteMedicineRow = (id: string) => {
    const updated = extractedMedicines.filter((m) => m.id !== id);
    setExtractedMedicines(updated);
    matchWithDatabase(updated);
  };

  const addMedicineRow = () => {
    const newMed: ExtractedMedicineItem = {
      id: `rx-manual-${Date.now()}`,
      name: "New Medicine",
      probable_brand: "New Medicine",
      salt: "",
      strength: "500mg",
      dosageForm: "tablet",
      frequency: "1-0-1",
      durationDays: 5,
      instructions: "Take after meals",
      confidence: "high",
      explanationEn: "Take as advised by your doctor or pharmacist.",
      explanationHi: "डॉक्टर अथवा फार्मासिस्ट के निर्देशानुसार लें।",
    };
    const updated = [...extractedMedicines, newMed];
    setExtractedMedicines(updated);
    matchWithDatabase(updated);
  };

  // Speech Synthesis Read Aloud
  const handleReadAloud = (med: ExtractedMedicineItem) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported on your browser.");
      return;
    }

    if (speakingId === med.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Plain language speech script
    const textToSpeak =
      language === "hi"
        ? med.explanationHi ||
        `दवा का नाम: ${med.name}। खुराक: ${med.frequency}। निर्देश: ${med.instructions}।`
        : med.explanationEn ||
        `Medicine: ${med.name}. Dosage frequency: ${med.frequency}. Instructions: ${med.instructions}.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 0.9;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(med.id);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-health-800 via-health-700 to-teal-800 text-white py-8 sm:py-12 border-b border-health-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-health-900/60 border border-health-500/50 text-health-200 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-health-400" />
                <span>Multimodal Vision OCR • Gemini 2.0 Flash</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                {language === "hi"
                  ? "डॉक्टर का पर्चा AI स्कैन करें"
                  : "AI Prescription OCR & Discovery"}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-health-100/90 max-w-2xl">
                {language === "hi"
                  ? "पर्चे की फोटो अपलोड करें। AI डॉक्टर की लिखावट पहचानकर नजदीकी मेडिकल स्टोर में लाइव स्टॉक और 80% तक सस्ते जन औषधि विकल्प ढूंढेगा।"
                  : "Upload or photograph any doctor prescription. Gemini AI transcribes medicines, cross-checks active salts, and finds the nearest store with maximum stock & Jan Aushadhi savings."}
              </p>
            </div>

            {/* Quick Demo Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSample}
                className="px-4 py-2.5 rounded-2xl bg-white text-health-800 hover:bg-health-50 font-bold text-sm shadow-md transition-all flex items-center gap-2 group"
              >
                <Sparkles className="w-4 h-4 text-health-600 group-hover:rotate-12 transition-transform" />
                <span>{language === "hi" ? "डेमो पर्चा लोड करें" : "Try Sample Rx"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Step 1: Upload Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-health-100 shadow-soft-lg mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Upload Area */}
            <div className="lg:col-span-7 space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-health-300 hover:border-health-500 rounded-3xl p-6 sm:p-10 text-center cursor-pointer transition-all bg-health-50/40 hover:bg-health-50 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-2xl bg-white text-health-600 shadow-soft flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform border border-health-100">
                  <UploadCloud className="w-8 h-8 stroke-[2.2]" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
                  {selectedFile
                    ? selectedFile.name
                    : language === "hi"
                      ? "पर्चे की फोटो या PDF यहां अपलोड करें"
                      : "Upload Prescription Photo or PDF"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-4">
                  {language === "hi"
                    ? "कैमरे से फोटो खींचें या गैलरी से चुनें (PNG, JPG, PDF)"
                    : "Take a clear phone photo or select a scan from your device"}
                </p>
                <span className="inline-flex items-center px-4 py-2 rounded-xl bg-health-600 hover:bg-health-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors">
                  {language === "hi" ? "फाइल चुनें" : "Select Document"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={isExtracting || (!selectedFile && !previewUrl)}
                  onClick={() => triggerExtraction(false)}
                  className="flex-1 py-3 px-6 rounded-2xl bg-health-600 hover:bg-health-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isExtracting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{language === "hi" ? "AI पर्चा पढ़ रहा है..." : "Analyzing with Gemini AI..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{language === "hi" ? "दवाएं पहचानें (OCR Scan)" : "Scan & Extract Medicines"}</span>
                    </>
                  )}
                </button>

                {previewUrl && (
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Rotate image"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>
                )}

                {(selectedFile || previewUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setExtractedMedicines([]);
                      setHasScanned(false);
                      setMatchedResults([]);
                      setBasketResult(null);
                    }}
                    className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                    title="Remove document"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Right: Document Preview */}
            <div className="lg:col-span-5 bg-slate-100 rounded-3xl p-4 border border-slate-200 min-h-[260px] flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <div
                  className="relative w-full max-h-[340px] flex items-center justify-center transition-transform duration-300"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Prescription Preview"
                    className="max-h-[320px] w-auto object-contain rounded-xl shadow-md border border-slate-200"
                  />
                </div>
              ) : isPdf ? (
                <div className="text-center p-6 space-y-2">
                  <FileText className="w-14 h-14 text-rose-500 mx-auto" />
                  <p className="font-bold text-slate-800 text-sm">{selectedFile?.name}</p>
                  <span className="text-xs text-slate-500">PDF Document Ready for AI Scan</span>
                </div>
              ) : (
                <div className="text-center p-6 space-y-2 text-slate-400">
                  <FileText className="w-12 h-12 mx-auto stroke-1" />
                  <p className="text-xs">
                    {language === "hi"
                      ? "अपलोड किया गया पर्चा यहां दिखेगा"
                      : "Document preview will appear here"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Extraction & Editable Review Table */}
        {isExtracting && (
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-2 text-sm font-semibold text-health-800">
              <RefreshCw className="w-4 h-4 animate-spin text-health-600" />
              <span>Transcribing handwritten prescription and detecting active salts...</span>
            </div>
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )}

        {hasScanned && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header with Doctor Summary & Basket Button */}
            <div className="bg-white rounded-3xl p-6 border border-health-100 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    {language === "hi" ? "पर्चे से पहचानी गई दवाएं" : "Extracted Prescription Items"}
                  </h2>
                  {isDemoMock && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-health-100 text-health-800 border border-health-200">
                      Verified Demo Rx
                    </span>
                  )}
                </div>
                {patientInfo && (
                  <p className="text-xs text-slate-500">
                    <strong className="text-slate-700">Patient:</strong> {patientInfo} •{" "}
                    <strong className="text-slate-700">Doctor:</strong> {doctorNotes || "KGMU Lucknow"}
                  </p>
                )}
              </div>

              {/* Basket Optimizer CTA Button */}
              {basketResult?.bestSingleStore && (
                <button
                  type="button"
                  onClick={() => setShowBasketModal(true)}
                  className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {language === "hi" ? "एक ही दुकान पर सभी दवाएं ढूंढें" : "Find All at One Store"}
                  </span>
                </button>
              )}
            </div>

            {/* Editable Review Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
              <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-health-700" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">
                    {language === "hi"
                      ? "आप नीचे दिए गए नामों या खुराक को संपादित कर सकते हैं। पीली पंक्ति (Amber) की पुष्टि करें।"
                      : "Review and edit items below if handwriting was ambiguous. Amber rows require verification."}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={addMedicineRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-health-500 text-slate-700 text-xs font-bold shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === "hi" ? "दवा जोड़ें" : "Add Medicine"}</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-600 text-xs font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Prescribed Medicine</th>
                      <th className="py-3 px-3">Strength &amp; Salt</th>
                      <th className="py-3 px-3">Frequency</th>
                      <th className="py-3 px-3">Days</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {extractedMedicines.map((med) => {
                      const isLowConfidence = med.confidence === "low";
                      const isMedConfidence = med.confidence === "medium";

                      return (
                        <tr
                          key={med.id}
                          className={`transition-colors ${isLowConfidence
                            ? "bg-amber-50/70 border-l-4 border-amber-500"
                            : isMedConfidence
                              ? "bg-yellow-50/30"
                              : "hover:bg-slate-50/60"
                            }`}
                        >
                          {/* Medicine Name */}
                          <td className="py-3 px-4 min-w-[200px]">
                            <input
                              type="text"
                              value={med.name}
                              onChange={(e) => updateMedicineRow(med.id, "name", e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-health-500 focus:outline-none"
                            />
                            {med.instructions && (
                              <p className="text-[11px] text-slate-500 mt-1 italic">
                                {med.instructions}
                              </p>
                            )}
                          </td>

                          {/* Strength & Salt */}
                          <td className="py-3 px-3 min-w-[160px]">
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={med.strength}
                                placeholder="Strength"
                                onChange={(e) =>
                                  updateMedicineRow(med.id, "strength", e.target.value)
                                }
                                className="w-full px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-800"
                              />
                              <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
                                {med.salt || "Salt inferred"}
                              </p>
                            </div>
                          </td>

                          {/* Frequency */}
                          <td className="py-3 px-3 w-[110px]">
                            <input
                              type="text"
                              value={med.frequency}
                              placeholder="1-0-1"
                              onChange={(e) =>
                                updateMedicineRow(med.id, "frequency", e.target.value)
                              }
                              className="w-full px-2 py-1 rounded-lg bg-white border border-slate-200 font-mono text-xs text-slate-800 text-center"
                            />
                          </td>

                          {/* Duration */}
                          <td className="py-3 px-3 w-[80px]">
                            <input
                              type="number"
                              value={med.durationDays}
                              onChange={(e) =>
                                updateMedicineRow(med.id, "durationDays", Number(e.target.value))
                              }
                              className="w-full px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 text-center"
                            />
                          </td>

                          {/* Confidence Badge */}
                          <td className="py-3 px-3 min-w-[120px]">
                            {isLowConfidence ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>Please verify</span>
                              </span>
                            ) : isMedConfidence ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-yellow-100 text-yellow-800">
                                Moderate
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Verified
                              </span>
                            )}
                          </td>

                          {/* Actions: Speak & Delete */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleReadAloud(med)}
                                className={`p-1.5 rounded-lg transition-colors ${speakingId === med.id
                                  ? "bg-health-600 text-white animate-pulse"
                                  : "text-slate-600 hover:text-health-700 hover:bg-health-50"
                                  }`}
                                title={speakingId === med.id ? "Stop voice" : "Read aloud"}
                              >
                                {speakingId === med.id ? (
                                  <VolumeX className="w-4 h-4" />
                                ) : (
                                  <Volume2 className="w-4 h-4" />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteMedicineRow(med.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete row"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Step 3: Matched DB Results with Jan Aushadhi Substitutes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {language === "hi"
                      ? "दवाओं के दाम एवं जन औषधि जेनेरिक विकल्प"
                      : "Prescribed Medicines vs Jan Aushadhi Generic Substitutes"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {language === "hi"
                      ? "समान साल्ट वाली सरकारी जन औषधि दवाओं से 50% से 85% तक की बचत करें।"
                      : "Compare branded MRP with certified Jan Aushadhi alternatives sharing the exact same active salt."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {matchedResults.map((match, idx) => {
                  const dbMed = match.dbMedicine;
                  const genSub = match.genericSubstitute;

                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-soft hover:shadow-soft-lg transition-all space-y-4"
                    >
                      {/* Top: Prescribed info */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                        <div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Prescribed Item #{idx + 1}
                          </span>
                          <h4 className="text-base sm:text-lg font-bold text-slate-900">
                            {match.prescribedName}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {dbMed.salts.map((s) => `${s.name} ${s.strength}`).join(" + ")}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-semibold text-slate-400 block">Branded MRP</span>
                          <span className="text-base sm:text-lg font-black text-slate-800">
                            ₹{dbMed.mrp.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* Generic Substitute Box */}
                      {genSub ? (
                        <div className="bg-ayush-50/80 rounded-2xl p-4 border border-ayush-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                              <Sparkles className="w-3 h-3" />
                              <span>Jan Aushadhi Alternative</span>
                            </div>

                            <span className="text-xs font-black text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-300">
                              Save {genSub.savingsPercent}% (₹{genSub.savingsAmount})
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{genSub.brandName}</p>
                              <p className="text-[11px] text-slate-600">BPPI Certified Generic</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-slate-500 line-through mr-1.5">
                                ₹{dbMed.mrp.toFixed(1)}
                              </span>
                              <span className="text-base font-black text-emerald-700">
                                ₹{genSub.mrp.toFixed(1)}
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] text-emerald-800 flex items-center gap-1 font-medium pt-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Available in {genSub.inStockCount} verified Jan Aushadhi Kendras in Lucknow</span>
                          </p>
                        </div>
                      ) : (
                        <div className="bg-slate-50 rounded-2xl p-3 text-xs text-slate-500 text-center border border-slate-200">
                          No direct Jan Aushadhi generic mapping found. Branded medicine in stock at {dbMed.inStockCount} local pharmacies.
                        </div>
                      )}

                      {/* Voice Plain Language Explanation Pill */}
                      <div className="pt-1 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleReadAloud(match.extractedItem)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-health-50 hover:bg-health-100 text-health-800 text-xs font-semibold transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-health-600" />
                          <span>
                            {language === "hi"
                              ? "आवाज में सुनें (Read Aloud)"
                              : "Listen to Dosage Advice"}
                          </span>
                        </button>

                        <Link
                          href={`/search?q=${encodeURIComponent(dbMed.brandName)}`}
                          className="text-xs font-semibold text-slate-600 hover:text-health-700 flex items-center gap-1"
                        >
                          <span>Check nearby stores</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>

                      {/* Generic Substitution Engine Panel */}
                      <div className="pt-2">
                        <SubstitutePanel
                          medicineId={dbMed.id}
                          medicineName={match.prescribedName}
                          defaultExpanded={false}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Basket Optimizer Modal / Overlay */}
        {showBasketModal && basketResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      {language === "hi"
                        ? "एक ही स्टोर पर सम्पूर्ण पर्चा समाधान"
                        : "Prescription Basket Optimizer"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Calculated from real-time inventory across 30 Lucknow pharmacies
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowBasketModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              {/* Option A: Best Single Store */}
              {basketResult.bestSingleStore && (
                <div className="bg-emerald-50/60 rounded-3xl p-5 sm:p-6 border-2 border-emerald-500/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Best Single Store Option</span>
                    </div>

                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {basketResult.bestSingleStore.distanceKm} km away
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">
                        {basketResult.bestSingleStore.storeName}
                      </h4>
                      <p className="text-xs text-slate-600">{basketResult.bestSingleStore.address}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        📞 {basketResult.bestSingleStore.phone} • {basketResult.bestSingleStore.openHours}
                      </p>
                    </div>

                    <div className="text-right sm:border-l sm:border-emerald-200 sm:pl-4">
                      <span className="text-xs font-semibold text-slate-500 block">Total Basket Cost</span>
                      <span className="text-2xl font-black text-emerald-800">
                        ₹{basketResult.bestSingleStore.totalCost.toFixed(1)}
                      </span>
                      {basketResult.bestSingleStore.totalSavings > 0 && (
                        <p className="text-xs font-bold text-emerald-600">
                          Saved ₹{basketResult.bestSingleStore.totalSavings.toFixed(1)} ({basketResult.bestSingleStore.savingsPercent}%)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stock Match Progress Bar */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">
                        Stocks {basketResult.bestSingleStore.matchedCount} of {basketResult.bestSingleStore.totalRequested} prescribed medicines
                      </span>
                      <span className="text-emerald-700">
                        {Math.round((basketResult.bestSingleStore.matchedCount / basketResult.bestSingleStore.totalRequested) * 100)}% Available
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{
                          width: `${(basketResult.bestSingleStore.matchedCount / basketResult.bestSingleStore.totalRequested) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Available Items Chips */}
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Available In Stock:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {basketResult.bestSingleStore.availableItems.map((item: any) => (
                        <span
                          key={item.medicineId}
                          className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-xs font-medium text-slate-800"
                        >
                          ✓ {item.brandName} (₹{item.sellingPrice})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Items Alert */}
                  {basketResult.bestSingleStore.missingItems.length > 0 && (
                    <div className="bg-amber-100/60 rounded-xl p-3 border border-amber-300 text-xs text-amber-900 space-y-1">
                      <p className="font-bold">Missing at this store:</p>
                      <ul className="list-disc list-inside">
                        {basketResult.bestSingleStore.missingItems.map((item: any) => (
                          <li key={item.medicineId}>{item.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-3">
                    <Link
                      href={`/store/${basketResult.bestSingleStore.storeId}`}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Reserve Medicines at {basketResult.bestSingleStore.storeName}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Option B: Best 2-Store Combination */}
              {basketResult.bestTwoStoreCombo && (
                <div className="bg-blue-50/60 rounded-3xl p-5 sm:p-6 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold shadow-xs">
                      2-Store Full Coverage Split
                    </span>
                    <span className="text-xs font-bold text-blue-800">
                      Covers {basketResult.bestTwoStoreCombo.combinedMatchedCount} of {basketResult.bestTwoStoreCombo.totalRequested} items
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    If you want 100% of your medicines without compromise, pick up between these two nearby stores:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Store A */}
                    <div className="bg-white rounded-2xl p-3 border border-blue-100 space-y-1">
                      <p className="text-xs font-bold text-slate-800">{basketResult.bestTwoStoreCombo.storeA.storeName}</p>
                      <p className="text-[11px] text-slate-500">{basketResult.bestTwoStoreCombo.storeA.area} ({basketResult.bestTwoStoreCombo.storeA.distanceKm} km)</p>
                      <div className="pt-1 text-[11px] text-blue-700 font-medium">
                        Buy ({basketResult.bestTwoStoreCombo.itemsFromA.length} items):{" "}
                        {basketResult.bestTwoStoreCombo.itemsFromA.map((i: any) => i.brandName).join(", ")}
                      </div>
                    </div>

                    {/* Store B */}
                    <div className="bg-white rounded-2xl p-3 border border-blue-100 space-y-1">
                      <p className="text-xs font-bold text-slate-800">{basketResult.bestTwoStoreCombo.storeB.storeName}</p>
                      <p className="text-[11px] text-slate-500">{basketResult.bestTwoStoreCombo.storeB.area} ({basketResult.bestTwoStoreCombo.storeB.distanceKm} km)</p>
                      <div className="pt-1 text-[11px] text-blue-700 font-medium">
                        Buy ({basketResult.bestTwoStoreCombo.itemsFromB.length} items):{" "}
                        {basketResult.bestTwoStoreCombo.itemsFromB.map((i: any) => i.brandName).join(", ")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                    <span className="text-xs font-semibold text-slate-600">Combined Total:</span>
                    <span className="text-lg font-black text-blue-900">
                      ₹{basketResult.bestTwoStoreCombo.totalCost.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="text-right pt-2">
                <button
                  type="button"
                  onClick={() => setShowBasketModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Close Optimizer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mandatory Medical Advice Disclaimer Alert */}
        <div className="mt-12 bg-amber-50 border border-amber-300 rounded-3xl p-5 sm:p-6 flex items-start gap-4 text-amber-950">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm">
            <p className="font-bold text-amber-900">
              {language === "hi"
                ? "महत्वपूर्ण चिकित्सा एवं सुरक्षा सूचना:"
                : "Important Medical & AI Disclaimer:"}
            </p>
            <p className="leading-relaxed">
              {language === "hi"
                ? "AI द्वारा पढ़ा गया पर्चा गलत हो सकता है। कृपया अपने डॉक्टर या फार्मासिस्ट से पुष्टि करें। दवा बदलने से पहले अपने डॉक्टर या फार्मासिस्ट से अवश्य सलाह लें।"
                : "AI reading may be wrong. Please verify with your doctor or pharmacist. Confirm with your doctor or pharmacist before switching."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
