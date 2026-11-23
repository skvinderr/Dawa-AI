"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import {
  ShoppingBag,
  Clock,
  MapPin,
  CheckCircle2,
  Calendar,
  AlertCircle,
  TrendingDown,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Plus,
  Trash2,
  Store as StoreIcon,
  MessageSquare,
  Truck,
  CreditCard,
  Building,
  Phone,
} from "lucide-react";
import { CartSummaryCard, CheaperNudge } from "@/components/CartSummaryCard";
import { CartItemSavingsInput } from "@/lib/savings";
import { HoldCountdownTimer } from "@/components/HoldCountdownTimer";
import { OrderStatusStepper } from "@/components/OrderStatusStepper";
import { ChatDrawer } from "@/components/ChatDrawer";

interface OrderRecord {
  id: string;
  storeId: string;
  storeName: string;
  storeArea: string;
  storeAddress: string;
  storePhone: string;
  status: string;
  mode: string;
  createdAt: string;
  holdExpiresAt: string | null;
  isExpired: boolean;
  totalPaid: number;
  totalMrpBaseline: number;
  savings: number;
  items: {
    id: string;
    medicineId: string;
    brandName: string;
    dosageForm: string;
    quantity: number;
    unitPrice: number;
    baselinePrice: number;
    isJanAushadhi: boolean;
  }[];
  lastMessage?: {
    text: string;
    senderRole: string;
    createdAt: string;
  } | null;
}

export default function OrdersPage() {
  const { t, language } = useTranslation();

  // Active Cart State (synced from localStorage or initialized with realistic Jan Aushadhi items)
  const [cartItems, setCartItems] = useState<CartItemSavingsInput[]>([]);
  const [storeInfo, setStoreInfo] = useState<{ id: string; name: string; area: string }>({
    id: "store-1",
    name: "PM Jan Aushadhi Kendra - Hazratganj",
    area: "Hazratganj, Lucknow",
  });

  // Delivery vs Pickup selection
  const [fulfillmentMode, setFulfillmentMode] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [deliveryAddress, setDeliveryAddress] = useState("Flat 402, Halwasiya Court, Hazratganj, Lucknow");
  const [paymentMethod, setPaymentMethod] = useState<"PAY_AT_STORE" | "PAY_ONLINE_DEMO">("PAY_AT_STORE");

  // Non-blocking Nudge for generic savings
  const [nudge, setNudge] = useState<CheaperNudge | null>({
    medicineName: "Telma 40",
    substituteName: "Jan Aushadhi Telmisartan 40",
    storeName: "PM Jan Aushadhi Kendra - Hazratganj",
    distanceKm: 1.2,
    potentialSavings: 123.0,
    substitutePrice: 22.0,
  });

  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chat Drawer state
  const [activeChatOrder, setActiveChatOrder] = useState<OrderRecord | null>(null);

  // Sync cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("dawaasetu_cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCartItems(
            parsed.map((p: any) => ({
              medicineId: p.medicineId,
              medicineName: p.brandName,
              quantity: p.quantity || 1,
              actualPrice: p.sellingPrice || 50,
              baselinePrice: p.mrp || p.sellingPrice * 2.5,
              highestNearbyPrice: p.mrp || p.sellingPrice * 2.5,
            }))
          );
          if (parsed[0].storeId && parsed[0].storeName) {
            setStoreInfo({
              id: parsed[0].storeId,
              name: parsed[0].storeName,
              area: "Lucknow",
            });
          }
          return;
        }
      }

      // Default demo cart if nothing in localStorage
      setCartItems([
        {
          medicineId: "med-aug",
          medicineName: "Jan Aushadhi Amoxyclav 625 (10 Tabs)",
          quantity: 1,
          actualPrice: 54.0,
          baselinePrice: 220.0,
          highestNearbyPrice: 220.0,
        },
        {
          medicineId: "med-dolo",
          medicineName: "Jan Aushadhi Paracetamol 650 (15 Tabs)",
          quantity: 2,
          actualPrice: 10.5,
          baselinePrice: 34.0,
          highestNearbyPrice: 34.0,
        },
        {
          medicineId: "med-telma-branded",
          medicineName: "Telma 40 (Branded, 15 Tabs)",
          quantity: 1,
          actualPrice: 145.0,
          baselinePrice: 145.0,
          highestNearbyPrice: 148.0,
        },
      ]);
    } catch (e) {
      console.warn("Cart parse error:", e);
    }
  }, []);

  // Fetch orders from /api/orders
  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // Poll orders every 10 seconds to detect status updates
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleApplyNudge = (appliedNudge: CheaperNudge) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.medicineName.includes(appliedNudge.medicineName)
          ? {
              ...item,
              medicineName: appliedNudge.substituteName,
              actualPrice: appliedNudge.substitutePrice,
            }
          : item
      )
    );
    setNudge(null);
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => {
      const updated = prev.filter((i) => i.medicineId !== id);
      try {
        localStorage.setItem("dawaasetu_cart", JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  // 2-Hour Hold Checkout Action
  const handleHoldCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const deliveryFee = fulfillmentMode === "DELIVERY" ? (cartItems.reduce((acc, i) => acc + i.actualPrice * i.quantity, 0) > 300 ? 0 : 30) : 0;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: storeInfo.id,
          mode: fulfillmentMode,
          paymentMethod,
          deliveryAddress: fulfillmentMode === "DELIVERY" ? deliveryAddress : undefined,
          deliveryFee,
          deliveryEta: "30-45 mins",
          items: cartItems.map((it) => ({
            medicineId: it.medicineId,
            quantity: it.quantity,
            unitPrice: it.actualPrice,
            baselinePrice: it.baselinePrice,
          })),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCheckoutSuccess(
          `Medicine Hold Reserved for 2 Hours! Status: HOLD_REQUESTED. Pharmacist has been notified.`
        );
        // Clear cart
        setCartItems([]);
        try {
          localStorage.removeItem("dawaasetu_cart");
        } catch (e) {
          console.warn(e);
        }
        // Refresh orders list
        await loadOrders();
        setTimeout(() => setCheckoutSuccess(null), 6000);
      } else {
        setErrorMessage(data.error || "Failed to create medicine hold order.");
      }
    } catch (err) {
      console.error("Hold checkout error:", err);
      setErrorMessage("Network error: Could not reach pharmacy database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-28">
      {/* Active Chat Drawer */}
      {activeChatOrder && (
        <ChatDrawer
          isOpen={true}
          onClose={() => setActiveChatOrder(null)}
          storeId={activeChatOrder.storeId}
          storeName={activeChatOrder.storeName}
          orderId={activeChatOrder.id}
          orderNumber={activeChatOrder.id.slice(-6).toUpperCase()}
          currentRole="CITIZEN"
        />
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-health-800 via-health-700 to-teal-800 text-white py-8 sm:py-12 border-b border-health-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-health-900/60 border border-health-500/50 text-health-200 text-xs font-semibold mb-3">
              <ShoppingBag className="w-3.5 h-3.5 text-health-400" />
              <span>Direct Pharmacy Hold &amp; 2-Hour Reserves (Lucknow)</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {language === "hi" ? "दवा रिजर्वेशन एवं बचत गणना" : "Cart, 2-Hour Holds & Orders"}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-health-100/90 leading-relaxed">
              Lock in your prescribed medicines with zero prepayment. Guaranteed 2-hour hold timer protects stock while you travel to the counter or await express delivery.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Checkout Confirmation Notification */}
        {checkoutSuccess && (
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-5 flex items-center justify-between gap-4 text-emerald-950 animate-in fade-in duration-200 shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm sm:text-base text-emerald-900">
                  {checkoutSuccess}
                </p>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Your stock is temporarily reserved. You can chat with the shopkeeper below or track the status timeline.
                </p>
              </div>
            </div>
            <button
              onClick={() => setCheckoutSuccess(null)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-5 flex items-center justify-between gap-4 text-rose-950 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
              <p className="font-bold text-xs sm:text-sm text-rose-900">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-bold text-rose-700 hover:text-rose-900"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Active Cart & Orders */}
          <div className="lg:col-span-7 space-y-6">
            {/* Active Cart Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-soft space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-health-100 text-health-700 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Active Medicine Cart</h3>
                    <p className="text-xs text-slate-500">
                      Single Store: <strong>{storeInfo.name}</strong> ({storeInfo.area})
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-health-50 text-health-800 border border-health-200">
                  {cartItems.length} Medicines
                </span>
              </div>

              {/* Items List */}
              {cartItems.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs space-y-2">
                  <p>Your medicine cart is empty.</p>
                  <Link
                    href="/search"
                    className="text-health-700 font-bold underline inline-block"
                  >
                    Search Lucknow pharmacies to add medicines &rarr;
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.medicineId}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs sm:text-sm hover:border-health-300 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900">{item.medicineName}</p>
                        <p className="text-xs text-slate-500">
                          Qty: {item.quantity} × ₹{item.actualPrice.toFixed(1)}
                          {item.actualPrice < item.baselinePrice && (
                            <span className="text-emerald-700 font-semibold ml-2">
                              (Saved ₹{((item.baselinePrice - item.actualPrice) * item.quantity).toFixed(1)})
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-black text-slate-900 block text-base">
                            ₹{(item.actualPrice * item.quantity).toFixed(1)}
                          </span>
                          {item.actualPrice < item.baselinePrice && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{(item.baselinePrice * item.quantity).toFixed(1)}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveCartItem(item.medicineId)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Fulfillment Mode: Pickup vs Delivery */}
              {cartItems.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Order Fulfillment Method:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFulfillmentMode("PICKUP")}
                        className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-colors ${
                          fulfillmentMode === "PICKUP"
                            ? "bg-health-50/70 border-health-600 text-health-900 ring-2 ring-health-500/20"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <StoreIcon className="w-4 h-4 mt-0.5 text-health-700 shrink-0" />
                        <div>
                          <p className="font-bold text-xs">Counter Pickup</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Free &bull; 2-Hour Guaranteed Hold
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFulfillmentMode("DELIVERY")}
                        className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-colors ${
                          fulfillmentMode === "DELIVERY"
                            ? "bg-health-50/70 border-health-600 text-health-900 ring-2 ring-health-500/20"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <Truck className="w-4 h-4 mt-0.5 text-health-700 shrink-0" />
                        <div>
                          <p className="font-bold text-xs">Simulated Delivery</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            ETA: 35-45 mins &bull; ₹30 (Free &gt; ₹300)
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Delivery Address Field (if Delivery chosen) */}
                  {fulfillmentMode === "DELIVERY" && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 animate-in fade-in">
                      <label className="block text-xs font-bold text-slate-700">
                        Delivery Address in Lucknow:
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="House / Flat no, Colony, Lucknow"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-health-500"
                      />
                      <p className="text-[10px] text-slate-400">
                        *Simulated delivery express dispatch across Lucknow districts.
                      </p>
                    </div>
                  )}

                  {/* Payment Method (Mock) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Payment Mode (Demo):
                    </label>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:border-health-300">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "PAY_AT_STORE"}
                          onChange={() => setPaymentMethod("PAY_AT_STORE")}
                          className="text-health-600 focus:ring-health-500"
                        />
                        <span className="font-medium text-slate-800">Pay at Store (Cash/UPI)</span>
                      </label>

                      <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:border-health-300">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "PAY_ONLINE_DEMO"}
                          onChange={() => setPaymentMethod("PAY_ONLINE_DEMO")}
                          className="text-health-600 focus:ring-health-500"
                        />
                        <span className="font-medium text-slate-800">Pay Online (Mock Instant)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Active & Recent Orders Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-soft space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-500" />
                  <h3 className="text-lg font-bold text-slate-900">Your Active &amp; Recent Orders</h3>
                </div>
                <button
                  onClick={loadOrders}
                  title="Refresh"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingOrders ? "animate-spin text-health-600" : ""}`} />
                </button>
              </div>

              {loadingOrders && orders.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                  Loading active orders and 2-hour holds...
                </div>
              ) : orders.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  No previous orders placed yet. Reserve medicines above to track holds!
                </p>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => {
                    const isHold = ord.status === "HOLD_REQUESTED";
                    const isReady = ord.status === "READY";
                    const isCompleted = ord.status === "COMPLETED";

                    return (
                      <div
                        key={ord.id}
                        className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4 hover:border-health-300 transition-colors"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 text-sm">
                                Order #{ord.id.slice(-6).toUpperCase()}
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
                                {ord.status}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {new Date(ord.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                              <StoreIcon className="w-3.5 h-3.5 text-health-600" />
                              <span>{ord.storeName} ({ord.storeArea})</span>
                            </p>
                          </div>

                          {/* Countdown Timer or Status */}
                          <div className="shrink-0 flex items-center gap-2">
                            <HoldCountdownTimer
                              expiresAt={ord.holdExpiresAt}
                              status={ord.status}
                            />

                            <button
                              type="button"
                              onClick={() => setActiveChatOrder(ord)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors inline-flex items-center gap-1.5 shadow-xs"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Chat with Chemist</span>
                            </button>
                          </div>
                        </div>

                        {/* Status Stepper Timeline */}
                        <OrderStatusStepper status={ord.status} mode={ord.mode} />

                        {/* Order Items List */}
                        <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                          <div className="font-semibold text-slate-700">Reserved Medicines:</div>
                          <div className="flex flex-wrap gap-2">
                            {ord.items.map((it) => (
                              <span
                                key={it.id}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-medium"
                              >
                                {it.brandName} &times; {it.quantity} (@ ₹{it.unitPrice.toFixed(1)})
                                {it.isJanAushadhi && (
                                  <span className="ml-1 text-[10px] text-emerald-700 font-bold">
                                    [Jan Aushadhi]
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Order Financials Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                          <span className="text-slate-500">
                            Mode: <strong>{ord.mode}</strong> &bull; Total MRP: ₹{ord.totalMrpBaseline.toFixed(1)}
                          </span>
                          <div className="text-right">
                            <span className="font-black text-slate-900 text-sm">
                              Paid/Due: ₹{ord.totalPaid.toFixed(1)}
                            </span>
                            {ord.savings > 0 && (
                              <span className="ml-2 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                                Saved ₹{ord.savings.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Prominent Cart Savings Card with Animated Count-up and Nudge */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <CartSummaryCard
              items={cartItems}
              nudge={nudge}
              onApplyNudge={handleApplyNudge}
              onCheckout={handleHoldCheckout}
              checkoutButtonText={
                isSubmitting
                  ? "Reserving 2-Hour Hold..."
                  : "Hold for 2 Hours (Free Reserve)"
              }
            />

            {/* Hold Guarantee Badge */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">Guaranteed 2-Hour Reservation</p>
                <p className="text-[11px] text-emerald-800 mt-0.5 leading-snug">
                  Stock is automatically decremented and locked for you. Pharmacist verifies batch upon hold request.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
