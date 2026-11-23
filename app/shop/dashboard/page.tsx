"use client";

import { useEffect, useState } from "react";
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
  ChevronRight,
  Filter,
  RefreshCw,
  Phone,
  User,
} from "lucide-react";

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

export default function ShopDashboardPage() {
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"INVENTORY" | "ORDERS">("INVENTORY");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"ALL" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Fetch store inventory and orders when selectedStoreId changes
  const fetchStoreData = async (storeId: string) => {
    if (!storeId) return;
    setLoading(true);
    try {
      const [invRes, orderRes] = await Promise.all([
        fetch(`/api/shop/inventory?storeId=${storeId}`),
        fetch(`/api/shop/orders?storeId=${storeId}`),
      ]);
      const invData = await invRes.json();
      const orderData = await orderRes.json();

      if (invData.success) {
        setInventory(invData.inventory);
      }
      if (orderRes.ok && orderData.success) {
        setOrders(orderData.orders);
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
    }
  }, [selectedStoreId]);

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
      showToast(`Updated stock of ${item.brandName} to ${newQty} units.`);
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
          : `Restocked ${item.brandName} (25 units)`
      );
    } catch (err) {
      console.error("Failed to toggle stock", err);
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const selectedStore = stores.find((s) => s.id === selectedStoreId);

  // Metrics
  const totalSkus = inventory.length;
  const lowStockCount = inventory.filter((i) => i.quantity > 0 && i.quantity < 10).length;
  const outOfStockCount = inventory.filter((i) => i.quantity === 0).length;
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
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
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

        {/* Store Switcher & Quick Bill Upload Action */}
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
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-health-700 hover:bg-health-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <Receipt className="w-4 h-4" />
              Upload Invoice OCR
            </Link>

            <Link
              href={`/store/${selectedStoreId || "store-1"}`}
              title="View Public Profile"
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Total SKUs</span>
            <Package className="w-4 h-4 text-health-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalSkus}</div>
          <div className="text-xs text-slate-500">Catalog medicines active</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-amber-700 text-xs font-bold uppercase">
            <span>Low Stock Alert</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-800">{lowStockCount}</div>
          <div className="text-xs text-amber-600 font-medium">&lt; 10 units remaining</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-red-200 bg-red-50/20 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-red-600 text-xs font-bold uppercase">
            <span>Stock-Out Hotspots</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
          <div className="text-xs text-red-600 font-medium">0 stock (urgent re-order)</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-blue-700 text-xs font-bold uppercase">
            <span>Citizen Holds</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-800">{pendingHolds}</div>
          <div className="text-xs text-blue-600 font-medium">Awaiting counter pickup</div>
        </div>
      </div>

      {/* Main Tabbed Interface */}
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
                    <th className="py-3 px-4">Medicine &amp; Salts</th>
                    <th className="py-3 px-4">Dosage / Pack</th>
                    <th className="py-3 px-4">Batch / Exp</th>
                    <th className="py-3 px-4">MRP / Selling Price</th>
                    <th className="py-3 px-4 text-center">Stock Quantity</th>
                    <th className="py-3 px-4 text-right">Quick Actions</th>
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
    </div>
  );
}
