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
                        Plase iPlisse <br/>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">
                        <span className="text-blue-600 font-bold">Direct la tine acasă:</span>   Măsori singur, instalezi în <span className="text-blue-600 font-bold">5 minute</span> și economisești <span className="text-blue-600 font-bold">inteligent</span>!
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

            <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
                {/* Background decorations */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-indigo-600/10 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-6xl mx-auto px-6 relative">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <div className="inline-block bg-blue-500/20 text-blue-300 px-5 py-2 rounded-full text-sm font-bold mb-4 border border-blue-400/20">
                            ✨ De ce să alegi plasele Plisse?
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black leading-tight">
                            Calitate Premium <br/>
                            <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                    în 3 Pași Simpli
                </span>
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto mt-4 text-lg leading-relaxed">
                            Calitate superioara de aluminiu premium , plasa de fibra si sistem de fibra de nylon
                            Plasele Plisse sunt moderne, elegant , ocupa spatiu minim si sunt extrem de fiabile , iar acum sistemul nostru inteligent de comanda le poti avea intr-un timp record                        </p>
                    </div>

                    {/* 3 Steps Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connector lines */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500/30 via-blue-400/50 to-blue-500/30 -translate-y-1/2"></div>

                        {[
                            {
                                step: "01",
                                title: "Fără Meșteri",
                                desc: "Instalezi singur în 5 minute. Economisești costurile de montaj.",
                                icon: "🔧",
                                color: "from-blue-500 to-blue-400",
                                tag: "Instalare rapidă"
                            },
                            {
                                step: "02",
                                title: "Fără Costuri Ascunse",
                                desc: "Plătești exact ce vezi în calculator. Preț transparent, fără surprize.",
                                icon: "💎",
                                color: "from-indigo-500 to-indigo-400",
                                tag: "Preț transparent"
                            },
                            {
                                step: "03",
                                title: "Livrare în maxim 3 Zile",
                                desc: "Comanzi online, livrăm la ușă în maximum 3 zile lucrătoare.",
                                icon: "🚚",
                                color: "from-purple-500 to-purple-400",
                                tag: "Livrare rapidă"
                            }
                        ].map((item, i) => (
                            <div key={i} className="relative group">
                                <div className="relative bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 group-hover:border-blue-400/50 transition-all hover:shadow-xl hover:-translate-y-1 hover:bg-white/10">
                                    <div className={`absolute -top-4 -left-4 w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg`}>
                                        {item.step}
                                    </div>
                                    <div className="pt-4">
                                        <div className="text-5xl mb-4">{item.icon}</div>
                                        <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed mb-5">{item.desc}</p>
                                        <div className="inline-block bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-400/20">
                                            {item.tag}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Info Section */}
                    <div className="mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Column 1 - Features */}
                            <div className="space-y-3">
                                <h4 className="font-bold text-blue-300 text-sm uppercase tracking-wider">Caracteristici Premium</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-400">✓</span>
                                        <span className="text-sm text-slate-300">Profil aluminiu premium</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-400">✓</span>
                                        <span className="text-sm text-slate-300">Plasă din fibră de sticlă</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-400">✓</span>
                                        <span className="text-sm text-slate-300">Sistem pe fire de nylon</span>
                                    </div>
                                </div>
                            </div>

                            {/* Column 2 - Benefits */}
                            <div className="space-y-3">
                                <h4 className="font-bold text-blue-300 text-sm uppercase tracking-wider">Beneficii</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span>
                                        <span className="text-sm text-slate-300">Fără meșteri necesari</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span>
                                        <span className="text-sm text-slate-300">Fără costuri ascunse</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span>
                                        <span className="text-sm text-slate-300">Livrare în 3 zile</span>
                                    </div>
                                </div>
                            </div>

                            {/* Column 3 - CTA */}
                            <div className="flex flex-col items-start md:items-end justify-center gap-3">
                                <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-medium border border-yellow-400/20">
                            ⭐ 4.9/5
                        </span>
                                    <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-medium border border-blue-400/20">
                            👥 500+
                        </span>
                                    <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-medium border border-green-400/20">
                            🛡️ 5 ani
                        </span>
                                </div>
                                <a href="#configurator" className="group px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 w-full md:w-auto justify-center">
                                    <span>Comandă Acum</span>
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </a>
                                <span className="text-xs text-slate-400">Kit instalare gratuit inclus</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-white/10 my-4"></div>

                        {/* Bottom Text */}
                        <p className="text-center text-sm text-slate-400 leading-relaxed">
                            <span className="font-semibold text-blue-300">Sistem inteligent de comandă</span>
                            <span className="mx-2">•</span>
                            Le poți avea într-un <span className="font-semibold text-blue-400">timp record</span>
                            <span className="mx-2">•</span>
                            Calitate superioară garantată
                        </p>
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