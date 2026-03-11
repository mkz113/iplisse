"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import Configurator from "./components/Configurator";

export default function Home() {
    // 1. Inițializăm starea DIRECT din localStorage pentru zero latență
    const [user, setUser] = useState<any>(() => {
        if (typeof window !== "undefined") {
            const localSession = localStorage.getItem("sb-xvmfszcrqrkxsiyyqjwf-auth-token");
            if (localSession) {
                try {
                    return JSON.parse(localSession).user;
                } catch (e) {
                    return null;
                }
            }
        }
        return null;
    });

    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);

        // 2. Validăm "în culise" cu Supabase pentru a ne asigura că tokenul nu a expirat
        supabase.auth.getSession().then(({ data: { session } }) => {
            // Actualizăm starea doar dacă e o diferență, pentru a evita re-randări inutile
            if (session?.user?.id !== user?.id) {
                setUser(session?.user || null);
            }
        });

        // 3. Ascultăm orice schimbare viitoare (ex: dă logout din alt tab)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, [user?.id]); // Am adăugat user?.id în dependențe

    if (!isHydrated) return null;

    return (
        <div className="flex flex-col w-full bg-[#fdfdfd]">
            {/* HERO SECTION */}
            <section className="relative w-full pt-32 pb-20 px-6 flex flex-col items-center">
                <div className="max-w-4xl text-center z-10">
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-8">
                        Protecție Plisse <br/>
                        <span className="text-blue-600 drop-shadow-sm">Fără Compromis.</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Sistemele iPlisse combină ingineria de precizie cu estetica minimalistă. Calculează oferta personalizată în mai puțin de 60 de secunde.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mt-20">
                    {[
                        { t: "Orizontal", d: "Uși de balcon & terase", p: "Operare facilă", c: "Prag necesar" },
                        { t: "Vertical", d: "Ferestre standard", p: "Discreție maximă", c: "Limită înălțime" },
                        { t: "XL Dublu", d: "Deschideri mari (6m+)", p: "Acoperire uriașă", c: "Preț Premium" }
                    ].map((item, i) => (
                        <div key={i} className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group">
                            <span className="text-blue-600 font-black text-sm mb-4 block opacity-40 group-hover:opacity-100">0{i+1}</span>
                            <h3 className="text-xl font-bold mb-2 text-slate-800">{item.t}</h3>
                            <p className="text-sm text-slate-400 mb-6">{item.d}</p>
                            <div className="pt-4 border-t border-slate-50 space-y-1">
                                <p className="text-[10px] font-bold text-green-600 uppercase">✓ {item.p}</p>
                                <p className="text-[10px] font-bold text-red-400 uppercase">× {item.c}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* WHY BUY SECTION (Dark UI) */}
            <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                    <div className="relative z-10">
                        <h2 className="text-4xl font-black mb-8 leading-tight italic">De ce iPlisse?</h2>
                        <div className="space-y-8">
                            {[
                                { t: "Mesh Durabil", d: "Fibră de sticlă tratată UV care nu se deșiră." },
                                { t: "Profile RAL", d: "Vopsire electrostatică în orice nuanță dorită." },
                                { t: "Silent Glide", d: "Tehnologie de culisare fără zgomot sau frecare." }
                            ].map((f, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="h-6 w-6 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-lg">{f.t}</h4>
                                        <p className="text-slate-400 text-sm">{f.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-10 bg-blue-500/20 blur-[100px] rounded-full" />
                        <div className="relative border border-white/10 bg-white/5 p-10 rounded-3xl backdrop-blur-md">
                            <p className="text-xl text-slate-300 font-medium leading-relaxed italic">
                                "Sistemele lor au schimbat complet modul în care percepem plasele de insecte. Sunt aproape invizibile, dar extrem de robuste."
                            </p>
                            <span className="block mt-6 font-bold text-white">— Arh. Radu Ionescu</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CONFIGURATOR SECTION */}
            <section id="configurator" className="py-32 px-6 flex flex-col items-center">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Configurator Inteligent</h2>
                    <p className="text-slate-400">Alege dimensiunile și finisajele pentru a vedea prețul instant.</p>
                </div>
                <Configurator user={user} />
            </section>
        </div>
    );
}