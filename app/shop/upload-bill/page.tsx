"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
  AlertTriangle,
  Plus,
  Percent,
  Download,
  FileSpreadsheet,
  Check,
} from "lucide-react";

interface StoreOption {
  id: string;
  name: string;
  area: string;
  type: string;
}

interface DbMedicineOption {
  id: string;
  brandName: string;
  mrp: number;
  ceilingPrice: number | null;
  isScheduledPriceControlled: boolean;
}

interface EditableBillItem {
  lineId: string;
  productName: string;
  batchNo: string;
  expiryDate: string;
  quantity: number;
  mrp: number;
  purchaseRate: number;
  manufacturer: string;
  matchedMedicineId: string | null;
  matchedMedicineName: string | null;
  ceilingPrice: number | null;
  isScheduledPriceControlled: boolean;
  confidence: "high" | "medium" | "none";
  sellingPrice: number;
  isAboveCeiling: boolean;
  isNewMedicine: boolean;
}

export default function ShopUploadBillPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"OCR" | "MANUAL" | "CSV">("OCR");
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [dbMedicines, setDbMedicines] = useState<DbMedicineOption[]>([]);

  // OCR state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [invoiceMeta, setInvoiceMeta] = useState<{
    invoiceNumber: string;
    distributorName: string;
    invoiceDate: string;
  } | null>(null);
  const [items, setItems] = useState<EditableBillItem[]>([]);
  const [marginPercent, setMarginPercent] = useState<number>(15);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSummary, setSyncSummary] = useState<{
    updatedCount: number;
    newMedicinesCreated: number;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Manual Update state
  const [manualMedId, setManualMedId] = useState<string>("");
  const [manualBatch, setManualBatch] = useState<string>("BT-2026-MAN");
  const [manualExpiry, setManualExpiry] = useState<string>("2028-06-30");
  const [manualQty, setManualQty] = useState<number>(20);
  const [manualPrice, setManualPrice] = useState<number>(45);
  const [manualSuccess, setManualSuccess] = useState<string | null>(null);

  // CSV text
  const [csvText, setCsvText] = useState("");

  // Load stores on mount
  useEffect(() => {
    async function loadStores() {
      try {
        const res = await fetch("/api/shop/inventory");
        const data = await res.json();
        if (data.success && Array.isArray(data.stores) && data.stores.length > 0) {
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
    setSyncSummary(null);
  };

  // Run extract API
  const handleExtractBill = async (useMock = false) => {
    setIsProcessing(true);
    setError(null);
    setSyncSummary(null);

    try {
      const formData = new FormData();
      if (selectedFile && !useMock) {
        formData.append("file", selectedFile);
      } else {
        formData.append("mock", "true");
      }

      const res = await fetch("/api/bill/extract", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setInvoiceMeta({
          invoiceNumber: data.invoiceNumber,
          distributorName: data.distributorName,
          invoiceDate: data.invoiceDate,
        });
        setItems(data.items);
        if (Array.isArray(data.availableDbMedicines)) {
          setDbMedicines(data.availableDbMedicines);
        }
      } else {
        setError(data.error || "Failed to extract items from purchase bill.");
      }
    } catch (err) {
      console.error("Extract bill error:", err);
      setError("An unexpected error occurred during bill OCR processing.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Update item field
  const handleItemChange = (index: number, field: keyof EditableBillItem, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      const current = { ...copy[index], [field]: value };

      // Re-evaluate ceiling price check if selling price or ceiling price changed
      if (field === "sellingPrice" || field === "ceilingPrice") {
        const numPrice = Number(current.sellingPrice);
        const ceil = current.ceilingPrice !== null ? Number(current.ceilingPrice) : null;
        current.isAboveCeiling = ceil !== null && numPrice > ceil;
      }

      copy[index] = current;
      return copy;
    });
  };

  // One-click: Use MRP for all items
  const handleApplyMrpToAll = () => {
    setItems((prev) =>
      prev.map((it) => {
        const sellingPrice = it.mrp;
        const isAboveCeiling = it.ceilingPrice !== null && sellingPrice > it.ceilingPrice;
        return { ...it, sellingPrice, isAboveCeiling };
      })
    );
  };

  // One-click: Apply usual margin % for all items
  const handleApplyMarginToAll = () => {
    const marginMult = 1 + marginPercent / 100;
    setItems((prev) =>
      prev.map((it) => {
        const calculated = Number((it.purchaseRate * marginMult).toFixed(2));
        const sellingPrice = Math.min(it.mrp, calculated);
        const isAboveCeiling = it.ceilingPrice !== null && sellingPrice > it.ceilingPrice;
        return { ...it, sellingPrice, isAboveCeiling };
      })
    );
  };

  // Map to a specific DB medicine manually
  const handleMapMedicine = (index: number, targetMedicineId: string) => {
    setItems((prev) => {
      const copy = [...prev];
      if (targetMedicineId === "NEW") {
        copy[index].matchedMedicineId = null;
        copy[index].matchedMedicineName = null;
        copy[index].isNewMedicine = true;
        copy[index].ceilingPrice = null;
        copy[index].isAboveCeiling = false;
      } else {
        const selectedMed = dbMedicines.find((m) => m.id === targetMedicineId);
        if (selectedMed) {
          copy[index].matchedMedicineId = selectedMed.id;
          copy[index].matchedMedicineName = selectedMed.brandName;
          copy[index].mrp = selectedMed.mrp;
          copy[index].ceilingPrice = selectedMed.ceilingPrice;
          copy[index].isScheduledPriceControlled = selectedMed.isScheduledPriceControlled;
          copy[index].isNewMedicine = false;
          copy[index].isAboveCeiling =
            selectedMed.ceilingPrice !== null &&
            copy[index].sellingPrice > selectedMed.ceilingPrice;
        }
      }
      return copy;
    });
  };

  const handleDeleteItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Confirm and update stock in database
  const handleConfirmAndSync = async () => {
    if (!selectedStoreId || items.length === 0) return;
    setIsSyncing(true);
    setError(null);

    try {
      const res = await fetch("/api/bill/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: selectedStoreId,
          items,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSyncSummary(data.summary);
      } else {
        setError(data.error || "Failed to update stock in database.");
      }
    } catch (err) {
      console.error("Sync error:", err);
      setError("Network error: Failed to communicate with database.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Quick Manual Restock
  const handleManualRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMedId || !selectedStoreId) return;

    try {
      const selectedMed = dbMedicines.find((m) => m.id === manualMedId);
      const res = await fetch("/api/bill/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: selectedStoreId,
          items: [
            {
              productName: selectedMed?.brandName || "Medicine",
              matchedMedicineId: manualMedId,
              quantity: manualQty,
              sellingPrice: manualPrice,
              mrp: selectedMed?.mrp || manualPrice,
              batchNo: manualBatch,
              expiryDate: manualExpiry,
              isNewMedicine: false,
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setManualSuccess(`Stock updated! Added ${manualQty} units to inventory.`);
        setTimeout(() => setManualSuccess(null), 4000);
      }
    } catch (err) {
      console.error("Manual restock error:", err);
    }
  };

  // Parse CSV
  const handleParseCsv = () => {
    try {
      const lines = csvText.trim().split("\n");
      if (lines.length < 2) return;

      const parsed: EditableBillItem[] = [];
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",").map((s) => s.trim());
        if (parts.length >= 5) {
          const [productName, batchNo, expiryDate, qtyStr, mrpStr, rateStr, sellStr] = parts;
          const qty = parseInt(qtyStr, 10) || 10;
          const mrp = parseFloat(mrpStr) || 100;
          const purchaseRate = parseFloat(rateStr) || mrp * 0.7;
          const sellingPrice = parseFloat(sellStr) || mrp;

          parsed.push({
            lineId: `csv-${i}`,
            productName,
            batchNo: batchNo || "BT-CSV",
            expiryDate: expiryDate || "2028-12-31",
            quantity: qty,
            mrp,
            purchaseRate,
            manufacturer: "Generic",
            matchedMedicineId: null,
            matchedMedicineName: null,
            ceilingPrice: null,
            isScheduledPriceControlled: false,
            confidence: "none",
            sellingPrice,
            isAboveCeiling: false,
            isNewMedicine: true,
          });
        }
      }

      if (parsed.length > 0) {
        setItems(parsed);
        setActiveTab("OCR"); // View parsed in review table
        setInvoiceMeta({
          invoiceNumber: `CSV-IMP-${Date.now().toString().slice(-4)}`,
          distributorName: "CSV Bulk Import",
          invoiceDate: new Date().toISOString().split("T")[0],
        });
      }
    } catch (err) {
      console.error("CSV parse error:", err);
      setError("Failed to parse CSV format. Please ensure comma-separated values.");
    }
  };

  const selectedStore = stores.find((s) => s.id === selectedStoreId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-28">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-health-900 via-health-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-health-700/60 border border-health-500/40 px-3 py-1 rounded-full text-xs font-semibold text-teal-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            AI Purchase Bill OCR &amp; Stock Sync
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Chemist Bill Upload &amp; Inventory Management
          </h1>
          <p className="text-teal-100/90 text-xs sm:text-sm leading-relaxed">
            Extract wholesale invoices with Gemini Vision, fuzzy-match products against DPCO price ceilings, apply store margin, and sync stock in 30 seconds.
          </p>
        </div>

        {/* Target Store Selector */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0 text-xs space-y-1 min-w-[260px]">
          <label className="block font-bold text-teal-200 uppercase tracking-wider">
            Target Pharmacy:
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

      {/* Mode Tabs: OCR vs Manual vs CSV */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 max-w-lg">
        <button
          type="button"
          onClick={() => setActiveTab("OCR")}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === "OCR"
              ? "bg-health-700 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>AI Bill OCR</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("MANUAL")}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === "MANUAL"
              ? "bg-health-700 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Manual Update</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("CSV")}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === "CSV"
              ? "bg-health-700 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>CSV Bulk Import</span>
        </button>
      </div>

      {/* Success Summary Toast/Banner */}
      {syncSummary && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-3xl p-6 text-emerald-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-emerald-950">
                Stock Updated Successfully!
              </h3>
              <p className="text-xs text-emerald-800 mt-1">
                <strong>{syncSummary.message}</strong> for <strong>{selectedStore?.name}</strong>. Batches, expiry dates, and selling prices have been committed to the inventory database.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/shop/dashboard"
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition-colors"
            >
              Open Dashboard
            </Link>
            <Link
              href="/shop/orders"
              className="px-4 py-2.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-bold rounded-xl transition-colors"
            >
              View Holds &amp; Orders
            </Link>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 text-rose-900 flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* TAB 1: AI OCR FLOW */}
      {activeTab === "OCR" && (
        <div className="space-y-6">
          {/* Upload Dropzone */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-health-600" />
                  Upload Purchase Invoice or Delivery Challan
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Accepts JPG, PNG, and PDF wholesale bills. Validates line items with Zod schema.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Up to 10MB</span>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-health-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/60 hover:bg-health-50/30 flex flex-col items-center justify-center gap-3"
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
              <div className="w-14 h-14 rounded-2xl bg-health-100 text-health-700 flex items-center justify-center shadow-xs">
                <Receipt className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  {selectedFile ? selectedFile.name : "Click to browse or drop wholesale bill photo"}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports distributor purchase orders, daily invoices, and delivery challans.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleExtractBill(false)}
                disabled={!selectedFile || isProcessing}
                className={`px-6 py-3 rounded-2xl text-xs font-bold inline-flex items-center gap-2 transition-all ${
                  !selectedFile || isProcessing
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-health-700 hover:bg-health-800 text-white shadow-md hover:shadow-lg"
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting Line Items with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Gemini AI Bill OCR</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleExtractBill(true)}
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-2xl bg-health-50 hover:bg-health-100 text-health-800 border border-health-200 font-bold text-xs transition-colors inline-flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-health-600" />
                <span>Demo: Load Sample Wholesale Bill (10 Items)</span>
              </button>
            </div>
          </div>

          {/* Review & Mapping Table */}
          {items.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5 animate-in fade-in">
              {/* Invoice Meta & Bulk Price Toolbar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Invoice Metadata
                  </span>
                  <div className="font-bold text-slate-900 text-sm">
                    {invoiceMeta?.distributorName || "Awadh Pharma Distributors, Aminabad, Lucknow"}
                  </div>
                  <div className="text-xs text-slate-500">
                    Inv #{invoiceMeta?.invoiceNumber || "LKO-PUR-2026-9481"} &bull; Date:{" "}
                    {invoiceMeta?.invoiceDate || "2026-11-22"} &bull; {items.length} Items Extracted
                  </div>
                </div>

                {/* Bulk Margin / Pricing Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApplyMrpToAll}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-xs"
                    title="Set selling price equal to MRP for all items"
                  >
                    Set All = MRP
                  </button>

                  <div className="inline-flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-2 py-1 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500">Margin:</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={marginPercent}
                      onChange={(e) => setMarginPercent(Number(e.target.value))}
                      className="w-12 text-center text-xs font-bold border-b border-dashed border-slate-400 focus:outline-none"
                    />
                    <span className="text-xs text-slate-500">%</span>
                    <button
                      type="button"
                      onClick={handleApplyMarginToAll}
                      className="ml-1 px-2.5 py-1 bg-health-700 hover:bg-health-800 text-white rounded-lg text-xs font-bold shadow-xs"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              {/* Review Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Product Name as Invoiced</th>
                      <th className="py-3 px-3">Batch &amp; Expiry</th>
                      <th className="py-3 px-3 text-center">Qty</th>
                      <th className="py-3 px-3">Rate / MRP</th>
                      <th className="py-3 px-3">Database Match</th>
                      <th className="py-3 px-3">Selling Price</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => {
                      const isMatched = item.matchedMedicineId !== null;

                      return (
                        <tr
                          key={item.lineId}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            item.isAboveCeiling ? "bg-amber-50/60" : ""
                          }`}
                        >
                          {/* Product Name */}
                          <td className="py-3 px-3 font-bold text-slate-900 max-w-xs">
                            <input
                              type="text"
                              value={item.productName}
                              onChange={(e) => handleItemChange(idx, "productName", e.target.value)}
                              className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-health-600 focus:outline-none text-xs font-bold"
                            />
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Mfg: {item.manufacturer}
                            </span>
                          </td>

                          {/* Batch & Expiry */}
                          <td className="py-3 px-3 font-mono text-[11px]">
                            <input
                              type="text"
                              value={item.batchNo}
                              onChange={(e) => handleItemChange(idx, "batchNo", e.target.value)}
                              className="w-20 bg-transparent border-b border-dashed border-slate-300 focus:border-health-600 focus:outline-none text-xs font-mono"
                            />
                            <input
                              type="text"
                              value={item.expiryDate}
                              onChange={(e) => handleItemChange(idx, "expiryDate", e.target.value)}
                              className="w-24 block text-[10px] text-slate-500 bg-transparent border-b border-dashed border-slate-200 mt-1"
                            />
                          </td>

                          {/* Quantity */}
                          <td className="py-3 px-3 text-center">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(idx, "quantity", Number(e.target.value))
                              }
                              className="w-16 text-center font-extrabold text-slate-900 bg-slate-100 rounded-lg py-1 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-health-500"
                            />
                          </td>

                          {/* Rate & MRP */}
                          <td className="py-3 px-3">
                            <div>₹{item.purchaseRate.toFixed(1)}</div>
                            <div className="text-[10px] text-slate-400">MRP: ₹{item.mrp.toFixed(1)}</div>
                          </td>

                          {/* Database Match Dropdown */}
                          <td className="py-3 px-3 max-w-xs">
                            <select
                              value={item.matchedMedicineId || "NEW"}
                              onChange={(e) => handleMapMedicine(idx, e.target.value)}
                              className={`w-full text-xs font-medium rounded-lg p-1.5 border ${
                                isMatched
                                  ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                                  : "bg-amber-50 text-amber-900 border-amber-300"
                              } focus:outline-none`}
                            >
                              <option value="NEW">+ Create as New Medicine in Catalog</option>
                              {dbMedicines.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.brandName} (MRP: ₹{m.mrp})
                                </option>
                              ))}
                            </select>

                            {item.ceilingPrice !== null && (
                              <span className="text-[10px] text-teal-800 font-semibold block mt-0.5">
                                DPCO Ceiling Price: ₹{item.ceilingPrice.toFixed(2)}
                              </span>
                            )}
                          </td>

                          {/* Selling Price & Warning */}
                          <td className="py-3 px-3">
                            <div className="relative">
                              <span className="absolute left-2 top-1.5 text-slate-400 font-bold">
                                ₹
                              </span>
                              <input
                                type="number"
                                step="0.1"
                                value={item.sellingPrice}
                                onChange={(e) =>
                                  handleItemChange(idx, "sellingPrice", Number(e.target.value))
                                }
                                className={`w-24 pl-5 pr-2 py-1 font-extrabold rounded-lg border text-xs focus:outline-none ${
                                  item.isAboveCeiling
                                    ? "bg-rose-50 border-rose-400 text-rose-900"
                                    : "bg-slate-50 border-slate-300 text-slate-900"
                                }`}
                              />
                            </div>

                            {item.isAboveCeiling && (
                              <div className="flex items-center gap-1 text-[10px] font-bold text-rose-700 mt-1">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                <span>Exceeds Ceiling Price!</span>
                              </div>
                            )}
                          </td>

                          {/* Delete */}
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                              title="Remove item from bill"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Confirm & Sync Stock Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  Target: <strong>{selectedStore?.name}</strong> &bull; Total items:{" "}
                  <strong>{items.length}</strong>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmAndSync}
                  disabled={isSyncing || items.length === 0}
                  className={`px-7 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all shadow-md flex items-center justify-center gap-2 ${
                    isSyncing || items.length === 0
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-health-700 hover:bg-health-800 text-white hover:shadow-lg"
                  }`}
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Syncing Inventory...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Confirm &amp; Update Stock ({items.length} Items)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MANUAL QUICK UPDATE */}
      {activeTab === "MANUAL" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-xl space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-health-600" />
              Quick Manual Stock Restock
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Instantly increment quantity or update batch for any catalog medicine without uploading an invoice.
            </p>
          </div>

          {manualSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{manualSuccess}</span>
            </div>
          )}

          <form onSubmit={handleManualRestock} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Medicine:
              </label>
              <select
                value={manualMedId}
                onChange={(e) => {
                  setManualMedId(e.target.value);
                  const med = dbMedicines.find((m) => m.id === e.target.value);
                  if (med) setManualPrice(med.mrp);
                }}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-health-500"
                required
              >
                <option value="">-- Choose catalog medicine --</option>
                {dbMedicines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.brandName} (MRP: ₹{m.mrp})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Batch No:</label>
                <input
                  type="text"
                  value={manualBatch}
                  onChange={(e) => setManualBatch(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date:</label>
                <input
                  type="date"
                  value={manualExpiry}
                  onChange={(e) => setManualExpiry(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantity to Add:
                </label>
                <input
                  type="number"
                  min={1}
                  value={manualQty}
                  onChange={(e) => setManualQty(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Selling Price (₹):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-health-700 hover:bg-health-800 text-white rounded-xl text-xs font-bold shadow transition-colors"
              >
                Add Units to Pharmacy Stock
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: CSV BULK IMPORT */}
      {activeTab === "CSV" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5 max-w-2xl">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-health-600" />
              CSV Bulk Stock Import
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste comma-separated items or upload a standard distributor CSV format.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 font-mono">
            <strong>Format:</strong> productName,batchNo,expiryDate,quantity,mrp,purchaseRate,sellingPrice
          </div>

          <textarea
            rows={6}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={`productName,batchNo,expiryDate,quantity,mrp,purchaseRate,sellingPrice\nDolo 650 Tablet,DL26M14,2028-06-30,50,33.6,23.5,30.0\nAugmentin 625 Duo,AG88K02,2027-12-31,30,223.5,165.0,195.0\nElectral ORS,EL77N08,2027-10-31,100,22.0,15.0,20.0`}
            className="w-full p-3 font-mono text-xs rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-health-500"
          />

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setCsvText(
                  `productName,batchNo,expiryDate,quantity,mrp,purchaseRate,sellingPrice\nDolo 650 Tablet,DL26M14,2028-06-30,50,33.6,23.5,30.0\nAugmentin 625 Duo,AG88K02,2027-12-31,30,223.5,165.0,195.0\nElectral ORS,EL77N08,2027-10-31,100,22.0,15.0,20.0`
                )
              }
              className="text-xs font-semibold text-health-700 hover:underline"
            >
              Fill Sample CSV Format
            </button>

            <button
              type="button"
              onClick={handleParseCsv}
              disabled={!csvText.trim()}
              className="px-5 py-2.5 bg-health-700 hover:bg-health-800 text-white rounded-xl text-xs font-bold shadow transition-colors"
            >
              Parse into Review Table &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
