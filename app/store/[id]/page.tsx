"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Store,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Pill,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MessageSquare,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { SubstitutePanel } from "@/components/SubstitutePanel";
import { ChatDrawer } from "@/components/ChatDrawer";

const StoreLocationMap = dynamic(() => import("@/components/StoreLocationMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 md:h-56 rounded-2xl bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-xs">
      Loading Pharmacy Map...
    </div>
  ),
});

interface MedicineItem {
  inventoryId: string;
  medicineId: string;
  brandName: string;
  manufacturer: string;
  dosageForm: string;
  packSize: number;
  mrp: number;
  sellingPrice: number;
  discountPercent: number;
  quantity: number;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  batchNo: string;
  expiryDate: string;
  isGeneric: boolean;
  isJanAushadhi: boolean;
  salts: {
    saltId: string;
    name: string;
    category: string;
    strength: string;
    isNarrowTherapeuticIndex: boolean;
  }[];
}

interface StoreDetails {
  id: string;
  name: string;
  type: string;
  address: string;
  area: string;
  lat: number;
  lng: number;
  phone: string;
  ownerName: string;
  openHours: string;
  isOpenNow: boolean;
  isVerified: boolean;
  stats: {
    totalSkus: number;
    inStockSkus: number;
    janAushadhiSkus: number;
    averageSavingsPercent: number;
  };
  inventory: MedicineItem[];
}

export default function StoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = (params?.id as string) || "store-1";

  const [store, setStore] = useState<StoreDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"ALL" | "IN_STOCK" | "GENERIC">("ALL");
  const [expandedSubstitutes, setExpandedSubstitutes] = useState<Record<string, boolean>>({});
  const [reservedToast, setReservedToast] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Single Store Cart state
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [conflictModalItem, setConflictModalItem] = useState<MedicineItem | null>(null);

  // Sync cart count from localStorage
  const syncCartState = () => {
    try {
      const existingCart = JSON.parse(localStorage.getItem("dawaasetu_cart") || "[]");
      const sameStoreItems = existingCart.filter((it: any) => it.storeId === storeId);
      const count = sameStoreItems.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
      const total = sameStoreItems.reduce((acc: number, item: any) => acc + (item.sellingPrice || 0) * (item.quantity || 1), 0);
      setCartCount(count);
      setCartTotal(total);
    } catch (e) {
      console.warn("Cart read error", e);
    }
  };

  useEffect(() => {
    syncCartState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  useEffect(() => {
    async function loadStore() {
      setLoading(true);
      try {
        const res = await fetch(`/api/stores/${storeId}`);
        const data = await res.json();
        if (data.success) {
          setStore(data.store);
        }
      } catch (err) {
        console.error("Failed to fetch store details", err);
      } finally {
        setLoading(false);
      }
    }
    loadStore();
  }, [storeId]);

  const toggleSubstitutes = (medId: string) => {
    setExpandedSubstitutes((prev) => ({
      ...prev,
      [medId]: !prev[medId],
    }));
  };

  // Add medicine to cart with Single-Store check
  const handleReserve = (item: MedicineItem) => {
    try {
      const existingCart = JSON.parse(localStorage.getItem("dawaasetu_cart") || "[]");

      // Check if existing cart has items from another store
      const otherStoreItem = existingCart.find((it: any) => it.storeId && it.storeId !== store?.id);
      if (otherStoreItem) {
        // Show conflict modal to ask user if they want to clear previous store cart
        setConflictModalItem(item);
        return;
      }

      addItemToCart(item, false);
    } catch (e) {
      console.error("Cart save error", e);
    }
  };

  const addItemToCart = (item: MedicineItem, clearPrevious = false) => {
    try {
      const existingCart = clearPrevious
        ? []
        : JSON.parse(localStorage.getItem("dawaasetu_cart") || "[]");

      const existingIndex = existingCart.findIndex(
        (it: any) => it.medicineId === item.medicineId && it.storeId === store?.id
      );

      if (existingIndex > -1) {
        existingCart[existingIndex].quantity += 1;
      } else {
        existingCart.push({
          medicineId: item.medicineId,
          brandName: item.brandName,
          storeId: store?.id,
          storeName: store?.name,
          sellingPrice: item.sellingPrice,
          mrp: item.mrp,
          quantity: 1,
          dosageForm: item.dosageForm,
          packSize: item.packSize,
          isJanAushadhi: item.isJanAushadhi,
        });
      }

      localStorage.setItem("dawaasetu_cart", JSON.stringify(existingCart));
      syncCartState();
      setConflictModalItem(null);
      setReservedToast(`Added 1 pack of ${item.brandName} to your cart.`);
      setTimeout(() => setReservedToast(null), 4000);
    } catch (e) {
      console.error("Cart add error", e);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-44 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-24 bg-slate-100 rounded-2xl" />
          <div className="h-24 bg-slate-100 rounded-2xl" />
          <div className="h-24 bg-slate-100 rounded-2xl" />
          <div className="h-24 bg-slate-100 rounded-2xl" />
        </div>
        <div className="h-96 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Pharmacy Not Found</h2>
        <p className="text-slate-500 text-sm">
          We couldn&apos;t locate pharmacy ID &ldquo;{storeId}&rdquo;. It may be inactive or entered incorrectly.
        </p>
        <button
          onClick={() => router.push("/search")}
          className="px-4 py-2 bg-health-700 text-white rounded-xl text-sm font-semibold hover:bg-health-800"
        >
          Return to Medicine Search
        </button>
      </div>
    );
  }

  const isJanAushadhi = store.type === "JAN_AUSHADHI";
  const isHospital = store.type === "HOSPITAL";

  const filteredInventory = store.inventory.filter((item) => {
    // Search filter
    const matchesSearch =
      item.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.salts.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());

    // Stock filter
    if (!matchesSearch) return false;
    if (stockFilter === "IN_STOCK") return item.quantity > 0;
    if (stockFilter === "GENERIC") return item.isJanAushadhi || item.isGeneric;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-28">
      {/* Toast Notification */}
      {reservedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span className="text-sm font-semibold">{reservedToast}</span>
          <button
            onClick={() => router.push("/orders")}
            className="ml-2 underline text-xs font-bold text-emerald-100 hover:text-white"
          >
            View Cart
          </button>
        </div>
      )}

      {/* Conflict Modal: Single Store Cart Rule */}
      {conflictModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Switch Pharmacy Cart?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Your cart currently contains medicines from another pharmacy. Orders and 2-hour holds must be placed with a single pharmacy for counter pickup or delivery.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
              Clear previous cart and start fresh with <strong>{store.name}</strong>?
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConflictModalItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Keep Existing Cart
              </button>
              <button
                type="button"
                onClick={() => addItemToCart(conflictModalItem, true)}
                className="px-4 py-2 text-xs font-bold bg-health-700 hover:bg-health-800 text-white rounded-xl shadow-xs"
              >
                Clear &amp; Add From Here
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        storeId={store.id}
        storeName={store.name}
        currentRole="CITIZEN"
      />

      {/* Pharmacy Hero Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isJanAushadhi
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : isHospital
                    ? "bg-purple-100 text-purple-800 border border-purple-300"
                    : "bg-blue-100 text-blue-800 border border-blue-300"
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                {isJanAushadhi
                  ? "Pradhan Mantri Jan Aushadhi Kendra"
                  : isHospital
                  ? "Government / Hospital Pharmacy"
                  : "Licensed Private Chemist"}
              </span>

              {store.isVerified && (
                <span className="inline-flex items-center gap-1 text-teal-700 text-xs font-semibold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> UP Drugs Control Verified
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  store.isOpenNow
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    store.isOpenNow ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                  }`}
                />
                {store.isOpenNow ? "Open Now" : "Currently Closed"}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              {store.name}
            </h1>

            <div className="text-sm text-slate-600 space-y-1">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{store.address}, {store.area}, Lucknow</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Operating Hours: {store.openHours}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Contact: {store.phone} (Pharmacist: {store.ownerName})</span>
              </p>
            </div>
          </div>

          {/* Quick Actions: Call, Directions, and Chat */}
          <div className="flex flex-row md:flex-col gap-3 shrink-0">
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <MessageSquare className="w-4 h-4" /> Chat with Shopkeeper
            </button>

            <a
              href={`tel:${store.phone}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-health-700 hover:bg-health-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <Phone className="w-4 h-4" /> Call Chemist
            </a>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Get Directions
            </a>
          </div>
        </div>

        {/* Embedded Location Map */}
        <StoreLocationMap
          name={store.name}
          lat={store.lat}
          lng={store.lng}
          type={store.type}
          address={store.address}
        />
      </div>

      {/* Store Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase">Available SKUs</div>
          <div className="text-2xl font-bold text-slate-800">{store.stats.inStockSkus}</div>
          <div className="text-xs text-slate-500">of {store.stats.totalSkus} catalog items</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-emerald-700 uppercase">Jan Aushadhi Generics</div>
          <div className="text-2xl font-bold text-emerald-800">{store.stats.janAushadhiSkus}</div>
          <div className="text-xs text-emerald-600 font-medium">Subsidised options</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase">Avg Discount vs MRP</div>
          <div className="text-2xl font-bold text-health-700">{store.stats.averageSavingsPercent}%</div>
          <div className="text-xs text-slate-500">Government capped &amp; discounted</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase">Citizen Hold Mode</div>
          <div className="text-sm font-bold text-slate-800 pt-1">2-Hour Free Reserve</div>
          <div className="text-xs text-slate-500">Guaranteed counter pickup</div>
        </div>
      </div>

      {/* Inventory Search & Catalog */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Live In-Stock Medicines</h2>
            <p className="text-xs text-slate-500">
              Verified inventory at {store.name} &bull; Search by brand or active salt
            </p>
          </div>

          {/* Search Bar & Stock Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search brand, manufacturer or salt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-health-500"
              />
            </div>

            <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-50 text-xs">
              {(["ALL", "IN_STOCK", "GENERIC"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStockFilter(filter)}
                  className={`px-3 py-1 font-semibold rounded-lg transition-colors ${
                    stockFilter === filter
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {filter === "ALL"
                    ? "All"
                    : filter === "IN_STOCK"
                    ? "In Stock Only"
                    : "Generics Only"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Medicines List */}
        {filteredInventory.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Pill className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-slate-700 font-semibold text-sm">No medicines found</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No matching medicines match &ldquo;{searchQuery}&rdquo; under the selected filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredInventory.map((item) => {
              const isOut = item.stockStatus === "OUT_OF_STOCK";
              const isLow = item.stockStatus === "LOW_STOCK";
              const isSubExpanded = !!expandedSubstitutes[item.medicineId];

              return (
                <div key={item.inventoryId} className="py-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm md:text-base">
                          {item.brandName}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded capitalize">
                          {item.dosageForm} &bull; Pack of {item.packSize}
                        </span>
                        {item.isJanAushadhi && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Jan Aushadhi
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                        <span>Mfg: {item.manufacturer}</span>
                        <span>&bull;</span>
                        <span className="text-health-700 font-medium">
                          Salts: {item.salts.map((s) => `${s.name} ${s.strength}`).join(" + ")}
                        </span>
                      </div>
                    </div>

                    {/* Pricing, Stock & Action */}
                    <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="text-base font-extrabold text-slate-900">
                          ₹{item.sellingPrice.toFixed(2)}
                        </div>
                        {item.mrp > item.sellingPrice && (
                          <div className="text-[11px] text-slate-400">
                            <span className="line-through">₹{item.mrp.toFixed(2)}</span>
                            <span className="text-emerald-600 font-bold ml-1">
                              ({item.discountPercent}% OFF)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Stock badge */}
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                          isOut
                            ? "bg-red-100 text-red-700"
                            : isLow
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isOut
                          ? "Out of Stock"
                          : isLow
                          ? `Low: ${item.quantity} left`
                          : `In Stock (${item.quantity})`}
                      </span>

                      {/* Add to Cart / Reserve Button */}
                      <button
                        onClick={() => handleReserve(item)}
                        disabled={isOut}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors ${
                          isOut
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-health-700 hover:bg-health-800 text-white shadow-sm"
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Add to Hold
                      </button>
                    </div>
                  </div>

                  {/* Cheaper Alternatives Button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSubstitutes(item.medicineId)}
                      className="text-xs text-health-700 hover:text-health-800 font-semibold inline-flex items-center gap-1 bg-health-50 px-2.5 py-1 rounded-lg border border-health-100 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-health-600" />
                      <span>Check cheaper generic substitutes</span>
                      {isSubExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Inline Generic Substitution Engine */}
                  {isSubExpanded && (
                    <div className="pt-2">
                      <SubstitutePanel
                        medicineId={item.medicineId}
                        medicineName={item.brandName}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar (if items in cart) */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto z-40 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-slate-700 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-health-600 text-white flex items-center justify-center shrink-0 font-black">
              {cartCount}
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
                <span>{cartCount} Medicines in Cart</span>
                <span className="text-emerald-400">&bull; ₹{cartTotal.toFixed(1)}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Ready for 2-hour hold reservation at {store.name}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/orders")}
            className="px-5 py-2.5 bg-health-600 hover:bg-health-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow transition-colors inline-flex items-center gap-2 shrink-0"
          >
            <span>Proceed to Hold</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
