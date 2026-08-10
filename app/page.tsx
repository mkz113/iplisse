"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import Configurator from "./components/Configurator";
import { useLanguage } from "@/lib/i18n";
export default function Home() {
    const { t } = useLanguage();
    const [user, setUser] = useState<any>(() => {
        if (typeof window !== "undefined") {
            const localSession = localStorage.getItem(
                "sb-xvmfszcrqrkxsiyyqjwf-auth-token"
            );
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

    // Helper to get dialog by id
    const getDialog = (id: string) =>
        typeof document !== "undefined"
            ? (document.getElementById(id) as HTMLDialogElement | null)
            : null;

    // Modal handlers
    const openMeasureModal = () => {
        getDialog("measure-dialog")?.showModal();
    };

    const closeMeasureModal = () => {
        getDialog("measure-dialog")?.close();
    };

    const openInstallModal = () => {
        getDialog("install-dialog")?.showModal();
    };

    const closeInstallModal = () => {
        getDialog("install-dialog")?.close();
    };

    useEffect(() => {
        setIsHydrated(true);

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.id !== user?.id) {
                setUser(session?.user || null);
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, [user?.id]);

    if (!isHydrated) return null;

    return (
        <div className="flex flex-col w-full bg-[#fdfdfd]">
            {/* HERO SECTION */}
            <section className="relative w-full pt-32 pb-20 px-6 flex flex-col items-center">
                <div className="max-w-4xl text-center z-10">
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-8">
                        {t.heroTitle} <br />
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">
                        <span className="text-blue-600 font-bold">{t.heroSubtitlePrefix}</span>{" "}
                        {t.heroSubtitleMeas}{" "}
                        <span className="text-blue-600 font-bold">{t.heroSubtitleTime}</span> {t.heroSubtitleAnd}{" "}
                        <span className="text-blue-600 font-bold">{t.heroSubtitleSave}</span>!
                    </p>


                    <div className="mt-8 flex flex-wrap gap-4 justify-center">
                        <button
                            onClick={openMeasureModal}
                            className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
                        >
                            {t.videoMeasureBtn}
                        </button>
                        <button
                            onClick={openInstallModal}
                            className="px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-black"
                        >
                            {t.videoInstallBtn}
                        </button>
                    </div>




                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mt-20">
                    {[
                        {
                            t: t.typeHorizontal,
                            d: t.descHorizontal,
                            p: t.proEasy,
                            c: t.conThreshold,
                        },
                        {
                            t: t.typeVertical,
                            d: t.descVertical,
                            p: t.proDiscretion,
                            c: t.conHeightLimit,
                        },
                        {
                            t: t.typeXL,
                            d: t.descXL,
                            p: t.proHugeCoverage,
                            c: t.conPremiumPrice,
                        },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group"
                        >
              <span className="text-blue-600 font-black text-sm mb-4 block opacity-40 group-hover:opacity-100">
                0{i + 1}
              </span>
                            <h3 className="text-xl font-bold mb-2 text-slate-800">
                                {item.t}
                            </h3>
                            <p className="text-sm text-slate-400 mb-6">{item.d}</p>
                            <div className="pt-4 border-t border-slate-50 space-y-1">
                                <p className="text-[10px] font-bold text-green-600 uppercase">
                                    ✓ {item.p}
                                </p>
                                <p className="text-[10px] font-bold text-red-400 uppercase">
                                    × {item.c}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* VIDEO MODALS */}
            {/* Modal - Măsurare */}
            <dialog
                id="measure-dialog"
                className="relative bg-white rounded-2xl overflow-hidden w-full max-w-4xl max-h-[80vh] shadow-2xl mx-auto my-auto">
                <div className="relative bg-white rounded-2xl overflow-hidden w-full">
                    <button
                        onClick={closeMeasureModal}
                        className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all hover:scale-110"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                    <div className="aspect-video bg-slate-900 flex items-center justify-center p-4">
                        <div className="text-center">
                            <div className="text-7xl mb-4">📹</div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                {t.measureGuideTitle}
                            </h3>
                            <p className="text-slate-400">
                                {t.measureGuideDesc}
                            </p>
                            <div className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-medium">
                                Video Player
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                        <p className="text-sm text-slate-600 text-center">
                            {t.measureGuideFooter}
                        </p>
                    </div>
                </div>
            </dialog>

            {/* Modal - Instalare */}
            <dialog
                id="install-dialog"
                className="relative bg-white rounded-2xl overflow-hidden w-full max-w-4xl max-h-[80vh] shadow-2xl mx-auto my-auto"
            >
                <div className="relative bg-white rounded-2xl overflow-hidden w-full">
                    <button
                        onClick={closeInstallModal}
                        className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all hover:scale-110"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                    <div className="aspect-video bg-slate-900 flex items-center justify-center p-4">
                        <div className="text-center">
                            <div className="text-7xl mb-4">🔧</div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                {t.installGuideTitle}
                            </h3>
                            <p className="text-slate-400">
                                {t.installGuideDesc}
                            </p>
                            <div className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-medium">
                                Video Player
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                        <p className="text-sm text-slate-600 text-center">
                            {t.installGuideFooter}
                        </p>
                    </div>
                </div>
            </dialog>

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
                            {t.whyChooseBadge}
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black leading-tight">
                            {t.qualityTitle} <br/>
                            <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                            {t.qualitySubtitle}
                </span>
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto mt-4 text-lg leading-relaxed">
                            {t.qualityDesc}</p>
                    </div>

                    {/* 3 Steps Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connector lines */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500/30 via-blue-400/50 to-blue-500/30 -translate-y-1/2"></div>

                        {[
                            {
                                step: "01",
                                title: t.step1Title,
                                desc: t.step1Desc,
                                icon: "🔧",
                                color: "from-blue-500 to-blue-400",
                                tag: t.step1Tag
                            },
                            {
                                step: "02",
                                title: t.step2Title,
                                desc: t.step2Desc,
                                icon: "💎",
                                color: "from-indigo-500 to-indigo-400",
                                tag: t.step2Tag
                            },
                            {
                                step: "03",
                                title: t.step3Title,
                                desc: t.step3Desc,
                                icon: "🚚",
                                color: "from-purple-500 to-purple-400",
                                tag: t.step3Tag
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
                                <h4 className="font-bold text-blue-300 text-sm uppercase tracking-wider">{t.featHeader}</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-400">✓</span>
                                        <span className="text-sm text-slate-300">{t.feat1}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-400">✓</span>
                                        <span className="text-sm text-slate-300">{t.feat2}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-400">✓</span>
                                        <span className="text-sm text-slate-300">{t.feat3}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Column 2 - Benefits */}
                            <div className="space-y-3">
                                <h4 className="font-bold text-blue-300 text-sm uppercase tracking-wider">{t.benHeader}</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span>
                                        <span className="text-sm text-slate-300">{t.ben1}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span>
                                        <span className="text-sm text-slate-300">{t.ben2}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span>
                                        <span className="text-sm text-slate-300">{t.ben3}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Column 3 - CTA */}
                            <div className="flex flex-col items-start md:items-end justify-center gap-3">
                                <div className="inline-flex items-center gap-2.5 bg-emerald-500/5 px-5 py-2.5 rounded-full border border-emerald-400/15">
                                    <span className="text-lg text-emerald-400">🛡️</span>
                                    <span className="text-sm text-slate-300">
                                      {t.warranty} <span className="text-emerald-400 font-semibold">{t.warrantyTime}</span>
                                     </span>
                                </div>
                                <a href="#configurator" className="group px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 w-full md:w-auto justify-center">
                                    <span>{t.orderNow}</span>
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </a>
                                <span className="text-xs text-slate-400">{t.freeKit}</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-white/10 my-4"></div>

                        {/* Bottom Text */}
                        <p className="text-center text-sm text-slate-400 leading-relaxed">
                            <span className="font-semibold text-blue-300">{t.smartOrderSystem}</span>
                            <span className="mx-2">•</span>
                            <span className="font-semibold text-blue-400">{t.recordTime}</span>
                            <span className="mx-2">•</span>
                            {t.guaranteedQuality}
                        </p>
                    </div>
                </div>
            </section>

            {/* CONFIGURATOR SECTION */}
            <section id="configurator" className="py-32 px-6 flex flex-col items-center">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">{t.configuratorTitle}</h2>
                    <p className="text-slate-400">{t.configuratorDesc}</p>
                </div>
                <Configurator user={user} />
            </section>
        </div>
    );
}