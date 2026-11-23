"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Receipt,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Store,
  ArrowRight,
  Sparkles,
  Trash2,
  RefreshCw,
  Building,
} from "lucide-react";

interface StoreOption {
  id: string;
  name: string;
  area: string;
  type: string;
}

interface InvoiceItem {
  medicineName: string;
  probableBrand: string;
  salt: string;
  strength: string;
  dosageForm: string;
  packSize: number;
  batchNo: string;
  expiryDate: string;
  quantityReceived: number;
  wholesaleRate: number;
  mrp: number;
  sellingPrice: number;
  confidence: "high" | "medium" | "low";
}

interface ExtractedInvoice {
  invoiceNumber: string;
  distributorName: string;
  gstNumber: string;
  invoiceDate: string;
  totalAmount: number;
  items: InvoiceItem[];
}

export default function ShopUploadBillPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stores, setStores] = useState<StoreOption[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedInvoice | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    syncedCount: number;
    storeName: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch stores on load
  useEffect(() => {
    async function loadStores() {
      try {
        const res = await fetch("/api/shop/inventory");
        const data = await res.json();
        if (data.success && data.stores.length > 0) {
          setStores(data.stores);
          setSelectedStoreId(data.stores[0].id);
        }
      } catch (err) {
        console.error("Failed to load stores", err);
      }
    }
    loadStores();
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setSyncResult(null);
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const processInvoice = async (useMock = false) => {
    setIsProcessing(true);
    setError(null);
    setSyncResult(null);

    try {
      const formData = new FormData();
      if (selectedFile && !useMock) {
        formData.append("file", selectedFile);
      } else {
        formData.append("mock", "true");
      }

      const res = await fetch("/api/shop/upload-bill", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.invoice) {
        setExtractedData(data.invoice);
      } else {
        setError(data.error || "Failed to process invoice OCR");
      }
    } catch (err) {
      console.error("Invoice OCR error:", err);
      setError("An unexpected error occurred during invoice processing.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    if (!extractedData) return;
    const updatedItems = [...extractedData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    setExtractedData({
      ...extractedData,
      items: updatedItems,
    });
  };

  const handleDeleteItem = (index: number) => {
    if (!extractedData) return;
    const updatedItems = extractedData.items.filter((_, i) => i !== index);
    setExtractedData({
      ...extractedData,
      items: updatedItems,
    });
  };

  const handleSyncToInventory = async () => {
    if (!extractedData || !selectedStoreId) return;
    setIsSyncing(true);
    setError(null);

    try {
      const res = await fetch("/api/shop/upload-bill", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: selectedStoreId,
          items: extractedData.items,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSyncResult({
          syncedCount: data.syncedCount,
          storeName: data.storeName,
        });
      } else {
        setError(data.error || "Failed to sync inventory.");
      }
    } catch (err) {
      console.error("Sync error:", err);
      setError("Failed to communicate with inventory database.");
    } finally {
      setIsSyncing(false);
    }
  };

  const selectedStore = stores.find((s) => s.id === selectedStoreId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-health-900 via-health-800 to-teal-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-health-700/60 border border-health-500/40 px-3 py-1 rounded-full text-xs font-semibold text-teal-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            AI-Powered Invoice &amp; Delivery Challan OCR
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Wholesale Chemist Invoice Sync
          </h1>
          <p className="text-teal-100/90 text-xs md:text-sm leading-relaxed">
            Eliminate manual data entry. Upload wholesale delivery challans or distributor invoices.
            Gemini vision extracts batch numbers, expiry dates, quantities, and automatically updates your pharmacy stock in 30 seconds.
          </p>
        </div>

        {/* Destination Pharmacy Selector */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0 text-xs space-y-1">
          <label className="block font-bold text-teal-200 uppercase tracking-wider">
            Destination Pharmacy:
          </label>
          <select
            value={selectedStoreId}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="w-full text-xs font-bold bg-white text-slate-800 rounded-xl px-3 py-2 border-0 focus:ring-2 focus:ring-teal-400"
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.area})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sync Success Banner */}
      {syncResult && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-emerald-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-emerald-900">
                Inventory Successfully Synchronized!
              </h3>
              <p className="text-xs text-emerald-700 mt-1">
                Updated stock levels for <strong>{syncResult.syncedCount} medicines</strong> at{" "}
                <strong>{syncResult.storeName}</strong>. Batch numbers and expiry dates recorded.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/shop/dashboard"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Go to Chemist Dashboard
            </Link>
            <Link
              href={`/store/${selectedStoreId}`}
              className="px-4 py-2 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-colors"
            >
              View Public Stock
            </Link>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-2xl p-4 text-red-900 flex items-center gap-3 text-xs font-medium">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Zone & Demo Consignment Trigger */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Box */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-health-600" />
              Upload Distributor Invoice or Delivery Challan
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">JPG, PNG, PDF up to 10MB</span>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-health-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-health-50/30 flex flex-col items-center justify-center gap-3"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
            <div className="w-12 h-12 rounded-full bg-health-100 text-health-700 flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                {selectedFile ? selectedFile.name : "Click to select or drag and drop wholesale invoice photo"}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Reads printed tax invoices, wholesale purchase challans, and delivery notes.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={() => processInvoice(false)}
              disabled={!selectedFile || isProcessing}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-colors ${
                !selectedFile || isProcessing
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-health-700 hover:bg-health-800 text-white shadow-sm"
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Extracting Invoice Items...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Run Gemini Invoice OCR
                </>
              )}
            </button>

            {/* Quick Demo Pre-seed Button */}
            <button
              onClick={() => processInvoice(true)}
              disabled={isProcessing}
              className="text-xs font-bold text-health-700 hover:text-health-900 bg-health-50 hover:bg-health-100 px-3.5 py-2 rounded-xl border border-health-200 transition-colors inline-flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-health-600" />
              Demo: Load Sample Consignment (Awadh Pharma)
            </button>
          </div>
        </div>

        {/* How it Works / Instructions Card */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-500" />
            Chemist Automation Guide
          </h3>
          <ul className="text-xs text-slate-600 space-y-3">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-health-200 text-health-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                1
              </span>
              <span>Snap a photo of the daily delivery slip from your pharma distributor.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-health-200 text-health-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                2
              </span>
              <span>Gemini extracts brand names, batch numbers, expiry dates, and carton quantities.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-health-200 text-health-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                3
              </span>
              <span>Review quantities and click &ldquo;Sync to Inventory&rdquo; to update your live counter.</span>
            </li>
          </ul>

          <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-snug">
            💡 <strong>Offline Safe:</strong> If offline or missing Gemini API key, the system automatically uses pre-seeded test challans so your demo never halts.
          </div>
        </div>
      </div>

      {/* Review & Verification Table */}
      {extractedData && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6 animate-fade-in">
          {/* Extracted Header Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="space-y-1">
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Distributor / C&amp;F Agency
              </div>
              <div className="text-sm font-bold text-slate-800">
                {extractedData.distributorName}
              </div>
              <div className="text-xs text-slate-500">
                Invoice No: <span className="font-mono font-bold">{extractedData.invoiceNumber}</span> &bull;{" "}
                GST: {extractedData.gstNumber} &bull; Date: {extractedData.invoiceDate}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Invoice Net Amount
              </div>
              <div className="text-xl font-extrabold text-health-800">
                ₹{extractedData.totalAmount.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {extractedData.items.length} line items detected
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Medicine Line Item</th>
                  <th className="py-3 px-3">Batch No</th>
                  <th className="py-3 px-3">Expiry</th>
                  <th className="py-3 px-3">Dosage / Form</th>
                  <th className="py-3 px-3 text-center">Qty Received</th>
                  <th className="py-3 px-3">Wholesale Rate</th>
                  <th className="py-3 px-3">Selling Price</th>
                  <th className="py-3 px-3 text-center">Confidence</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {extractedData.items.map((item, idx) => {
                  const isLowConf = item.confidence === "low";

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isLowConf ? "bg-amber-50/50" : ""
                      }`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={item.medicineName}
                          onChange={(e) => handleUpdateItem(idx, "medicineName", e.target.value)}
                          className="font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-health-600 text-xs w-full focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {item.salt} {item.strength}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={item.batchNo}
                          onChange={(e) => handleUpdateItem(idx, "batchNo", e.target.value)}
                          className="font-mono text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-health-600 text-xs w-20 focus:outline-none"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={item.expiryDate}
                          onChange={(e) => handleUpdateItem(idx, "expiryDate", e.target.value)}
                          className="font-mono text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-health-600 text-xs w-24 focus:outline-none"
                        />
                      </td>

                      <td className="py-3 px-3 capitalize">
                        {item.dosageForm} &bull; Pack of {item.packSize}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          value={item.quantityReceived}
                          onChange={(e) =>
                            handleUpdateItem(idx, "quantityReceived", Number(e.target.value))
                          }
                          className="w-16 text-center font-bold text-slate-900 bg-slate-100 rounded-lg py-1 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-health-500"
                        />
                      </td>

                      <td className="py-3 px-3">₹{item.wholesaleRate.toFixed(2)}</td>

                      <td className="py-3 px-3">
                        <input
                          type="number"
                          value={item.sellingPrice}
                          onChange={(e) =>
                            handleUpdateItem(idx, "sellingPrice", Number(e.target.value))
                          }
                          className="w-16 font-bold text-slate-900 bg-slate-100 rounded-lg py-1 px-2 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-health-500"
                        />
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isLowConf
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {item.confidence}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteItem(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Sync Button Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              Target Pharmacy: <strong>{selectedStore?.name}</strong> ({selectedStore?.area})
            </div>

            <button
              onClick={handleSyncToInventory}
              disabled={isSyncing || extractedData.items.length === 0}
              className={`px-6 py-3 rounded-2xl text-xs font-bold inline-flex items-center gap-2 shadow transition-colors ${
                isSyncing || extractedData.items.length === 0
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-health-700 hover:bg-health-800 text-white"
              }`}
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Synchronizing Database...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Commit &amp; Sync to Pharmacy Inventory
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
