"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

type PaymentMethod = 'google_pay' | 'apple_pay' | 'card_stripe' | 'neopay';

export default function CartPage() {
    const { t,lang } = useLanguage();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"cart" | "history">("cart");

    // Dynamic state initialized to null (no hardcoded fallback values)
    const [rates, setRates] = useState<Record<string, number> | null>(null);
    const [displayCurrency, setDisplayCurrency] = useState<"MDL" | "RON" | "EUR">("MDL");

    useEffect(() => {
        let isMounted = true;
        fetch("/api/bnm-rates")
            .then((res) => res.json())
            .then((data) => {
                if (isMounted && data.success && data.rates) {
                    setRates(data.rates);
                }
            })
            .catch((err) => console.error("BNM Cart Rates Fetch Error:", err));

        return () => { isMounted = false; };
    }, []);

    // Stări pentru Plată și UI
    const [isPaying, setIsPaying] = useState(false);
    const [fadeState, setFadeState] = useState<"in" | "out">("in");
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            router.replace("/auth/login");
            return;
        }

        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false });

        if (!error && data) {
            setOrders(data);
        }
        setLoading(false);
    };

    const handleDelete = async (id: any) => {
        setProcessingId(id);
        const { error } = await supabase.from("orders").delete().eq("id", id);
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("cart:changed", { detail: { delta: -1 } }));
        }
        if (!error) {
            setOrders(prev => prev.filter(o => o.id !== id));
        } else {
            console.error("Eroare la ștergere:", error);
            alert(t.deleteError);
        }
        setProcessingId(null);
    };

    const handleTabChange = (tab: "cart" | "history") => {
        if (tab === activeTab) return;
        setFadeState("out");
        setTimeout(() => {
            setActiveTab(tab);
            setFadeState("in");
        }, 150);
    };

    // =====================================================================
    // 1. PAYMENT WRAPPER (Encapsulare pentru viitoarele integrări reale)
    // =====================================================================
    const processPayment = async (method: PaymentMethod, amount: number): Promise<boolean> => {
        switch (method) {
            case 'apple_pay':
            case 'google_pay':
            case 'card_stripe':
                console.log(`[Stripe Test] Procesăm ${amount} RON prin ${method}...`);
                // Aici va veni codul real de Stripe. Acum doar simulăm delay-ul băncii:
                await new Promise(resolve => setTimeout(resolve, 1500));
                return true;

            case 'neopay':
                console.log(`[NeoPay] Așteptăm datele firmei (CUI) pentru a procesa ${amount} RON.`);
                // Returnăm false momentan, până adaugi detaliile firmei
                alert(t.neoPayAlert);
                return false;

            default:
                return false;
        }
    };

    // =====================================================================
    // 2. CHECKOUT MANAGER
    // =====================================================================
    const handleCheckoutPay = async (selectedMethod: PaymentMethod) => {
        const pendingOrders = orders.filter(o => o.status === 'pending');
        if (pendingOrders.length === 0) return;

        setShowPaymentModal(false); // Închidem modalul imediat
        setIsPaying(true); // Afișăm loading pe butonul principal

        const totalAmount = pendingOrders.reduce((sum, order) => sum + Number(order.price), 0);
        const primaryCurrency = pendingOrders[0]?.currency || "RON";

        try {
            // 1. Procesăm plata prin Wrapper
            const paymentIsSuccessful = await processPayment(selectedMethod, totalAmount);

            if (!paymentIsSuccessful) {
                setIsPaying(false);
                return; // Oprim execuția dacă plata a picat / a fost anulată
            }

            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id;
            if (!userId) {
                alert(t.sessionExpired);
                setIsPaying(false);
                return;
            }
            const { error } = await supabase
                .from("orders")
                .update({
                    status: 'processing',
                })
                .eq("user_id", userId)
                .eq("status", "pending");

            if (!error) {
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("cart:changed", { detail: { delta: -pendingOrders.length } }));
                }
                await fetchOrders();
                handleTabChange("history");
            } else {
                throw new Error("Eroare la salvarea comenzii.");
            }

        } catch (error) {
            console.error("Eroare Checkout:", error);
            alert(t.unexpectedCheckoutError);
        } finally {
            setIsPaying(false);
        }
    };

    const cartOrders = orders.filter(o => o.status === "pending");
    const rawHistoryOrders = orders.filter(o => o.status !== "pending");
    const groupedHistory = rawHistoryOrders.reduce((acc: any[], order) => {
        const dateKey = new Date(order.created_at).toISOString().slice(0, 16);
        const existingGroup = acc.find(g => g.dateKey === dateKey && g.status === order.status);
        if (existingGroup) {
            existingGroup.items.push(order);
            existingGroup.totalPrice += Number(order.price) || 0;
        } else {
            acc.push({
                id: order.id,
                dateKey,
                created_at: order.created_at,
                status: order.status,
                currency: order.currency || "RON",
                totalPrice: Number(order.price) || 0,
                items: [order],
            });
        }
        return acc;
    }, []);
    const convertOrderPrice = (price: number, itemCurrency: string, targetCurrency: string) => {
        if (!rates) return price;
        const srcCurr = (itemCurrency || "RON").toUpperCase();
        const tgtCurr = targetCurrency.toUpperCase();

        if (srcCurr === tgtCurr) return price;

        const srcRateToEur = rates[srcCurr] || 1.0;
        const tgtRateFromEur = rates[tgtCurr] || 1.0;

        const priceInEur = price / srcRateToEur;
        return priceInEur * tgtRateFromEur;
    };

    const total = cartOrders.reduce((sum, order) => {
        return sum + convertOrderPrice(Number(order.price), order.currency || "RON", displayCurrency);
    }, 0);

    if (loading) return <div className="min-h-screen pt-32 text-center text-slate-500 font-medium animate-pulse">{t.loadingData}</div>;

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-6 relative">

            {/* =========================================
                MODAL DE PLATĂ (POP-UP)
            ========================================= */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        {/* Buton Închidere */}
                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <h3 className="text-xl font-black text-slate-900 mb-1">{t.choosePayment}</h3>
                        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl mb-6 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">{t.totalToPay}</span>
                            <span className="text-lg font-black text-slate-900">
                                {rates ? total.toFixed(2) : "..."} <span className="text-blue-600 text-xs font-black">{displayCurrency}</span> </span>
                        </div>

                        <div className="space-y-3">
                            {/* Apple Pay */}
                            <button
                                onClick={() => handleCheckoutPay('apple_pay')}
                                className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-md active:scale-95"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.3 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.3zM250.8 131.1c16.9-20.8 31.6-53.7 28-87.7-28 1.2-61.6 19.3-79.3 39.6-15.6 18.2-32.3 51.5-28.5 85.3 31.5 2.5 62.8-16.4 79.8-37.2z"/></svg>
                                Apple Pay
                            </button>

                            {/* Google Pay */}
                            <button
                                onClick={() => handleCheckoutPay('google_pay')}
                                className="w-full bg-white border border-slate-200 text-slate-800 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M43.611 20.083H42V20H24V28H35.303C33.656 32.613 29.312 36 24 36C17.373 36 12 30.627 12 24C12 17.373 17.373 12 24 12C27.059 12 29.842 13.154 31.961 15.039L37.628 9.372C34.108 6.223 29.336 4 24 4C12.955 4 4 12.955 4 24C4 35.045 12.955 44 24 44C35.045 44 44 35.045 44 24C44 22.659 43.862 21.35 43.611 20.083Z" fill="#FFC107"/>
                                    <path d="M43.611 20.083H42V20H24V28H35.303C34.463 30.364 32.748 32.366 30.569 33.707L37.897 39.387C38.384 39.02 44 34.5 44 24C44 22.659 43.862 21.35 43.611 20.083Z" fill="#FF3D00"/>
                                    <path d="M24 44C29.336 44 34.108 42.148 37.897 39.387L30.569 33.707C28.665 34.975 26.438 36 24 36C18.688 36 14.344 32.613 12.697 28L5.275 33.743C8.948 40.89 15.938 44 24 44Z" fill="#4CAF50"/>
                                    <path d="M24 12C27.059 12 29.842 13.154 31.961 15.039L37.628 9.372C34.108 6.223 29.336 4 24 4C15.938 4 8.948 7.11 5.275 14.257L12.697 20C14.344 15.387 18.688 12 24 12Z" fill="#1976D2"/>
                                </svg>
                                Google Pay
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-3 py-2">
                                <div className="h-px bg-slate-100 flex-1"></div>
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{t.or}</span>
                                <div className="h-px bg-slate-100 flex-1"></div>
                            </div>

                            {/* Card Bancar */}
                            <button
                                onClick={() => handleCheckoutPay('card_stripe')}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/30 active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                {t.cardStripe}
                            </button>

                            {/* NeoPay (Viitor) */}
                            <button
                                onClick={() => handleCheckoutPay('neopay')}
                                className="w-full border-2 border-slate-100 text-slate-400 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                            >
                                {t.neoPaySoon}
                            </button>
                        </div>

                        <p className="text-center text-[10px] font-semibold text-slate-400 mt-6 flex items-center justify-center gap-1 uppercase tracking-widest">
                            <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            {t.securedTransaction}</p>
                    </div>
                </div>
            )}
            {/* ========================================= */}

            <div className="max-w-4xl mx-auto">
                {/* HEAD & TAB-URI */}
                <div className="flex flex-col items-center mb-10">
                    <h1 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">{t.cartTitle}</h1>

                    <div className="flex bg-slate-200/50 p-1.5 rounded-xl border border-slate-200 shadow-inner">
                        <button
                            onClick={() => handleTabChange("cart")}
                            className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${
                                activeTab === "cart"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            {t.myCart} ({cartOrders.length})
                        </button>
                        <button
                            onClick={() => handleTabChange("history")}
                            className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${
                                activeTab === "history"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            {t.orderHistory} ({groupedHistory.length})
                        </button>
                    </div>
                </div>
                <div className={`transition-opacity duration-150 ${fadeState === "in" ? "opacity-100" : "opacity-0"}`}>

                    {/* TAB: COȘUL MEU */}
                    {activeTab === "cart" && (
                        <div>
                            {cartOrders.length === 0 ? (
                                <div className="bg-white p-16 rounded-3xl border border-slate-200 text-center shadow-sm">
                                    <p className="text-slate-500 mb-6 font-medium text-lg">{t.emptyCart}</p>
                                    <Link href="/#configurator" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                                        {t.configurePlisse}
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="md:col-span-2 space-y-4">
                                        {cartOrders.map(order => (
                                            <div key={order.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center group hover:shadow-md transition-all duration-300">
                                                <div>
                                                    <h3 className="font-bold text-slate-800 text-lg">{order.plisse_type}</h3>
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        {t.dimensions} <span className="font-semibold text-slate-700">{order.width} x {order.height} mm</span>
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        {t.finish} <span className="font-semibold text-slate-700">{order.frame_color}</span>
                                                    </p>
                                                </div>
                                                {(() => {
                                                    const itemCurr = (order.currency || "RON").toUpperCase();
                                                    const convertedItemPrice = convertOrderPrice(Number(order.price), itemCurr, displayCurrency);
                                                    const showConverted = itemCurr !== displayCurrency && rates;

                                                    return (
                                                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                                                            <div className="text-left sm:text-right">
                                                                <div className="font-black text-2xl text-slate-900 leading-tight">
                                                                    {Number(order.price).toFixed(2)} <span className="text-xs text-slate-400 font-bold">{itemCurr}</span>
                                                                </div>
                                                                {showConverted && (
                                                                    <div className="text-[11px] font-bold text-blue-600 mt-0.5">
                                                                        ≈ {convertedItemPrice.toFixed(2)} {displayCurrency}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <button
                                                                onClick={() => handleDelete(order.id)}
                                                                disabled={processingId === order.id || isPaying}
                                                                className="text-red-500 hover:text-red-700 text-xs uppercase tracking-widest font-black disabled:opacity-50 transition-colors bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl"
                                                            >
                                                                {processingId === order.id ? '...' : t.delete}
                                                            </button>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit sticky top-24">
                                        <h3 className="font-black text-sm uppercase tracking-widest mb-4 border-b border-slate-100 pb-4 text-slate-400">{t.orderSummary}</h3>
                                        {/* Header & Total Price */}
                                        <div className="flex justify-between items-baseline mb-6 border-b border-slate-100 pb-4">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.totalLabel}</span>
                                            <div className="text-right">
        <span className="text-3xl font-black text-slate-900 tracking-tight">
            {rates ? total.toFixed(2) : "..."}
        </span>
                                                <span className="text-lg font-black text-blue-600 ml-1.5">{displayCurrency}</span>
                                            </div>
                                        </div>
                                        <div className="mb-6 space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                                                {t.displayCurrency}
                                            </label>
                                            <div className="grid grid-cols-3 gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
                                                {(["MDL", "RON", "EUR"] as const).map((curr) => (
                                                    <button
                                                        key={curr}
                                                        type="button"
                                                        onClick={() => setDisplayCurrency(curr)}
                                                        className={`py-2 rounded-xl text-xs font-black transition-all duration-200 ${
                                                            displayCurrency === curr
                                                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]"
                                                                : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                                                        }`}
                                                    >
                                                        {curr}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* BUTON UNIC CARE DESCHIDE POP-UP-UL DE PLATĂ */}
                                        <button
                                            onClick={() => setShowPaymentModal(true)}
                                            disabled={isPaying}
                                            className="relative w-full bg-blue-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs overflow-hidden group shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95">
                                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />

                                            <span className="relative flex items-center justify-center gap-2">
                                                {isPaying ? (
                                                    t.waitingBank
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                                        {t.paySecured}
                                                    </>
                                                )}
                                            </span>
                                        </button>

                                        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            {t.partnerProcessors}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: ISTORIC COMENZI*/}
                    {activeTab === "history" && (
                        <div>
                            {groupedHistory.length === 0 ? (
                                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
                                    <p className="text-slate-500 font-medium">{t.emptyHistory}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {groupedHistory.map(group => (
                                        <div key={group.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-300 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 flex-shrink-0 mt-1">
                                                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-slate-800 text-base">
                                                            {t.orderWord} ({group.items.length} {group.items.length === 1 ? t.itemWordSingular : t.itemWordPlural})
                                                        </h3>
                                                    </div>
                                                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                                                        {t.addedOn} {new Date(group.created_at).toLocaleString("ro-RO", { dateStyle: "medium", timeStyle: "short" })}
                                                    </p>
                                                    <div className="mt-2 space-y-0.5">
                                                        {group.items.map((item: any) => (
                                                            <p key={item.id} className="text-xs text-slate-500">
                                                                • {item.plisse_type} ({item.width}x{item.height} mm) — <strong className="text-slate-700">{Number(item.price).toFixed(2)} {item.currency || group.currency}</strong>
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                                                <div className="text-right">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.totalLabel}</span>
                                                    <span className="block font-black text-xl text-slate-900">
                                                        {group.totalPrice.toFixed(2)} {group.currency}
                                                    </span>
                                                </div>
                                                <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                                    group.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                                                        group.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                            'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {group.status === 'processing' ? t.inProcessing : group.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}