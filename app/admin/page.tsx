"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

export default function AdminPage() {
    const { t, lang } = useLanguage();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Stări Admin pentru ambele valute (RON și MDL raportate la 1 EUR)
    const [rates, setRates] = useState({
        ron: "5.0",
        mdl: "19.5"
    });
    const [isSavingRate, setIsSavingRate] = useState(false);
    const [allOrders, setAllOrders] = useState<any[]>([]);
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

    useEffect(() => {
        checkAdminAccess();
        fetchCurrentRate();
    }, []);

    // Verificare Securitate - Doar Adminii au voie aici
    const checkAdminAccess = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            router.replace("/");
            return;
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single<{ role: string }>();

        if (profile?.role !== "admin") {
            router.replace("/");
            return;
        }

        setIsAdmin(true);
        fetchAllOrders();
        setLoading(false);
    };

    const fetchCurrentRate = async () => {
        const { data } = await supabase
            .from("app_settings")
            .select("key, value");

        if (data) {
            // Forțăm tipul explicit pe obiectele din array ca să nu mai existe erori de linter
            const items = data as unknown as { key: string; value: number }[];

            const ronVal = items.find(i => i.key === "exchange_rate_eur_ron")?.value;
            const mdlVal = items.find(i => i.key === "exchange_rate_eur_mdl")?.value;

            setRates({
                ron: ronVal !== undefined ? ronVal.toString() : "5.0",
                mdl: mdlVal !== undefined ? mdlVal.toString() : "19.5"
            });
        }
    };

    // 2. Salvarea manuală a cursurilor
    const handleSaveRates = async () => {
        setIsSavingRate(true);
        const { error } = await supabase.from("app_settings").upsert([
            { key: "exchange_rate_eur_ron", value: Number(rates.ron) },
            { key: "exchange_rate_eur_mdl", value: Number(rates.mdl) }
        ]);

        if (!error) {
            alert("Cursele valutare au fost salvate cu succes!");
        } else {
            alert("Eroare la salvarea cursurilor.");
        }
        setIsSavingRate(false);
    };

    // 3. Auto-Sincronizare Curs Live de la API
    const handleSyncLiveRates = async () => {
        try {
            setIsSavingRate(true);
            const res = await fetch("https://api.frankfurter.app/latest?from=EUR&to=RON,MDL");
            const data = await res.json();

            if (data?.rates) {
                const newRon = data.rates.RON ? data.rates.RON.toFixed(2) : rates.ron;
                const newMdl = data.rates.MDL ? data.rates.MDL.toFixed(2) : rates.mdl;

                setRates({ ron: newRon, mdl: newMdl });

                await supabase.from("app_settings").upsert([
                    { key: "exchange_rate_eur_ron", value: Number(newRon) },
                    { key: "exchange_rate_eur_mdl", value: Number(newMdl) }
                ]);

                alert(`Cursuri sincronizate live! RON: ${newRon}, MDL: ${newMdl}`);
            }
        } catch {
            alert("Eroare la preluarea cursului live.");
        } finally {
            setIsSavingRate(false);
        }
    };

    // Aducem toate comenzile clienților
    const fetchAllOrders = async () => {
        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setAllOrders(data);
        }
    };

    // Schimbăm statusul unei comenzi (ex: pending -> processing -> completed)
    const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
        setUpdatingOrderId(orderId);
        const { error } = await supabase
            .from("orders")
            .update({ status: newStatus })
            .eq("id", orderId);

        if (!error) {
            setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } else {
            alert("Eroare la schimarea statusului.");
        }
        setUpdatingOrderId(null);
    };

    if (loading || !isAdmin) return <div className="min-h-screen pt-32 text-center text-slate-500 font-medium animate-pulse">{t.adminCheckingAccess}</div>;

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-6">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header Admin */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        {t.adminPanelTitle} <span className="text-blue-600">Admin</span>
                    </h1>
                    <button
                        onClick={() => router.push("/")}
                        className="text-sm font-bold text-slate-600 hover:text-slate-900 bg-white px-5 py-2.5 rounded-xl shadow-sm border border-slate-200 transition-all hover:bg-slate-100"
                    >
                        {t.backToSite}
                    </button>
                </div>

                {/* Grid 2 Coloane: Curs Valutar + Moderare Recenzii */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* WIDGET CURS VALUTAR DUBLU (RON + MDL) */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h2 className="text-xl font-black text-slate-800">{t.exchangeRateTitle}</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">1 EUR = ? RON</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={rates.ron}
                                    onChange={(e) => setRates({ ...rates, ron: e.target.value })}
                                    className="w-full border-2 border-slate-200 rounded-xl p-3 font-black text-lg focus:border-blue-600 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">1 EUR = ? MDL</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={rates.mdl}
                                    onChange={(e) => setRates({ ...rates, mdl: e.target.value })}
                                    className="w-full border-2 border-slate-200 rounded-xl p-3 font-black text-lg focus:border-blue-600 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleSaveRates}
                                disabled={isSavingRate}
                                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 shadow-md shadow-blue-500/20"
                            >
                                {isSavingRate ? "..." : t.save}
                            </button>
                            <button
                                onClick={handleSyncLiveRates}
                                disabled={isSavingRate}
                                className="bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-bold hover:bg-slate-200 transition border border-slate-200 text-xs uppercase tracking-wider"
                            >
                                ⚡ Auto-Sync Live
                            </button>
                        </div>
                    </div>

                    {/* WIDGET PLACEHOLDER: MODERARE RECENZII */}
                    <div className="bg-white/60 p-8 rounded-3xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </div>
                        <h3 className="font-bold text-slate-700 mb-1">{t.reviewModerationTitle}</h3>
                        <p className="text-xs text-slate-400 max-w-xs">{t.reviewModerationNote}</p>
                    </div>

                </div>

                {/* MANAGEMENT COMENZI */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                        <h2 className="text-xl font-black text-slate-900">{t.ordersManagementTitle} ({allOrders.length})</h2>
                        <button onClick={fetchAllOrders} className="text-xs font-bold text-blue-600 hover:text-blue-700">Actualizează</button>
                    </div>

                    {allOrders.length === 0 ? (
                        <p className="text-slate-400 text-center py-8 text-sm">{t.noOrdersAdmin}</p>
                    ) : (
                        <div className="space-y-4">
                            {allOrders.map(order => (
                                <div key={order.id} className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-slate-400">#{order.id.toString().slice(0, 8)}</span>
                                            <span className="text-xs font-bold text-slate-500">
                                                {new Date(order.created_at).toLocaleDateString(lang === "RU" ? "ru-RU" : "ro-RO")}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-slate-800">{order.plisse_type}</h4>
                                        <p className="text-xs text-slate-500">
                                            {t.dimensions}: <strong className="text-slate-700">{order.width} x {order.height} mm</strong> | {t.finish}: <strong className="text-slate-700">{order.frame_color}</strong>
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-200/60 pt-3 md:pt-0">
                                        <span className="font-black text-slate-900 text-lg">{order.price} RON</span>

                                        {/* Selector Status Comandă */}
                                        <select
                                            value={order.status}
                                            disabled={updatingOrderId === order.id}
                                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                            className={`text-xs font-bold px-3 py-2 rounded-xl border outline-none cursor-pointer ${
                                                order.status === 'pending' ? 'bg-slate-100 border-slate-200 text-slate-600' :
                                                    order.status === 'processing' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                                        'bg-green-50 border-green-200 text-green-700'
                                            }`}
                                        >
                                            <option value="pending">În Coș (Pending)</option>
                                            <option value="processing">În Procesare (Paid)</option>
                                            <option value="completed">Finalizată (Completed)</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}