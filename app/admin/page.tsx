"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Stări Admin
    const [exchangeRate, setExchangeRate] = useState<string>("5.0");
    const [isSavingRate, setIsSavingRate] = useState(false);

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

        // Verificăm rolul în tabelul profiles
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

        if (profile?.role !== "admin") {
            // Dacă e doar client, îl trimitem pe homepage
            router.replace("/");
            return;
        }

        setIsAdmin(true);
        setLoading(false);
    };

    // Aducem cursul actual din app_settings
    const fetchCurrentRate = async () => {
        const { data } = await supabase
            .from("app_settings")
            .select("value")
            .eq("key", "exchange_rate_eur_ron")
            .single();

        if (data) setExchangeRate(data.value.toString());
    };

    // Salvăm noul curs valutar
    const handleSaveRate = async () => {
        setIsSavingRate(true);
        const { error } = await supabase
            .from("app_settings")
            .update({ value: Number(exchangeRate) })
            .eq("key", "exchange_rate_eur_ron");

        if (!error) {
            alert("Curs valutar actualizat cu succes!");
        } else {
            alert("Eroare la actualizarea cursului.");
        }
        setIsSavingRate(false);
    };

    if (loading || !isAdmin) return <div className="min-h-screen pt-32 text-center text-slate-500">Se verifică accesul...</div>;

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Panou Control <span className="text-blue-600">Admin</span></h1>
                    <button onClick={() => router.push("/")} className="text-sm font-bold text-slate-500 hover:text-slate-800 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                        Înapoi la Site
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* WIDGET CURS VALUTAR */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h2 className="text-xl font-black text-slate-800">Setare Curs Valutar</h2>
                        </div>

                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">1 EUR = ? RON</label>
                        <div className="flex gap-4">
                            <input
                                type="number"
                                step="0.01"
                                value={exchangeRate}
                                onChange={(e) => setExchangeRate(e.target.value)}
                                className="flex-1 border-2 border-slate-200 rounded-xl p-3 font-black text-lg focus:border-blue-600 outline-none"
                            />
                            <button
                                onClick={handleSaveRate}
                                disabled={isSavingRate}
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {isSavingRate ? "..." : "Salvează"}
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-4">Acest curs va fi folosit instant pe site pentru calculul prețului plasei în coș.</p>
                    </div>

                    {/* WIDGET PLACEHOLDER: MODERARE RECENZII */}
                    <div className="bg-slate-100 p-8 rounded-3xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-center">
                        <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <h3 className="font-bold text-slate-400 mb-1">Aprobare Recenzii</h3>
                        <p className="text-sm text-slate-400">Modulul de moderare recenzii va fi implementat aici.</p>
                    </div>

                </div>
            </div>
        </div>
    );
}