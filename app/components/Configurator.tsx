"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface ConfiguratorProps {
    user: any;
}

export default function Configurator({ user }: ConfiguratorProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    // Stări Pop-up-uri
    const [toast, setToast] = useState<{ visible: boolean; message: string; type: "success" | "error" }>({
        visible: false,
        message: "",
        type: "success"
    });
    const [showContactModal, setShowContactModal] = useState(false); // NOU: Stare pt modalul de contact

    const [unit, setUnit] = useState<"mm" | "cm" | "m">("mm");
    const [rawWidth, setRawWidth] = useState<string>("1200");
    const [rawHeight, setRawHeight] = useState<string>("1500");
    const [frameColor, setFrameColor] = useState<string>("Antracit (RAL 7016)");
    const [openLevel, setOpenLevel] = useState<number>(70);
    const [viewMode, setViewMode] = useState<"2D" | "3D">("3D");

    const [rotation, setRotation] = useState({ x: 15, y: -25 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const visualizerRef = useRef<HTMLDivElement>(null);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3000);
    };

    useEffect(() => {
        try {
            const saved = localStorage.getItem("iplisse_config");
            if (saved) {
                const p = JSON.parse(saved);
                setRawWidth(p.rawWidth || "1200");
                setRawHeight(p.rawHeight || "1500");
                setUnit(p.unit || "mm");
                setFrameColor(p.frameColor || "Antracit (RAL 7016)");
                setViewMode(p.viewMode || "3D");
            }
        } catch {
        } finally {
            setHydrated(true);
        }
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        localStorage.setItem(
            "iplisse_config",
            JSON.stringify({ rawWidth, rawHeight, unit, frameColor, viewMode })
        );
    }, [rawWidth, rawHeight, unit, frameColor, viewMode, hydrated]);

    const handleInputChange = (val: string, type: "w" | "h") => {
        const cleanVal = val.replace(/[^0-9]/g, "").replace(/^0+/, "") || "0";
        if (type === "w") setRawWidth(cleanVal);
        else setRawHeight(cleanVal);
    };

    const convertToMm = (val: string, u: string): number => {
        const n = Number(val) || 0;
        if (u === "cm") return n * 10;
        if (u === "m") return n * 1000;
        return n;
    };

    const wMm = useMemo(() => Math.round(convertToMm(rawWidth, unit)), [rawWidth, unit]);
    const hMm = useMemo(() => Math.round(convertToMm(rawHeight, unit)), [rawHeight, unit]);
    const scale = useMemo(() => Math.min(240 / Math.max(wMm, 1), 240 / Math.max(hMm, 1)), [wMm, hMm]);

    const plisseType = useMemo(() => {
        if (hMm > 2200) return "Plisse XL Orizontal";
        if (hMm < 800) return "Plisse Vertical";
        return "Plisse Orizontal";
    }, [hMm]);

    const calculatedPrice = useMemo(() => {
        if (wMm === 0 || hMm === 0) return 0;
        const areaMp = (wMm * hMm) / 1_000_000;
        const pricePerMp = 250;
        const baseFee = 50;
        return (areaMp * pricePerMp) + baseFee;
    }, [wMm, hMm]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (viewMode !== "3D") return;
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || viewMode !== "3D") return;
        const deltaX = e.clientX - dragStart.current.x;
        const deltaY = e.clientY - dragStart.current.y;
        const sensitivity = 0.4;

        setRotation(prev => ({
            x: Math.max(-60, Math.min(60, prev.x - deltaY * sensitivity)),
            y: prev.y + deltaX * sensitivity
        }));

        dragStart.current = { x: e.clientX, y: e.clientY };
    }, [isDragging, viewMode]);

    const handleMouseUp = useCallback(() => setIsDragging(false), []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove, { passive: true });
            window.addEventListener("mouseup", handleMouseUp);
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const handleAddToCart = async () => {
        if (!user) {
            router.push("/auth/login");
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const activeUserId = session?.user?.id || user?.id;

            if (!activeUserId) throw new Error("Sesiune expirată. Te rugăm să te reautentifici.");

            const { error } = await supabase
                .from("orders")
                .insert([{
                    user_id: activeUserId,
                    width: wMm,
                    height: hMm,
                    frame_color: frameColor,
                    plisse_type: plisseType,
                    price: calculatedPrice,
                    status: 'pending'
                }]);

            if (error) throw error;

            localStorage.removeItem("iplisse_config");
            showToast("Produsul a fost adăugat cu succes în coș!", "success");

            setTimeout(() => {
                router.push("/cart");
            }, 1500);

        } catch (err: any) {
            console.error("Eroare la adăugare:", err);
            showToast(err.message || "Eroare de conexiune la adăugarea în coș.", "error");
            setIsSubmitting(false);
        }
    };

    // Paleta de culori standard
    const colorMap: Record<string, string> = {
        "Antracit (RAL 7016)": "#373e47",
        "Alb (RAL 9016)": "#ffffff",
        "Maro (RAL 8017)": "#4a3028",
    };

    const frameStyle = useMemo(() => {
        const hex = colorMap[frameColor] ?? "#373e47";
        return {
            backgroundColor: hex,
            borderColor: hex === "#ffffff" ? "#e2e8f0" : "rgba(0,0,0,0.4)",
            boxShadow: viewMode === "3D"
                ? "-15px 25px 40px rgba(0,0,0,0.2), inset 0 0 20px rgba(0,0,0,0.5)"
                : "0 10px 25px rgba(0,0,0,0.1), inset 0 0 10px rgba(0,0,0,0.1)",
        };
    }, [frameColor, viewMode]);

    if (!hydrated) return null;

    return (
        <div className="bg-white border border-slate-200 shadow-2xl max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-3xl transition-all relative">

            {/* POP-UP SUCCESS/ERROR */}
            {toast.visible && (
                <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 transition-all transform animate-bounce ${
                    toast.type === "success" ? "bg-green-600 text-white shadow-green-500/30" : "bg-red-500 text-white shadow-red-500/30"
                }`}>
                    {toast.type === "success" ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                    <span className="font-bold text-sm tracking-wide">{toast.message}</span>
                </div>
            )}

            {/* MODAL CULORI CUSTOM & OFERTE */}
            {showContactModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 border border-slate-100">
                        {/* Buton Închidere */}
                        <button
                            onClick={() => setShowContactModal(false)}
                            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                        </div>

                        <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">Culoare Custom sau Proiect Atipic?</h3>
                        <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">
                            Dorești o nuanță specială din paletarul RAL, imitație de lemn sau ai dimensiuni atipice pentru geamurile tale? Contactează-ne direct și îți vom pregăti rapid o ofertă personalizată.
                        </p>

                        <div className="space-y-3">
                            {/* Buton WhatsApp */}
                            <a
                                href="https://wa.me/40750424228"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#1ebd5b] transition-all shadow-md active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12.031 2.016a9.96 9.96 0 00-8.528 15.112l-1.488 5.438 5.561-1.46a9.957 9.957 0 004.455 1.05h.004c5.498 0 9.966-4.468 9.966-9.966a9.969 9.969 0 00-2.92-7.048 9.966 9.966 0 00-7.05-2.926zm0 18.257h-.003a8.27 8.27 0 01-4.214-1.214l-.302-.178-3.13.823.839-3.053-.196-.312A8.252 8.252 0 013.73 11.982c0-4.562 3.712-8.275 8.274-8.275a8.268 8.268 0 015.852 2.427 8.266 8.266 0 012.425 5.85c0 4.563-3.712 8.275-8.275 8.275zm4.536-6.19c-.248-.125-1.472-.73-1.699-.813-.228-.084-.393-.125-.56.124-.165.25-.642.813-.785.98-.145.166-.289.187-.538.061-.249-.124-1.05-.386-2-1.23-.74-.658-1.24-1.471-1.385-1.72-.145-.25-.015-.385.11-.508.113-.11.249-.292.373-.438.125-.145.166-.25.25-.416.082-.167.042-.313-.02-.438-.063-.125-.56-1.352-.767-1.85-.201-.482-.405-.417-.56-.425h-.478c-.165 0-.435.063-.662.313-.228.25-.87.854-.87 2.083s.891 2.417 1.015 2.584c.125.166 1.762 2.688 4.27 3.77 1.545.666 2.148.718 2.923.603.854-.127 2.607-1.063 2.978-2.084.373-1.021.373-1.896.262-2.084-.112-.187-.414-.291-.663-.416z" clipRule="evenodd" />
                                </svg>
                                Discută pe WhatsApp
                            </a>

                            {/* Buton Email */}
                            <a
                                href="mailto:iplisse@proton.me"
                                className="w-full border-2 border-slate-200 text-slate-700 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Trimite un Email
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                    input[type=range]::-webkit-slider-thumb {
                        -webkit-appearance: none; appearance: none;
                        width: 18px; height: 18px;
                        background: #2563eb; border-radius: 50%;
                        cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                        transition: transform 0.2s;
                    }
                    input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.1); }
                `,
            }} />

            <div className="lg:col-span-7 p-8 md:p-12 bg-white">
                <div className="space-y-10">
                    <section>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">
                                1. Configurare Cote
                            </h3>
                            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
                                {(["mm", "cm", "m"] as const).map((u) => (
                                    <button
                                        key={u}
                                        onClick={() => setUnit(u)}
                                        className={`text-[11px] font-bold uppercase px-4 py-1.5 rounded-lg transition-all ${
                                            unit === u ? "bg-white shadow-md text-blue-600" : "text-slate-400"
                                        }`}
                                    >
                                        {u}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {(["w", "h"] as const).map((type) => (
                                <div key={type}>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2 block tracking-widest">
                                        {type === "w" ? "Lățime Gol" : "Înălțime Gol"}
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={type === "w" ? rawWidth : rawHeight}
                                            onChange={(e) => handleInputChange(e.target.value, type)}
                                            className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-blue-600 bg-slate-50/50 outline-none font-mono text-lg transition-all"
                                        />
                                        <span className="absolute bottom-4 right-5 text-sm font-bold text-slate-300 group-focus-within:text-blue-500">
                                            {unit}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter mb-6">
                            2. Selecție Finisaj (Profil)
                        </h3>

                        {/* Butoane pentru culorile standard */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                            {Object.keys(colorMap).map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setFrameColor(c)}
                                    className={`group relative p-4 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 border-2 rounded-2xl transition-all ${
                                        frameColor === c
                                            ? "border-blue-600 bg-blue-50/50 shadow-sm"
                                            : "border-slate-100 hover:border-slate-200 bg-white"
                                    }`}
                                >
                                    <span
                                        className="w-6 h-6 rounded-full border border-black/10 shadow-inner flex-shrink-0"
                                        style={{ backgroundColor: colorMap[c] }}
                                    />
                                    <span className={`text-[10px] sm:text-[11px] text-center sm:text-left font-bold ${frameColor === c ? "text-blue-700" : "text-slate-500"}`}>
                                        {c}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Banner/Buton pentru cereri custom */}
                        <button
                            onClick={() => setShowContactModal(true)}
                            className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:shadow-md transition-all">
                                    <svg className="w-5 h-5 text-slate-500 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                                </div>
                                <div className="text-left">
                                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Culoare Custom / Proiect Atipic?</p>
                                    <p className="text-xs text-slate-500 mt-0.5 font-medium">Apasă aici pentru a cere o ofertă personalizată.</p>
                                </div>
                            </div>
                            <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </section>

                    <section className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100/50">
                        <h4 className="text-[10px] font-black text-blue-400 uppercase mb-4 tracking-[0.2em]">
                            Sumar Producție
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-[11px] font-bold">
                            <p className="text-slate-600 italic">
                                Suprafață: <span className="text-slate-900 not-italic">{(wMm * hMm / 1_000_000).toFixed(2)} m²</span>
                            </p>
                            <p className="text-slate-600 italic">
                                Tip: <span className="text-slate-900 not-italic uppercase tracking-tight">{plisseType}</span>
                            </p>
                        </div>
                    </section>
                </div>
            </div>

            <div className="lg:col-span-5 bg-slate-100 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden border-l border-slate-200">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-white to-slate-200 opacity-50 z-0 pointer-events-none" />

                <div className="relative z-10 flex justify-between items-center mb-8">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Simulare Vizuală</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode("2D")}
                            className={`text-[9px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                                viewMode === "2D" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            2D
                        </button>
                        <button
                            onClick={() => {
                                setViewMode("3D");
                                setRotation({ x: 15, y: -25 });
                            }}
                            className={`text-[9px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                                viewMode === "3D" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            3D
                        </button>
                    </div>
                </div>

                <div
                    ref={visualizerRef}
                    onMouseDown={handleMouseDown}
                    className={`relative z-10 w-full h-[320px] flex flex-col items-center justify-center rounded-3xl bg-white border border-slate-300 shadow-xl overflow-hidden ${
                        viewMode === "3D" ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
                    }`}
                    style={{ perspective: "1500px" }}
                >
                    <div className="absolute inset-0 bg-slate-50 flex items-center justify-center opacity-40">
                        <div className="w-full h-1 bg-slate-200 absolute top-1/2 -translate-y-1/2 shadow-sm" />
                        <div className="h-full w-1 bg-slate-200 absolute left-1/2 -translate-x-1/2 shadow-sm" />
                    </div>

                    <div
                        className={`relative border-[14px] ${isDragging ? '' : 'transition-transform duration-500 ease-in-out'}`}
                        style={{
                            ...frameStyle,
                            width: `${wMm * scale}px`,
                            height: `${hMm * scale}px`,
                            transform: viewMode === "3D" ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` : "rotateX(0deg) rotateY(0deg)",
                            transformStyle: "preserve-3d",
                            willChange: "transform",
                        }}
                    >
                        <div
                            className="absolute left-0 h-full overflow-hidden transition-all duration-300 ease-in-out border-r-[10px]"
                            style={{
                                width: `${openLevel}%`,
                                borderColor: colorMap[frameColor],
                                background: `repeating-linear-gradient(to right, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.3) 4px, rgba(0,0,0,0.1) 8px)`,
                                transform: viewMode === "3D" ? "translateZ(4px)" : "translateZ(0px)",
                            }}
                        >
                            <div className="w-full h-full opacity-30 bg-[radial-gradient(circle,#000_1px,transparent_1px)] bg-[size:3px_3px]" />
                        </div>

                        <div className={`absolute top-1/4 left-0 w-full h-[1px] bg-black/10 transition-opacity duration-500 ${viewMode === "3D" ? 'opacity-100' : 'opacity-0'}`} />
                        <div className={`absolute bottom-1/4 left-0 w-full h-[1px] bg-black/10 transition-opacity duration-500 ${viewMode === "3D" ? 'opacity-100' : 'opacity-0'}`} />
                    </div>

                    {viewMode === "3D" && (
                        <div className="absolute bottom-4 text-[9px] font-bold text-slate-400 bg-white/80 px-2 py-1 rounded pointer-events-none">
                            {isDragging ? "Trage pentru rotire" : "Ține apăsat pentru a roti"}
                        </div>
                    )}
                </div>

                <div className="relative z-10 mt-6 flex flex-col items-center">
                    <input
                        type="range" min="5" max="95" value={openLevel}
                        onChange={(e) => setOpenLevel(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                <div className="relative z-10 mt-8 space-y-5">
                    <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                Preț Final Calculat (TVA inclus)
                            </span>
                            <span className="text-5xl font-black text-slate-900 tracking-tighter transition-all">
                                {calculatedPrice > 0 ? calculatedPrice.toFixed(2) : "0.00"}
                                <span className="text-lg ml-1 text-blue-600 font-bold">RON</span>
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={isSubmitting || calculatedPrice === 0}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.15em] text-xs transition-all shadow-xl ${
                            isSubmitting || calculatedPrice === 0
                                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200 active:scale-95 shadow-blue-500/20"
                        }`}
                    >
                        {isSubmitting
                            ? "Se adaugă în coș..."
                            : !user
                                ? "Autentificare pentru Coș"
                                : "Adaugă în Coș"}
                    </button>
                </div>
            </div>
        </div>
    );
}