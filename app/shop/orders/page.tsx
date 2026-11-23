"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Store,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Package,
  Award,
  Phone,
  User,
  RefreshCw,
  X,
  Filter,
  Check,
  Truck,
  Building,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { HoldCountdownTimer } from "@/components/HoldCountdownTimer";
import { OrderStatusStepper } from "@/components/OrderStatusStepper";
import { ChatDrawer } from "@/components/ChatDrawer";

interface StoreOption {
  id: string;
  name: string;
  type: string;
  area: string;
  phone: string;
}

interface OrderItem {
  id: string;
  medicineId: string;
  brandName: string;
  dosageForm: string;
  quantity: number;
  unitPrice: number;
  baselinePrice: number;
  isJanAushadhi: boolean;
}

interface OrderMessage {
  id: string;
  senderRole: string;
  text: string;
  createdAt: string;
}

interface ShopOrder {
  id: string;
  storeId: string;
  storeName: string;
  storeArea: string;
  status: string;
  mode: string;
  createdAt: string;
  holdExpiresAt: string | null;
  isExpired: boolean;
  totalPaid: number;
  totalMrpBaseline: number;
  savings: number;
  customerName: string;
  customerPhone: string;
  customerId: string;
  items: OrderItem[];
  messages: OrderMessage[];
}

export default function ShopOrdersPage() {
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "ALL" | "HOLD_REQUESTED" | "CONFIRMED_READY" | "COMPLETED" | "CHATS"
  >("ALL");

  // Rejection Modal State
  const [rejectingOrder, setRejectingOrder] = useState<ShopOrder | null>(null);
  const [rejectionReason, setRejectionReason] = useState("Stock discrepancy / Out of stock");
  const [customReason, setCustomReason] = useState("");
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  // Chat Drawer State
  const [chatOrder, setChatOrder] = useState<ShopOrder | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Fetch available stores on mount
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

  // 2. Fetch orders when selectedStoreId changes
  const fetchOrders = async () => {
    if (!selectedStoreId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/shop/orders?storeId=${encodeURIComponent(selectedStoreId)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to fetch shop orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStoreId) {
      fetchOrders();
      // Poll every 5 seconds for incoming citizen holds
      const interval = setInterval(fetchOrders, 5000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStoreId]);

  // Update order status handler
  const handleUpdateStatus = async (orderId: string, status: string, reason?: string) => {
    try {
      const res = await fetch("/api/shop/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status,
          rejectionReason: reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (status === "CONFIRMED") {
          showToast(`Hold confirmed for Order #${orderId.slice(-6).toUpperCase()}.`);
        } else if (status === "READY") {
          showToast(`Order #${orderId.slice(-6).toUpperCase()} marked Ready for Pickup.`);
        } else if (status === "COMPLETED") {
          showToast(`Order #${orderId.slice(-6).toUpperCase()} Completed! Savings added to citizen.`);
        } else if (status === "CANCELLED") {
          showToast(`Order #${orderId.slice(-6).toUpperCase()} Rejected. Reserved stock restored.`);
        }
        await fetchOrders();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // Submit Rejection
  const handleConfirmRejection = async () => {
    if (!rejectingOrder) return;
    setIsSubmittingReject(true);
    const finalReason = rejectionReason === "Other" ? customReason : rejectionReason;

    await handleUpdateStatus(rejectingOrder.id, "CANCELLED", finalReason);
    setIsSubmittingReject(false);
    setRejectingOrder(null);
    setCustomReason("");
  };

  const selectedStore = stores.find((s) => s.id === selectedStoreId);

  // Filter orders by active tab
  const filteredOrders = orders.filter((o) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "HOLD_REQUESTED") return o.status === "HOLD_REQUESTED";
    if (activeTab === "CONFIRMED_READY") return o.status === "CONFIRMED" || o.status === "READY";
    if (activeTab === "COMPLETED") return o.status === "COMPLETED";
    if (activeTab === "CHATS") return o.messages && o.messages.length > 0;
    return true;
  });

  // Metrics
  const pendingHoldsCount = orders.filter((o) => o.status === "HOLD_REQUESTED").length;
  const inProgressCount = orders.filter((o) => o.status === "CONFIRMED" || o.status === "READY").length;
  const completedCount = orders.filter((o) => o.status === "COMPLETED").length;
  const totalSavingsGiven = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((acc, o) => acc + o.savings, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-28">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Chat Drawer */}
      {chatOrder && (
        <ChatDrawer
          isOpen={true}
          onClose={() => setChatOrder(null)}
          storeId={chatOrder.storeId}
          storeName={selectedStore?.name || "Pharmacy"}
          orderId={chatOrder.id}
          orderNumber={chatOrder.id.slice(-6).toUpperCase()}
          currentRole="STORE"
        />
      )}

      {/* Reject Order Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Reject Medicine Hold
                  </h3>
                  <p className="text-xs text-slate-500">
                    Order #{rejectingOrder.id.slice(-6).toUpperCase()}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Rejecting will automatically <strong>restore reserved stock</strong> to your pharmacy inventory and send an explanatory notification to the citizen.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Reason for Rejection:
              </label>
              {[
                "Stock discrepancy / Out of stock",
                "Damaged batch / Expired item",
                "Doctor prescription required for scheduled drug",
                "Store closing soon / Out of delivery zone",
                "Other",
              ].map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs bg-slate-50 border border-slate-200 hover:border-health-400 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="rejectionReason"
                    value={reason}
                    checked={rejectionReason === reason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="text-health-600 focus:ring-health-500"
                  />
                  <span className="text-slate-800">{reason}</span>
                </label>
              ))}

              {rejectionReason === "Other" && (
                <input
                  type="text"
                  placeholder="Specify custom reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-health-500"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                disabled={isSubmittingReject}
                onClick={handleConfirmRejection}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
              >
                {isSubmittingReject ? "Restoring Stock..." : "Confirm Rejection & Restore Stock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner & Store Selector */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-health-50 text-health-800 text-xs font-bold px-3 py-1 rounded-full border border-health-200">
            <Store className="w-3.5 h-3.5 text-health-600" />
            Pharmacist Hold &amp; Order Manager &bull; Real-time 5s Polling
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Citizen Holds &amp; Orders
          </h1>
          <p className="text-xs text-slate-500">
            Manage incoming 2-hour holds, confirm batch availability, mark ready for pickup, and chat with customers.
          </p>
        </div>

        {/* Store Switcher */}
        <div className="shrink-0 space-y-1 min-w-[260px]">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Pharmacy:
          </label>
          <select
            value={selectedStoreId}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-health-500 shadow-xs"
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.area})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-amber-700 text-xs font-bold uppercase">
            <span>Action Required</span>
            <Clock className="w-4 h-4 text-amber-500 animate-spin-slow" />
          </div>
          <div className="text-2xl font-bold text-amber-800">{pendingHoldsCount}</div>
          <div className="text-xs text-amber-600 font-medium">Holds awaiting confirmation</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-blue-700 text-xs font-bold uppercase">
            <span>In Progress</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-800">{inProgressCount}</div>
          <div className="text-xs text-blue-600 font-medium">Confirmed / Ready at counter</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-bold uppercase">
            <span>Completed Orders</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-800">{completedCount}</div>
          <div className="text-xs text-emerald-600 font-medium">Fulfilled &amp; delivered</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Citizen Savings</span>
            <TrendingUp className="w-4 h-4 text-health-600" />
          </div>
          <div className="text-2xl font-bold text-health-700">₹{totalSavingsGiven.toFixed(0)}</div>
          <div className="text-xs text-slate-500">Delivered via Jan Aushadhi &amp; discounts</div>
        </div>
      </div>

      {/* Main Orders Board */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-6 pt-4 gap-4 overflow-x-auto">
          {[
            { id: "ALL", label: `All Orders (${orders.length})` },
            { id: "HOLD_REQUESTED", label: `Holds Requested (${pendingHoldsCount})` },
            { id: "CONFIRMED_READY", label: `Confirmed & Ready (${inProgressCount})` },
            { id: "COMPLETED", label: `Completed (${completedCount})` },
            { id: "CHATS", label: `Chat Inbox (${orders.filter((o) => o.messages.length > 0).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-health-600 text-health-800"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            onClick={fetchOrders}
            title="Refresh Orders"
            className="ml-auto p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 mb-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-health-600" : ""}`} />
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Chat Inbox View */}
          {activeTab === "CHATS" ? (
            <div className="space-y-3">
              {orders.filter((o) => o.messages.length > 0).length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No active customer conversations yet.
                </div>
              ) : (
                orders
                  .filter((o) => o.messages.length > 0)
                  .map((ord) => {
                    const lastMsg = ord.messages[ord.messages.length - 1];
                    const isFromCitizen = lastMsg?.senderRole === "CITIZEN";

                    return (
                      <div
                        key={ord.id}
                        onClick={() => setChatOrder(ord)}
                        className="p-4 rounded-2xl border border-slate-200 hover:border-health-400 bg-slate-50/50 hover:bg-white cursor-pointer transition-all flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-health-100 text-health-800 flex items-center justify-center font-bold text-xs shrink-0 relative">
                            <User className="w-5 h-5" />
                            {isFromCitizen && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                                {ord.customerName}
                              </h4>
                              <span className="text-[11px] text-slate-400">
                                Order #{ord.id.slice(-6).toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5 max-w-md truncate">
                              <strong>{isFromCitizen ? "Citizen:" : "Store:"}</strong> {lastMsg?.text}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 block">
                            {new Date(lastMsg?.createdAt || "").toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="text-xs font-bold text-health-700 inline-flex items-center gap-1 mt-1">
                            <MessageSquare className="w-3.5 h-3.5" /> Reply
                          </span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          ) : (
            /* Orders List View */
            <div className="space-y-4">
              {loading && orders.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs animate-pulse">
                  Loading store holds and orders...
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No orders found in this filter category.
                </div>
              ) : (
                filteredOrders.map((ord) => {
                  const isHold = ord.status === "HOLD_REQUESTED";
                  const isConfirmed = ord.status === "CONFIRMED";
                  const isReady = ord.status === "READY";
                  const isCompleted = ord.status === "COMPLETED";
                  const isCancelled = ord.status === "CANCELLED";

                  return (
                    <div
                      key={ord.id}
                      className="p-5 rounded-3xl border border-slate-200 bg-white hover:border-health-300 transition-colors shadow-xs space-y-4"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="font-black text-slate-900 text-sm">
                              Order #{ord.id.slice(-6).toUpperCase()}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isHold
                                  ? "bg-amber-100 text-amber-800 animate-pulse"
                                  : isConfirmed
                                  ? "bg-blue-100 text-blue-800"
                                  : isReady
                                  ? "bg-teal-100 text-teal-800"
                                  : isCompleted
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {ord.status}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(ord.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          {/* Customer Details */}
                          <div className="flex items-center gap-4 text-xs text-slate-600 mt-1">
                            <span className="flex items-center gap-1 font-semibold text-slate-800">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              {ord.customerName}
                            </span>
                            <a
                              href={`tel:${ord.customerPhone}`}
                              className="flex items-center gap-1 text-health-700 hover:underline"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {ord.customerPhone}
                            </a>
                            <span className="text-slate-400">&bull; Mode: <strong>{ord.mode}</strong></span>
                          </div>
                        </div>

                        {/* Hold Timer or Status Badge */}
                        <div className="flex items-center gap-2 shrink-0">
                          <HoldCountdownTimer
                            expiresAt={ord.holdExpiresAt}
                            status={ord.status}
                          />

                          <button
                            type="button"
                            onClick={() => setChatOrder(ord)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-health-50 text-slate-700 hover:text-health-800 border border-slate-200 transition-colors inline-flex items-center gap-1.5 shadow-xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chat</span>
                            {ord.messages.length > 0 && (
                              <span className="w-2 h-2 rounded-full bg-health-600" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Status Timeline Stepper */}
                      <OrderStatusStepper status={ord.status} mode={ord.mode} />

                      {/* Items List */}
                      <div className="text-xs text-slate-600 space-y-1.5">
                        <div className="font-semibold text-slate-700">Prescription / Items Reserved:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {ord.items.map((it) => (
                            <div
                              key={it.id}
                              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                            >
                              <div>
                                <span className="font-bold text-slate-800 block text-xs">
                                  {it.brandName}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {it.dosageForm} &bull; Qty: {it.quantity}
                                </span>
                              </div>
                              <span className="font-bold text-slate-900 text-xs">
                                ₹{(it.unitPrice * it.quantity).toFixed(1)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Bar & Financial Summary */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
                        <div className="text-xs text-slate-600">
                          Total Amount: <strong>₹{ord.totalPaid.toFixed(1)}</strong> &bull; Citizen Saved:{" "}
                          <span className="text-emerald-700 font-bold">₹{ord.savings.toFixed(1)}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {isHold && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(ord.id, "CONFIRMED")}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs inline-flex items-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5" /> Confirm Hold
                              </button>

                              <button
                                type="button"
                                onClick={() => setRejectingOrder(ord)}
                                className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-xl text-xs font-semibold transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {isConfirmed && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(ord.id, "READY")}
                              className="px-4 py-2 bg-health-700 hover:bg-health-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs inline-flex items-center gap-1.5"
                            >
                              <Package className="w-3.5 h-3.5" /> Mark Ready for Pickup
                            </button>
                          )}

                          {isReady && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(ord.id, "COMPLETED")}
                              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs inline-flex items-center gap-1.5"
                            >
                              <Award className="w-3.5 h-3.5" /> Mark Completed (Fulfilled)
                            </button>
                          )}

                          {isCompleted && (
                            <span className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Order Fulfilled
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
