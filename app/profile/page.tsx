"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase/client"; // Folosim instanța corectă!
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.replace("/auth/login");
                return;
            }

            setUserProfile(session.user);

            // Aducem istoricul de comenzi (tot ce nu e în coș)
            const { data, error } = await supabase
                .from("orders")
                .select("*")
                .eq("user_id", session.user.id)
                .neq("status", "pending")
                .order("created_at", { ascending: false });

            if (!error) setOrders(data || []);
            setLoading(false);
        };

        fetchData();
    }, [router]);

    // AI Spirit ✨ - Calculăm statistici inteligente din istoric
    const aiInsights = useMemo(() => {
        if (orders.length === 0) return null;

        const totalMp = orders.reduce((sum, o) => sum + ((o.width * o.height) / 1_000_000), 0);
        const bugsBlocked = Math.round(totalMp * 4200).toLocaleString('ro-RO'); // Aproximare amuzantă

        return {
            mp: totalMp.toFixed(2),
            bugs: bugsBlocked
        };
    }, [orders]);

    if (loading) return <div className="min-h-screen pt-32 text-center text-slate-400 font-medium animate-pulse">Se încarcă profilul tău...</div>;

    const displayName = userProfile?.user_metadata?.nickname || userProfile?.email?.split('@')[0] || "Utilizator";

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Antet Profil */}
                <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 shadow-xl shadow-blue-500/30 flex items-center justify-center text-white text-4xl font-black uppercase">
                        {displayName[0]}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Salut, {displayName}!</h1>
                        <p className="text-slate-500 mt-1">{userProfile?.email}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-widest">
                                Cont Activ
                            </span>
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase tracking-widest">
                                Client iPlisse
                            </span>
                        </div>
                    </div>
                </div>

                {/* AI Insights Widget ✨ */}
                {aiInsights && (
                    <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-500 opacity-20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10 flex items-start gap-5">
                            <div className="text-3xl">🤖</div>
                            <div>
                                <h3 className="text-blue-300 font-black text-xs uppercase tracking-widest mb-2">iPlisse AI Insights</h3>
                                <p className="text-slate-200 text-sm leading-relaxed">
                                    Analizând istoricul tău, ai securizat un total de <strong className="text-white">{aiInsights.mp} m²</strong> de deschideri.
                                    Asta înseamnă că vara aceasta vei ține la distanță aproximativ <strong className="text-sky-300">{aiInsights.bugs} de insecte</strong>! Un mediu perfect curat pentru casa ta. 🛡️🦟
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Istoric Comenzi */}
                <div>
                    <h2 className="text-xl font-black text-slate-900 mb-6 px-2">Istoric Comenzi</h2>

                    {orders.length === 0 ? (
                        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            </div>
                            <h3 className="font-bold text-slate-700 mb-2">Nicio comandă finalizată</h3>
                            <p className="text-slate-500 mb-6 text-sm">Când vei finaliza o comandă din coș, aceasta va apărea aici.</p>
                            <Link href="/cart" className="text-blue-600 font-bold hover:text-blue-700 transition-colors text-sm uppercase tracking-widest">
                                Mergi la Coșul Meu &rarr;
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {orders.map(order => (
                                <div key={order.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                                                {new Date(order.created_at).toLocaleDateString("ro-RO")}
                                            </span>
                                            <p className="font-black text-slate-800 text-lg">{order.plisse_type}</p>
                                        </div>
                                        <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${
                                            order.status === 'processing' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                order.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                    'bg-slate-100 text-slate-600 border border-slate-200'
                                        }`}>
                                            {order.status === 'processing' ? 'În Lucru' : order.status}
                                        </span>
                                    </div>

                                    <div className="space-y-1 mb-6 border-t border-slate-50 pt-4">
                                        <p className="text-xs text-slate-500 flex justify-between">
                                            <span>Dimensiuni:</span>
                                            <span className="font-bold text-slate-700">{order.width} x {order.height} mm</span>
                                        </p>
                                        <p className="text-xs text-slate-500 flex justify-between">
                                            <span>Finisaj:</span>
                                            <span className="font-bold text-slate-700">{order.frame_color}</span>
                                        </p>
                                        <p className="text-xs text-slate-500 flex justify-between">
                                            <span>ID:</span>
                                            <span className="font-mono text-slate-400">{order.id.split('-')[0]}</span>
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center group-hover:bg-blue-50/50 transition-colors">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Achitat</span>
                                        <span className="font-black text-xl text-slate-900">{order.price} <span className="text-xs text-slate-500">RON</span></span>
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