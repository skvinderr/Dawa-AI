"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Store,
  Receipt,
  Package,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
  Minus,
  Search,
  ExternalLink,
  Filter,
  RefreshCw,
  Phone,
  User,
  TrendingUp,
  Sparkles,
  Send,
  Bell,
  Percent,
  Layers,
  ArrowUpRight,
  Tag,
  DollarSign,
  X,
  ListPlus,
  FileSpreadsheet,
  Copy,
  Calendar,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface StoreOption {
  id: string;
  name: string;
  type: string;
  area: string;
  address: string;
  phone: string;
}

interface InventoryItem {
  id: string;
  storeId: string;
  medicineId: string;
  brandName: string;
  manufacturer: string;
  dosageForm: string;
  packSize: number;
  mrp: number;
  sellingPrice: number;
  quantity: number;
  batchNo: string;
  expiryDate: string;
  isJanAushadhi: boolean;
  salts: { name: string; strength: string }[];
}

interface OrderItem {
  id: string;
  brandName: string;
  dosageForm: string;
  quantity: number;
  unitPrice: number;
  isJanAushadhi: boolean;
}

interface CustomerOrder {
  id: string;
  status: string;
  mode: string;
  createdAt: string;
  totalPaid: number;
  savings: number;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
}

interface DemandItem {
  name: string;
  medicineId: string | null;
  searchCount: number;
  distanceKm: number;
  trend: string;
  isTrendUp: boolean;
  stocksThis: boolean;
  currentStock: number;
}

interface UnmetDemandItem {
  id: string;
  medicineName: string;
  salt: string;
  citizensWaiting: number;
  area: string;
  urgency: string;
  note: string;
}

interface NearExpiryItem {
  id: string;
  medicineId: string;
  brandName: string;
  batchNo: string;
  expiryDate: string;
  quantity: number;
  daysLeft: number;
  sellingPrice: number;
  suggestedDiscountPercent: number;
  suggestedDiscountedPrice: number;
}

interface DashboardData {
  demandPanel: {
    timeframe: string;
    radiusKm: number;
    totalSearchesAnalyzed: number;
    items: DemandItem[];
  };
  unmetDemand: UnmetDemandItem[];
  stockHealth: {
    lowStockCount: number;
    lowStockItems: any[];
    outOfStockCount: number;
    outOfStockItems: any[];
    nearExpiryCount: number;
    nearExpiryItems: NearExpiryItem[];
  };
  revenueSnapshot: {
    totalRevenue: number;
    totalOrdersCount: number;
    totalSavingsGiven: number;
    chartData: { date: string; revenue: number; orders: number; savings: number }[];
  };
}

interface RestockItem {
  id: string;
  name: string;
  searchCount?: number;
  currentStock?: number;
  reason: string;
  addedAt: string;
}

export default function ShopDashboardPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"DEMAND" | "STOCK_HEALTH" | "INVENTORY" | "ORDERS">("DEMAND");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"ALL" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Copilot State
  const [copilotQuestion, setCopilotQuestion] = useState("");
  const [copilotAnswer, setCopilotAnswer] = useState<string | null>(null);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotSource, setCopilotSource] = useState<string>("gemini_copilot");

  // Restock List State
  const [restockList, setRestockList] = useState<RestockItem[]>([]);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    // Load restock list from localStorage
    try {
      const saved = localStorage.getItem("dawaasetu_restock_list");
      if (saved) {
        setRestockList(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not parse restock list:", e);
    }
  }, []);

  // Fetch available stores on mount
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

  // Fetch store inventory, orders, and dashboard analytics when selectedStoreId changes
  const fetchStoreData = async (storeId: string) => {
    if (!storeId) return;
    setLoading(true);
    try {
      const [invRes, orderRes, dashRes] = await Promise.all([
        fetch(`/api/shop/inventory?storeId=${storeId}`),
        fetch(`/api/shop/orders?storeId=${storeId}`),
        fetch(`/api/shop/dashboard?storeId=${storeId}`),
      ]);
      const invData = await invRes.json();
      const orderData = await orderRes.json();
      const dashData = await dashRes.json();

      if (invData.success) {
        setInventory(invData.inventory);
      }
      if (orderRes.ok && orderData.success) {
        setOrders(orderData.orders);
      }
      if (dashData.success) {
        setDashboardData(dashData);
      }
    } catch (err) {
      console.error("Failed to fetch store data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStoreId) {
      fetchStoreData(selectedStoreId);
      // Reset Copilot answer when store changes
      setCopilotAnswer(null);
    }
  }, [selectedStoreId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Adjust inventory quantity
  const handleQuantityChange = async (item: InventoryItem, delta: number) => {
    const newQty = Math.max(0, item.quantity + delta);
    setInventory((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, quantity: newQty } : i))
    );

    try {
      await fetch("/api/shop/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryId: item.id,
          quantity: newQty,
        }),
      });
      showToast(`Stock updated: ${item.brandName} is now ${newQty} units.`);
    } catch (err) {
      console.error("Failed to update inventory", err);
    }
  };

  // Toggle in stock / out of stock
  const handleToggleStock = async (item: InventoryItem) => {
    const newQty = item.quantity > 0 ? 0 : 25;
    setInventory((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, quantity: newQty } : i))
    );

    try {
      await fetch("/api/shop/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryId: item.id,
          quantity: newQty,
        }),
      });
      showToast(
        newQty === 0
          ? `Marked ${item.brandName} as OUT OF STOCK`
          : `Restocked ${item.brandName} (+25 units)`
      );
    } catch (err) {
      console.error("Failed to toggle stock", err);
    }
  };

  // Apply clearance discount for near-expiry item
  const handleApplyDiscount = async (item: NearExpiryItem) => {
    try {
      const res = await fetch("/api/shop/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryId: item.id,
          sellingPrice: item.suggestedDiscountedPrice,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          `Discount applied! Selling price reduced to ₹${item.suggestedDiscountedPrice} (${item.suggestedDiscountPercent}% off)`
        );
        // Refresh dashboard data and inventory
        fetchStoreData(selectedStoreId);
      }
    } catch (err) {
      console.error("Failed to apply discount", err);
      showToast("Error applying discount. Please try again.");
    }
  };

  // Add item to restock list
  const handleAddToRestock = (name: string, searchCount?: number, currentStock?: number) => {
    if (restockList.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
      showToast(`"${name}" is already in your restock list.`);
      return;
    }

    const newItem: RestockItem = {
      id: Date.now().toString(),
      name,
      searchCount,
      currentStock,
      reason: searchCount ? `High 3km citizen search demand (${searchCount} searches)` : "Pharmacist manual entry",
      addedAt: new Date().toLocaleDateString(),
    };

    const updated = [newItem, ...restockList];
    setRestockList(updated);
    try {
      localStorage.setItem("dawaasetu_restock_list", JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage failed", e);
    }
    showToast(`Added "${name}" to restock order list.`);
  };

  const handleRemoveFromRestock = (id: string) => {
    const updated = restockList.filter((item) => item.id !== id);
    setRestockList(updated);
    try {
      localStorage.setItem("dawaasetu_restock_list", JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage failed", e);
    }
  };

  const handleCopyRestockList = () => {
    if (restockList.length === 0) return;
    const text = `DawaaSetu Restock Order for ${selectedStore?.name || "Pharmacy"}\nDate: ${new Date().toLocaleDateString()}\n\n` +
      restockList.map((item, idx) => `${idx + 1}. ${item.name} - Est. Qty: 30 packs (${item.reason})`).join("\n");
    navigator.clipboard.writeText(text);
    showToast("Restock order copied to clipboard! Paste in WhatsApp to distributor.");
  };

  // Copilot Query Handler
  const handleAskCopilot = async (questionToAsk?: string) => {
    const q = questionToAsk || copilotQuestion;
    if (!q.trim()) return;

    setCopilotLoading(true);
    setCopilotAnswer(null);

    try {
      const res = await fetch("/api/shop/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: selectedStoreId,
          question: q,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCopilotAnswer(data.answer);
        setCopilotSource(data.source);
      } else {
        setCopilotAnswer("Unable to fetch recommendations. Please check network connection.");
      }
    } catch (err) {
      console.error("Copilot error:", err);
      setCopilotAnswer("Failed to reach Copilot engine. Local fallback unavailable.");
    } finally {
      setCopilotLoading(false);
    }
  };

  // Update order status
  const handleOrderStatusUpdate = async (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      await fetch("/api/shop/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      showToast(`Order #${orderId.slice(-6)} status updated to ${newStatus}.`);
    } catch (err) {
      console.error("Failed to update order", err);
    }
  };

  const selectedStore = stores.find((s) => s.id === selectedStoreId);

  // Metrics
  const totalSkus = inventory.length;
  const lowStockCount = dashboardData?.stockHealth.lowStockCount ?? inventory.filter((i) => i.quantity > 0 && i.quantity < 10).length;
  const outOfStockCount = dashboardData?.stockHealth.outOfStockCount ?? inventory.filter((i) => i.quantity === 0).length;
  const nearExpiryCount = dashboardData?.stockHealth.nearExpiryCount ?? 0;
  const pendingHolds = orders.filter((o) => o.status === "HOLD_REQUESTED" || o.status === "CONFIRMED").length;

  // Filtered Inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.salts.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (stockFilter === "LOW_STOCK") return item.quantity > 0 && item.quantity < 10;
    if (stockFilter === "OUT_OF_STOCK") return item.quantity === 0;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner & Store Selector */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-health-50 text-health-800 text-xs font-bold px-3 py-1 rounded-full border border-health-200">
            <Store className="w-3.5 h-3.5 text-health-600" />
            Pharmacist &amp; Chemist Portal &bull; Uttar Pradesh
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            {selectedStore?.name || "Pharmacist Dashboard"}
          </h1>
          <p className="text-xs text-slate-500">
            📍 {selectedStore?.address}, {selectedStore?.area} &bull; 📞 {selectedStore?.phone}
          </p>
        </div>

        {/* Store Switcher & Quick Navigation Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Active Pharmacy:
            </label>
            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-health-500"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.area} &bull; {s.type === "JAN_AUSHADHI" ? "Jan Aushadhi" : "Chemist"})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-0 sm:pt-4">
            <Link
              href="/shop/upload-bill"
              className="inline-flex items-center gap-2 px-4 py-2 bg-health-700 hover:bg-health-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <Receipt className="w-3.5 h-3.5" />
              Upload Invoice
            </Link>

            <Link
              href="/shop/orders"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Orders Inbox
              {pendingHolds > 0 && (
                <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {pendingHolds}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsRestockModalOpen(true)}
              className="relative inline-flex items-center gap-2 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-colors"
            >
              <ListPlus className="w-3.5 h-3.5 text-amber-600" />
              Restock List
              {restockList.length > 0 && (
                <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {restockList.length}
                </span>
              )}
            </button>

            <Link
              href={`/store/${selectedStoreId || "store-1"}`}
              title="View Public Profile"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Top Row: Metrics & Revenue Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: 4 KPI Cards */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
              <span>Catalog SKUs</span>
              <Package className="w-4 h-4 text-health-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{totalSkus}</div>
            <div className="text-[11px] text-slate-500">Active medicines stocked</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-blue-200 bg-blue-50/20 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-blue-700 text-xs font-bold uppercase">
              <span>Citizen Holds</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-blue-900">{pendingHolds}</div>
            <div className="text-[11px] text-blue-700 font-medium">Counter pickup reserved</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-purple-200 bg-purple-50/20 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-purple-700 text-xs font-bold uppercase">
              <span>3km Search Demand</span>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-extrabold text-purple-900">
              {dashboardData?.demandPanel.totalSearchesAnalyzed ?? 24}
            </div>
            <div className="text-[11px] text-purple-700 font-medium">Inquiries in last 7 days</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-amber-200 bg-amber-50/20 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-amber-700 text-xs font-bold uppercase">
              <span>Expiring &lt;60d</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-amber-900">{nearExpiryCount}</div>
            <div className="text-[11px] text-amber-700 font-medium">Eligible for clearance</div>
          </div>
        </div>

        {/* Right Column: Revenue & Savings Snapshot Recharts AreaChart */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Revenue &amp; Citizen Savings Snapshot
              </h3>
              <p className="text-[11px] text-slate-500">
                Weekly fulfillment from citizen reservations &amp; in-store generic purchases
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Revenue (₹{dashboardData?.revenueSnapshot.totalRevenue.toLocaleString() || "14,850"})
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-300 inline-block" />
                Savings Given (₹{dashboardData?.revenueSnapshot.totalSavingsGiven.toLocaleString() || "5,420"})
              </span>
            </div>
          </div>

          {/* Chart */}
          <div className="h-44 w-full pt-1">
            {hasMounted && dashboardData?.revenueSnapshot.chartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dashboardData.revenueSnapshot.chartData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSav" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      borderRadius: "0.75rem",
                      border: "none",
                      fontSize: "12px",
                    }}
                    formatter={(val: any, name: any) => [
                      `₹${Number(val).toLocaleString()}`,
                      name === "revenue" ? "Daily Revenue" : "Citizen Savings",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                  <Area
                    type="monotone"
                    dataKey="savings"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSav)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Loading revenue trend...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Shopkeeper Copilot Card */}
      <div className="bg-gradient-to-r from-health-900 via-health-800 to-teal-950 rounded-3xl p-6 sm:p-7 text-white shadow-soft-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 text-health-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  Shopkeeper AI Copilot
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {copilotSource === "gemini_copilot" ? "Powered by Gemini 2.0 Flash" : "Local Healthcare Rules"}
                </span>
              </div>
              <p className="text-xs text-health-200">
                Inventory and re-order intelligence calibrated to {selectedStore?.area} seasonal trends &amp; outbreak signals
              </p>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              "What should I stock this week?",
              "Fever surge in my area?",
              "Clearance advice for near-expiry?",
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setCopilotQuestion(prompt);
                  handleAskCopilot(prompt);
                }}
                className="text-[11px] font-semibold bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1 rounded-full text-health-100 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Question Input Box */}
        <div className="relative">
          <input
            type="text"
            value={copilotQuestion}
            onChange={(e) => setCopilotQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAskCopilot();
            }}
            placeholder="Ask Copilot: e.g. What should I order from wholesale distributors for next week?"
            className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-xs text-white placeholder-health-200/60 focus:outline-none focus:ring-2 focus:ring-white/40 pr-28"
          />
          <button
            onClick={() => handleAskCopilot()}
            disabled={copilotLoading}
            className="absolute right-2 top-2 px-4 py-1.5 rounded-xl bg-white text-health-950 font-bold text-xs hover:bg-health-100 transition-all flex items-center gap-1.5 disabled:opacity-60"
          >
            {copilotLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{copilotLoading ? "Analyzing..." : "Ask Copilot"}</span>
          </button>
        </div>

        {/* Copilot Answer Display */}
        {copilotAnswer && (
          <div className="bg-white/10 border border-white/15 rounded-2xl p-4 text-xs space-y-2 backdrop-blur-md animate-in fade-in duration-200">
            <div className="font-bold text-health-200 flex items-center justify-between">
              <span>Copilot Guidance for {selectedStore?.name}:</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(copilotAnswer);
                  showToast("Copilot recommendations copied!");
                }}
                className="text-[10px] text-white/70 hover:text-white flex items-center gap-1 underline"
              >
                <Copy className="w-3 h-3" /> Copy Advice
              </button>
            </div>
            <div className="text-white leading-relaxed space-y-1.5 whitespace-pre-line font-medium">
              {copilotAnswer}
            </div>
          </div>
        )}
      </div>

      {/* Row 3: Demand Panel (3km radius) & Unmet Demand ("Notify Me" requests) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Local Demand Panel (Within 3km) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Local Demand Panel
                </h3>
                <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded-md font-bold">
                  Within 3.0 km
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Top searched medicines by nearby residents in the last 7 days
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              {dashboardData?.demandPanel.items.length ?? 0} active demand signals
            </span>
          </div>

          {/* List of Demand Items */}
          <div className="space-y-3">
            {dashboardData?.demandPanel.items && dashboardData.demandPanel.items.length > 0 ? (
              dashboardData.demandPanel.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900">
                        {item.name}
                      </span>
                      {item.stocksThis ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-md font-bold">
                          In Stock ({item.currentStock} units)
                        </span>
                      ) : (
                        <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] px-2 py-0.5 rounded-md font-bold animate-pulse">
                          You don&apos;t stock this
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span>📍 ~{item.distanceKm} km from shop</span>
                      <span>&bull;</span>
                      <span className="font-semibold text-slate-700">
                        {item.searchCount} citizen searches
                      </span>
                      <span>&bull;</span>
                      <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold">
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        {item.trend}
                      </span>
                    </div>
                  </div>

                  {/* 1-click Add to Restock List */}
                  <div className="shrink-0 flex items-center gap-2">
                    {restockList.some((r) => r.name.toLowerCase() === item.name.toLowerCase()) ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Added
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAddToRestock(item.name, item.searchCount, item.currentStock)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          !item.stocksThis
                            ? "bg-red-600 hover:bg-red-700 text-white shadow-xs"
                            : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add to Restock List
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Loading local demand signals...
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Unmet Demand ("Notify Me" requests from citizens) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                Unmet Demand
              </h3>
              <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-md font-bold">
                Citizen Backorders
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Citizens waiting for &ldquo;Notify me when available&rdquo; alerts in {selectedStore?.area}
            </p>
          </div>

          <div className="space-y-3">
            {dashboardData?.unmetDemand && dashboardData.unmetDemand.length > 0 ? (
              dashboardData.unmetDemand.map((unmet) => (
                <div
                  key={unmet.id}
                  className="p-4 rounded-2xl border border-amber-200 bg-amber-50/30 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {unmet.medicineName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {unmet.salt}
                      </div>
                    </div>
                    <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                      {unmet.citizensWaiting} citizens waiting
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 italic">
                    &ldquo;{unmet.note}&rdquo;
                  </p>

                  <div className="pt-1 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleAddToRestock(unmet.medicineName, unmet.citizensWaiting, 0)}
                      className="text-[11px] font-bold text-amber-800 hover:text-amber-900 underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add to Restock
                    </button>

                    <button
                      onClick={() => {
                        showToast(`Broadcast alert sent! ${unmet.citizensWaiting} citizens notified that ${unmet.medicineName} is being restocked.`);
                      }}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold transition-colors"
                    >
                      Broadcast In-Stock Alert
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No pending reverse requests.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Stock Health Panel (Near Expiry with Discounts, Out-of-Stock, Low-Stock) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Stock Health &amp; Clearance Engine
            </h3>
            <p className="text-xs text-slate-500">
              Proactive alerts for near-expiry batches (&le;60 days) with recommended clearance discounts
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
              {nearExpiryCount} Near Expiry
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-800 border border-red-200">
              {outOfStockCount} Out of Stock
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
              {lowStockCount} Low Stock
            </span>
          </div>
        </div>

        {/* Near Expiry Clearance Cards */}
        {dashboardData?.stockHealth.nearExpiryItems && dashboardData.stockHealth.nearExpiryItems.length > 0 ? (
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              Near-Expiry Batches (Suggest Discounted Liquidation)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.stockHealth.nearExpiryItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-amber-200 bg-amber-50/20 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-slate-900 truncate">
                        {item.brandName}
                      </span>
                      <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                        {item.daysLeft} days left
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-500">
                      Batch #{item.batchNo} &bull; Exp: {new Date(item.expiryDate).toLocaleDateString()}
                    </div>

                    <div className="text-xs text-slate-600">
                      Current Stock: <strong>{item.quantity} units</strong>
                    </div>

                    <div className="pt-2 flex items-baseline gap-2">
                      <span className="text-xs line-through text-slate-400">
                        ₹{item.sellingPrice.toFixed(2)}
                      </span>
                      <span className="text-base font-extrabold text-emerald-700">
                        ₹{item.suggestedDiscountedPrice.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                        {item.suggestedDiscountPercent}% OFF
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyDiscount(item)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Percent className="w-3.5 h-3.5" />
                    Apply {item.suggestedDiscountPercent}% Clearance Price
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            No batches expiring within the next 60 days. All warehouse batches have safe shelf life.
          </div>
        )}
      </div>

      {/* Row 5: Detailed Tabs: Live Inventory & Orders Stepper */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-6 pt-4 gap-6">
          <button
            onClick={() => setActiveTab("INVENTORY")}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "INVENTORY"
                ? "border-health-600 text-health-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Package className="w-4 h-4" />
            Live Inventory &amp; Stock Editor ({inventory.length})
          </button>

          <button
            onClick={() => setActiveTab("ORDERS")}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "ORDERS"
                ? "border-health-600 text-health-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Clock className="w-4 h-4" />
            Citizen Holds &amp; Reservations ({orders.length})
            {pendingHolds > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingHolds}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Live Stock Editor */}
        {activeTab === "INVENTORY" && (
          <div className="p-6 space-y-5">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search brand, manufacturer or salt..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-health-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </span>
                {(["ALL", "LOW_STOCK", "OUT_OF_STOCK"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setStockFilter(mode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      stockFilter === mode
                        ? "bg-health-700 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {mode === "ALL"
                      ? "All Items"
                      : mode === "LOW_STOCK"
                      ? "Low Stock (<10)"
                      : "Stockout (0)"}
                  </button>
                ))}

                <button
                  onClick={() => fetchStoreData(selectedStoreId)}
                  title="Refresh"
                  className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-health-600" : ""}`} />
                </button>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Medicine &amp; Composition</th>
                    <th className="py-3 px-4">Dosage / Pack</th>
                    <th className="py-3 px-4">Batch / Exp</th>
                    <th className="py-3 px-4">MRP / Selling Price</th>
                    <th className="py-3 px-4 text-center">Stock Quantity</th>
                    <th className="py-3 px-4 text-right">Stock Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map((item) => {
                    const isOut = item.quantity === 0;
                    const isLow = item.quantity > 0 && item.quantity < 10;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{item.brandName}</span>
                            {item.isJanAushadhi && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                                Jan Aushadhi
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-normal text-slate-400 mt-0.5">
                            {item.salts.map((s) => `${s.name} ${s.strength}`).join(" + ")}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 capitalize">
                          {item.dosageForm} &bull; {item.packSize} units
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          <div>{item.batchNo}</div>
                          <div className="text-[10px] text-slate-400">
                            Exp: {new Date(item.expiryDate).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">₹{item.sellingPrice.toFixed(2)}</div>
                          <div className="text-[10px] text-slate-400 line-through">
                            MRP ₹{item.mrp.toFixed(2)}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-xl border border-slate-200">
                            <button
                              onClick={() => handleQuantityChange(item, -5)}
                              className="p-1 hover:bg-slate-200 rounded text-slate-700"
                              title="Decrease 5 units"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span
                              className={`font-bold px-2 text-xs min-w-[32px] ${
                                isOut
                                  ? "text-red-600 font-extrabold"
                                  : isLow
                                  ? "text-amber-600"
                                  : "text-slate-800"
                              }`}
                            >
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item, 5)}
                              className="p-1 hover:bg-slate-200 rounded text-slate-700"
                              title="Add 5 units"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleToggleStock(item)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                              isOut
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                : "bg-red-50 text-red-700 hover:bg-red-100"
                            }`}
                          >
                            {isOut ? "Set In Stock" : "Mark Stockout"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Citizen Reservations */}
        {activeTab === "ORDERS" && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Citizen reservations held for up to 2 hours. Pack medicines and mark &ldquo;Ready for Pickup&rdquo;.
              </span>
              <span className="font-bold text-slate-800">{orders.length} total orders recorded</span>
            </div>

            {orders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No active citizen reservations for this pharmacy.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const isHold = order.status === "HOLD_REQUESTED";
                  const isReady = order.status === "READY";
                  const isCompleted = order.status === "COMPLETED";

                  return (
                    <div
                      key={order.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-health-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-slate-800">
                            Order #{order.id.slice(-6).toUpperCase()}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isHold
                                ? "bg-amber-100 text-amber-800 animate-pulse"
                                : isReady
                                ? "bg-blue-100 text-blue-800"
                                : isCompleted
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {order.status}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                          <span className="flex items-center gap-1 font-medium">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {order.customerName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {order.customerPhone}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 pt-1">
                          <strong>Items: </strong>
                          {order.items
                            .map((i) => `${i.brandName} (${i.quantity}x @ ₹${i.unitPrice})`)
                            .join(", ")}
                        </div>
                      </div>

                      {/* Financials & Status Controls */}
                      <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0">
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-slate-900">
                            ₹{order.totalPaid.toFixed(2)}
                          </div>
                          {order.savings > 0 && (
                            <div className="text-[10px] text-emerald-600 font-bold">
                              Saved ₹{order.savings.toFixed(2)}
                            </div>
                          )}
                        </div>

                        {/* Status Buttons */}
                        <div className="flex items-center gap-2">
                          {isHold && (
                            <button
                              onClick={() => handleOrderStatusUpdate(order.id, "READY")}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
                            >
                              Mark Ready
                            </button>
                          )}

                          {isReady && (
                            <button
                              onClick={() => handleOrderStatusUpdate(order.id, "COMPLETED")}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                            >
                              Picked Up &bull; Complete
                            </button>
                          )}

                          {!isCompleted && (
                            <button
                              onClick={() => handleOrderStatusUpdate(order.id, "CANCELLED")}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-500 rounded-xl text-xs font-semibold transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Restock List Modal */}
      {isRestockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <ListPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Restock Order List
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedStore?.name} &bull; {restockList.length} items to order
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRestockModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {restockList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Your restock list is empty. Click &ldquo;Add to Restock List&rdquo; on high-demand or stockout items in the demand panel!
              </div>
            ) : (
              <div className="space-y-3">
                {restockList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-900">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.reason} &bull; Added on {item.addedAt}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFromRestock(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-100">
                  <button
                    onClick={handleCopyRestockList}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy for Distributor WhatsApp
                  </button>

                  <button
                    onClick={() => {
                      const csvContent = "data:text/csv;charset=utf-8," +
                        ["Item Name,Est Qty,Reason,Added Date"]
                          .concat(restockList.map((r) => `"${r.name}",30,"${r.reason}","${r.addedAt}"`))
                          .join("\n");
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", `Restock_${selectedStore?.area || "Shop"}_${new Date().toISOString().slice(0, 10)}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      showToast("Downloaded restock CSV file!");
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Export CSV
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
