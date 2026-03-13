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
        visible: false, message: "", type: "success"
    });
    const [showContactModal, setShowContactModal] = useState(false);

    // Stări Configurator
    const [unit, setUnit] = useState<"mm" | "cm" | "m">("mm");
    const [rawWidth, setRawWidth] = useState<string>("1200");
    const [rawHeight, setRawHeight] = useState<string>("1500");
    const [frameColor, setFrameColor] = useState<string>("Antracit (RAL 7016)");
    const [openLevel, setOpenLevel] = useState<number>(70);
    const [viewMode, setViewMode] = useState<"2D" | "3D">("3D");

    // Stări Interactivitate 3D
    const [rotation, setRotation] = useState({ x: 15, y: -25 });
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const currentRotation = useRef({ x: 15, y: -25 });

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
        localStorage.setItem("iplisse_config", JSON.stringify({ rawWidth, rawHeight, unit, frameColor, viewMode }));
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

    // Scale calculat responsiv (mai mic pe ecrane mici)
    const [scaleMultiplier, setScaleMultiplier] = useState(240);
    useEffect(() => {
        setScaleMultiplier(window.innerWidth < 1024 ? 180 : 240);
        const handleResize = () => setScaleMultiplier(window.innerWidth < 1024 ? 180 : 240);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const scale = useMemo(() => Math.min(scaleMultiplier / Math.max(wMm, 1), scaleMultiplier / Math.max(hMm, 1)), [wMm, hMm, scaleMultiplier]);

    const plisseType = useMemo(() => {
        if (hMm > 2200) return "Plisse XL Orizontal";
        if (hMm < 800) return "Plisse Vertical";
        return "Plisse Orizontal";
    }, [hMm]);

    const calculatedPrice = useMemo(() => {
        if (wMm === 0 || hMm === 0) return 0;
        const areaMp = (wMm * hMm) / 1_000_000;
        return (areaMp * 250) + 50;
    }, [wMm, hMm]);

    // =========================================================
    // LOGICĂ DRAG & DROP OPTIMIZATĂ PENTRU MOBIL
    // =========================================================
    const handlePointerDown = useCallback((clientX: number, clientY: number) => {
        if (viewMode !== "3D") return;
        isDragging.current = true;
        dragStart.current = { x: clientX, y: clientY };
        currentRotation.current = { ...rotation };
    }, [viewMode, rotation]);

    const handlePointerMove = useCallback((clientX: number, clientY: number) => {
        if (!isDragging.current || viewMode !== "3D") return;

        // Sensibilitate adaptată (mai mică pe mobil pentru a nu sări brusc)
        const sensitivity = window.innerWidth < 1024 ? 0.3 : 0.5;
        const deltaX = clientX - dragStart.current.x;
        const deltaY = clientY - dragStart.current.y;

        const newX = Math.max(-60, Math.min(60, currentRotation.current.x - deltaY * sensitivity));
        const newY = currentRotation.current.y + deltaX * sensitivity;

        setRotation({ x: newX, y: newY });
    }, [viewMode]);

    const handlePointerUp = useCallback(() => {
        isDragging.current = false;
    }, []);

    // Atașăm ascultătorii globali doar când e necesar, pentru performanță (60fps pe mobil)
    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
        const onTouchMove = (e: TouchEvent) => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        const onUp = () => handlePointerUp();

        window.addEventListener("mousemove", onMouseMove, { passive: true });
        window.addEventListener("touchmove", onTouchMove, { passive: true });
        window.addEventListener("mouseup", onUp);
        window.addEventListener("touchend", onUp);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("mouseup", onUp);
            window.removeEventListener("touchend", onUp);
        };
    }, [handlePointerMove, handlePointerUp]);

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

            const { error } = await supabase.from("orders").insert([{
                user_id: activeUserId, width: wMm, height: hMm, frame_color: frameColor,
                plisse_type: plisseType, price: calculatedPrice, status: 'pending'
            }]);

            if (error) throw error;

            localStorage.removeItem("iplisse_config");
            showToast("Produsul a fost adăugat cu succes în coș!", "success");

            setTimeout(() => router.push("/cart"), 1500);
        } catch (err: any) {
            console.error("Eroare la adăugare:", err);
            showToast(err.message || "Eroare de conexiune la adăugarea în coș.", "error");
            setIsSubmitting(false);
        }
    };

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

    if (!hydrated) return <div className="min-h-[600px] bg-slate-50 animate-pulse rounded-3xl w-full"></div>;

    return (
        <div className="relative max-w-6xl mx-auto pb-32 lg:pb-0">

            {/* STILURI SPECIALE PENTRU SLIDER PE MOBIL */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    /* Dezactivăm scroll-ul nativ pe containerele 3D pe mobil */
                    .touch-manipulation-none { touch-action: none; }
                    
                    /* Slider mai gros și ușor de prins pe telefon */
                    input[type=range]::-webkit-slider-thumb {
                        -webkit-appearance: none; appearance: none;
                        width: 24px; height: 24px;
                        background: #2563eb; border-radius: 50%;
                        cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    }
                    @media (min-width: 1024px) {
                        input[type=range]::-webkit-slider-thumb { width: 18px; height: 18px; }
                        input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.1); }
                    }
                `,
            }} />

            {/* TOAST NOTIFICATION */}
            {toast.visible && (
                <div className={`fixed top-20 lg:top-auto lg:bottom-10 left-1/2 -translate-x-1/2 z-[60] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce ${
                    toast.type === "success" ? "bg-green-600 text-white shadow-green-500/30" : "bg-red-500 text-white shadow-red-500/30"
                }`}>
                    <span className="font-bold text-sm tracking-wide">{toast.message}</span>
                </div>
            )}

            {/* MODAL CULORI CUSTOM */}
            {showContactModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative">
                        <button onClick={() => setShowContactModal(false)} className="absolute top-5 right-5 text-slate-400 bg-slate-100 p-2 rounded-full">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight mt-6">Culoare Custom / Atipic?</h3>
                        <p className="text-sm text-slate-500 mb-8 font-medium">Dorești o nuanță specială RAL sau imitație lemn? Contactează-ne direct.</p>
                        <div className="space-y-3">
                            <a href="https://wa.me/40750424228" target="_blank" rel="noopener noreferrer" className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3">
                                Discută pe WhatsApp
                            </a>
                            <a href="mailto:iplisse@proton.me" className="w-full border-2 border-slate-200 text-slate-700 py-4 rounded-xl font-bold flex items-center justify-center gap-3">
                                Trimite un Email
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN GRID */}
            <div className="bg-white border-0 lg:border border-slate-200 shadow-none lg:shadow-2xl w-full flex flex-col lg:grid lg:grid-cols-12 overflow-hidden rounded-none lg:rounded-3xl">

                {/* ZONA VISUALIZER (Sus pe mobil, Dreapta pe Desktop) */}
                <div className="order-first lg:order-last lg:col-span-5 bg-slate-100 p-5 sm:p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-l border-slate-200 relative z-20">
                    <div className="flex justify-between items-center mb-4 lg:mb-8">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Simulare 3D</h3>
                        <div className="flex gap-2">
                            <button onClick={() => setViewMode("2D")} className={`text-[9px] font-bold px-3 py-1.5 rounded-lg border transition-all ${viewMode === "2D" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500"}`}>2D</button>
                            <button onClick={() => { setViewMode("3D"); setRotation({ x: 15, y: -25 }); }} className={`text-[9px] font-bold px-3 py-1.5 rounded-lg border transition-all ${viewMode === "3D" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500"}`}>3D</button>
                        </div>
                    </div>

                    <div
                        onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
                        onTouchStart={(e) => handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)}
                        className={`relative w-full h-[240px] sm:h-[300px] lg:h-[320px] flex flex-col items-center justify-center rounded-2xl lg:rounded-3xl bg-white border border-slate-300 shadow-md lg:shadow-xl overflow-hidden touch-manipulation-none ${viewMode === "3D" ? 'cursor-grab' : ''}`}
                        style={{ perspective: "1500px" }}
                    >
                        <div className="absolute inset-0 bg-slate-50 flex items-center justify-center opacity-40 pointer-events-none">
                            <div className="w-full h-1 bg-slate-200 absolute top-1/2 -translate-y-1/2" />
                            <div className="h-full w-1 bg-slate-200 absolute left-1/2 -translate-x-1/2" />
                        </div>

                        <div
                            className="relative border-[10px] lg:border-[14px] pointer-events-none"
                            style={{
                                ...frameStyle, width: `${wMm * scale}px`, height: `${hMm * scale}px`,
                                transform: viewMode === "3D" ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` : "rotateX(0deg) rotateY(0deg)",
                                transformStyle: "preserve-3d",
                            }}
                        >
                            <div
                                className="absolute left-0 h-full overflow-hidden border-r-[6px] lg:border-r-[10px]"
                                style={{
                                    width: `${openLevel}%`, borderColor: colorMap[frameColor],
                                    background: `repeating-linear-gradient(to right, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.3) 4px, rgba(0,0,0,0.1) 8px)`,
                                    transform: viewMode === "3D" ? "translateZ(4px)" : "translateZ(0px)",
                                }}
                            >
                                <div className="w-full h-full opacity-30 bg-[radial-gradient(circle,#000_1px,transparent_1px)] bg-[size:3px_3px]" />
                            </div>
                        </div>
                        {viewMode === "3D" && (
                            <div className="absolute bottom-2 lg:bottom-4 text-[8px] lg:text-[9px] font-bold text-slate-400 bg-white/90 px-2 py-1 rounded pointer-events-none shadow-sm">
                                {window.innerWidth < 1024 ? "Atinge modelul pt. a roti" : "Trage pentru rotire"}
                            </div>
                        )}
                    </div>

                    <div className="mt-4 lg:mt-6 flex flex-col items-center">
                        <input type="range" min="5" max="95" value={openLevel} onChange={(e) => setOpenLevel(Number(e.target.value))} className="w-full h-1.5 lg:h-2 bg-slate-300 rounded-lg appearance-none accent-blue-600 outline-none" />
                    </div>
                </div>

                {/* ZONA CONTROALE (Jos pe mobil, Stânga pe Desktop) */}
                <div className="lg:col-span-7 p-5 sm:p-8 lg:p-12 bg-white order-last lg:order-first z-10">
                    <div className="space-y-8 lg:space-y-10">
                        <section>
                            <div className="flex justify-between items-center mb-4 lg:mb-6">
                                <h3 className="text-xs lg:text-sm font-black text-slate-900 uppercase tracking-tighter">1. Configurare Cote</h3>
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    {(["mm", "cm", "m"] as const).map((u) => (
                                        <button key={u} onClick={() => setUnit(u)} className={`text-[10px] lg:text-[11px] font-bold uppercase px-3 lg:px-4 py-1.5 rounded-lg transition-all ${unit === u ? "bg-white shadow-md text-blue-600" : "text-slate-400"}`}>
                                            {u}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 lg:gap-6">
                                {(["w", "h"] as const).map((type) => (
                                    <div key={type}>
                                        <label className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2 block tracking-widest">{type === "w" ? "Lățime Gol" : "Înălțime Gol"}</label>
                                        <div className="relative">
                                            <input type="text" inputMode="numeric" value={type === "w" ? rawWidth : rawHeight} onChange={(e) => handleInputChange(e.target.value, type)} className="w-full border-2 border-slate-100 rounded-xl lg:rounded-2xl p-3 lg:p-4 focus:border-blue-600 bg-slate-50/50 outline-none font-mono text-base lg:text-lg transition-all" />
                                            <span className="absolute bottom-3.5 lg:bottom-4 right-4 lg:right-5 text-xs lg:text-sm font-bold text-slate-300">{unit}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xs lg:text-sm font-black text-slate-900 uppercase tracking-tighter mb-4 lg:mb-6">2. Selecție Finisaj</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 mb-4">
                                {Object.keys(colorMap).map((c) => (
                                    <button key={c} onClick={() => setFrameColor(c)} className={`p-3 lg:p-4 flex sm:flex-col items-center justify-start sm:justify-center gap-3 lg:gap-2 border-2 rounded-xl lg:rounded-2xl transition-all ${frameColor === c ? "border-blue-600 bg-blue-50 shadow-sm" : "border-slate-100 bg-white"}`}>
                                        <span className="w-5 h-5 lg:w-6 lg:h-6 rounded-full border border-black/10 shadow-inner flex-shrink-0" style={{ backgroundColor: colorMap[c] }} />
                                        <span className={`text-[10px] lg:text-[11px] font-bold ${frameColor === c ? "text-blue-700" : "text-slate-500"}`}>{c}</span>
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setShowContactModal(true)} className="w-full flex items-center p-3 lg:p-4 bg-slate-50 border border-slate-200 rounded-xl lg:rounded-2xl hover:bg-blue-50">
                                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-center mr-3 lg:mr-4">
                                    <svg className="w-4 h-4 lg:w-5 lg:h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] lg:text-[11px] font-black text-slate-800 uppercase tracking-widest">Culoare Custom / Atipic?</p>
                                    <p className="text-[10px] lg:text-xs text-slate-500 mt-0.5">Apasă pt. ofertă personalizată.</p>
                                </div>
                            </button>
                        </section>
                    </div>
                </div>

            </div>

            {/* BARA FIXĂ DE CHECKOUT (Lipită jos pe mobil, ascunsă în design-ul normal pe desktop) */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 z-50 lg:hidden shadow-[0_-10px_30px_rgba(0,0,0,0.15)] flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total:</span>
                    <span className="text-xl font-black text-slate-900 leading-none">
                        {calculatedPrice > 0 ? calculatedPrice.toFixed(2) : "0.00"} <span className="text-xs text-blue-600 font-bold">RON</span>
                    </span>
                </div>
                <button
                    onClick={handleAddToCart}
                    disabled={isSubmitting || calculatedPrice === 0}
                    className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-blue-500/30 disabled:opacity-50"
                >
                    {isSubmitting ? "Se adaugă..." : !user ? "Login & Adaugă" : "Adaugă în Coș"}
                </button>
            </div>

            {/* Butonul de Desktop pentru Checkout (Apare doar pe ecrane mari) */}
            <div className="hidden lg:flex w-full bg-slate-100 border border-slate-200 shadow-md rounded-2xl mt-6 p-6 justify-between items-center">
                <div>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1">Preț Final Calculat (TVA inclus)</span>
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">
                        {calculatedPrice > 0 ? calculatedPrice.toFixed(2) : "0.00"}
                        <span className="text-lg ml-2 text-blue-600 font-bold">RON</span>
                    </span>
                </div>
                <button
                    onClick={handleAddToCart}
                    disabled={isSubmitting || calculatedPrice === 0}
                    className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.15em] text-xs transition-all shadow-xl hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                >
                    {isSubmitting ? "Se procesează..." : !user ? "Autentificare pentru Coș" : "Adaugă produsul în Coș"}
                </button>
            </div>

        </div>
    );
}