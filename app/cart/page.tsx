"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CartPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"cart" | "history">("cart");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            router.replace("/auth/login");
            return;
        }

        // Aducem TOATE comenzile utilizatorului (și din coș, și din istoric)
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

        // Fix pentru tipul de date: ne asigurăm că ID-ul e trimis corect către backend
        const { error } = await supabase.from("orders").delete().eq("id", id);

        if (!error) {
            setOrders(prev => prev.filter(o => o.id !== id));
        } else {
            console.error("Eroare la ștergere:", error);
            alert("Eroare la ștergerea produsului.");
        }
        setProcessingId(null);
    };

    const handleCheckout = async () => {
        const pendingOrders = orders.filter(o => o.status === 'pending');
        if (pendingOrders.length === 0) return;

        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        // Trecem toate comenzile 'pending' în 'processing'
        const { error } = await supabase
            .from("orders")
            .update({ status: 'processing' })
            .eq("user_id", session?.user?.id)
            .eq("status", "pending");

        if (!error) {
            await fetchOrders(); // Reîncărcăm datele
            setActiveTab("history"); // Comutăm automat pe tab-ul de istoric
        } else {
            alert("Eroare la procesarea comenzii.");
            setLoading(false);
        }
    };

    // Separăm comenzile pentru cele două tab-uri
    const cartOrders = orders.filter(o => o.status === "pending");
    const historyOrders = orders.filter(o => o.status !== "pending");
    const total = cartOrders.reduce((sum, order) => sum + Number(order.price), 0);

    if (loading) return <div className="min-h-screen pt-32 text-center text-slate-500 font-medium animate-pulse">Se încarcă datele...</div>;

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-6">
            <div className="max-w-4xl mx-auto">

                {/* HEAD & TAB-URI */}
                <div className="flex flex-col items-center mb-10">
                    <h1 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Panou Comenzi</h1>

                    <div className="flex bg-slate-200/50 p-1.5 rounded-xl border border-slate-200 shadow-inner">
                        <button
                            onClick={() => setActiveTab("cart")}
                            className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${
                                activeTab === "cart"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            Coșul Meu ({cartOrders.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${
                                activeTab === "history"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            Istoric Comenzi ({historyOrders.length})
                        </button>
                    </div>
                </div>

                {/* TAB: COȘUL MEU */}
                {activeTab === "cart" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {cartOrders.length === 0 ? (
                            <div className="bg-white p-16 rounded-3xl border border-slate-200 text-center shadow-sm">
                                <p className="text-slate-500 mb-6 font-medium text-lg">Coșul tău este momentan gol.</p>
                                <Link href="/#configurator" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                                    Configurează un Plisse
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-2 space-y-4">
                                    {cartOrders.map(order => (
                                        <div key={order.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center group hover:border-blue-200 transition-all">
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-lg">{order.plisse_type}</h3>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    Dimensiuni: <span className="font-semibold text-slate-700">{order.width} x {order.height} mm</span>
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    Finisaj: <span className="font-semibold text-slate-700">{order.frame_color}</span>
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                                                <span className="font-black text-2xl text-slate-900">{order.price} <span className="text-sm text-slate-400">RON</span></span>
                                                <button
                                                    onClick={() => handleDelete(order.id)}
                                                    disabled={processingId === order.id}
                                                    className="text-red-500 hover:text-red-700 text-xs uppercase tracking-widest font-black disabled:opacity-50 transition-colors bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl"
                                                >
                                                    {processingId === order.id ? '...' : 'Șterge'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit sticky top-24">
                                    <h3 className="font-black text-sm uppercase tracking-widest mb-4 border-b border-slate-100 pb-4 text-slate-400">Sumar Comandă</h3>
                                    <div className="flex justify-between items-end mb-8">
                                        <span className="text-slate-500 font-medium">Total Platit:</span>
                                        <span className="text-3xl font-black text-slate-900 leading-none">{total.toFixed(2)} <span className="text-lg text-blue-600">RON</span></span>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 active:scale-95"
                                    >
                                        Finalizează Comanda
                                    </button>
                                    <p className="text-center text-[10px] font-semibold text-slate-400 mt-4 uppercase tracking-widest">
                                        Plata se face la livrare/montaj
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: ISTORIC COMENZI */}
                {activeTab === "history" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {historyOrders.length === 0 ? (
                            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
                                <p className="text-slate-500 font-medium">Nu ai nicio comandă în istoric încă.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {historyOrders.map(order => (
                                    <div key={order.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                                                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800">{order.plisse_type}</h3>
                                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                                    Adăugat pe: {new Date(order.created_at).toLocaleDateString("ro-RO")}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                            <div className="text-right">
                                                <span className="block font-black text-lg text-slate-900">{order.price} RON</span>
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                                order.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                                                    order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        'bg-slate-100 text-slate-600'
                                            }`}>
                                                {order.status === 'processing' ? 'În Procesare' : order.status}
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
    );
}