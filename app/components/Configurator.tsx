"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
interface ConfiguratorProps {
    user: any;
}

const CONFIG_LIMITS = {
    minWidthMm: 300,
    maxWidthMm: 3000,
    minHeightMm: 500,
    maxHeightMm: 3000,
};
export default function Configurator({ user }: ConfiguratorProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    const [logoClickCount, setLogoClickCount] = useState(0);
    const logoClickTimeout = useRef<NodeJS.Timeout | null>(null);
    // Stări Pop-up-uri
    const [toast, setToast] = useState<{ visible: boolean; message: string; type: "success" | "error" }>({
        visible: false, message: "", type: "success"
    });
    const [showContactModal, setShowContactModal] = useState(false);

    // Stări Configurator
    const [meshType, setMeshType] = useState<"type1" | "type2" | "type3">("type1");
    const [unit, setUnit] = useState<"mm" | "cm" | "m">("mm");
    const [rawWidth, setRawWidth] = useState<string>("300");
    const [rawHeight, setRawHeight] = useState<string>("500");
    const [frameColor, setFrameColor] = useState<string>("Antracit (RAL 7016)");
    const [openLevel, setOpenLevel] = useState<number>(70);
    const [viewMode, setViewMode] = useState<"2D" | "3D">("3D");
    const [exchangeRate, setExchangeRate] = useState<number>(5.0); // EUR to RON

    // Trage cursul live din Supabase la încărcarea configuratorului
    useEffect(() => {
        const fetchLiveRate = async () => {
            const { data, error } = await supabase
                .from("app_settings")
                .select("value")
                .eq("key", "exchange_rate_eur_ron")
                .single<any>();

            if (error) {
                console.error("failed to fetch exchange rate:", error);
                return;
            }

            if (data && (data as any).value != null) {
                setExchangeRate(Number((data as any).value));
            }
        };
        fetchLiveRate();
    }, []);

    // Stări Interactivitate 3D
    const [rotation, setRotation] = useState({ x: 15, y: -25 });
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const currentRotation = useRef({ x: 15, y: -25 });

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3000);
    };

    // Handler pentru logo clicks (5 clicks → admin)
    const handleLogoClick = () => {
        // Copy to a local variable so TS can narrow it
        const timeout = logoClickTimeout.current;

        if (timeout) {
            clearTimeout(timeout);
        }

        const newCount = logoClickCount + 1;
        setLogoClickCount(newCount);

        if (newCount >= 5) {
            router.push("/admin");
            setLogoClickCount(0);
        } else {
            logoClickTimeout.current = setTimeout(
                () => setLogoClickCount(0),
                2000
            );
        }
    };

    useEffect(() => {
        try {
            const saved = localStorage.getItem("iplisse_config");
            if (saved) {
                const p = JSON.parse(saved);
                setMeshType(p.meshType ?? "type1");
                setRawWidth(p.rawWidth ?? "300");
                setRawHeight(p.rawHeight ?? "500");
                setUnit(p.unit ?? "mm");
                setFrameColor(p.frameColor ?? "Antracit (RAL 7016)");
                setViewMode(p.viewMode ?? "3D");
                setExchangeRate(p.exchangeRate ?? 5.0);
            }
        } catch {
                } finally {
                    setHydrated(true);
                }
            }, []);

    useEffect(() => {
        if (!hydrated) return;
        localStorage.setItem("iplisse_config", JSON.stringify({ 
            meshType, rawWidth, rawHeight, unit, frameColor, viewMode, exchangeRate 
        }));
    }, [meshType, rawWidth, rawHeight, unit, frameColor, viewMode, exchangeRate, hydrated]);

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

    const rawWMm = useMemo(() => Math.round(convertToMm(rawWidth, unit)), [rawWidth, unit]);
    const rawHMm = useMemo(() => Math.round(convertToMm(rawHeight, unit)), [rawHeight, unit]);

    const wMm = useMemo(() => {
        return Math.min(CONFIG_LIMITS.maxWidthMm, Math.max(CONFIG_LIMITS.minWidthMm, rawWMm));
    }, [rawWMm]);

    const hMm = useMemo(() => {
        return Math.min(CONFIG_LIMITS.maxHeightMm, Math.max(CONFIG_LIMITS.minHeightMm, rawHMm));
    }, [rawHMm]);

    const sizeError = useMemo(() => {
        if (rawWidth === "" || rawHeight === "") return null; // don't warn on empty yet

        if (rawWMm < CONFIG_LIMITS.minWidthMm || rawWMm > CONFIG_LIMITS.maxWidthMm) {
            return `Lățimea trebuie să fie între ${CONFIG_LIMITS.minWidthMm} și ${CONFIG_LIMITS.maxWidthMm} mm.`;
        }
        if (rawHMm < CONFIG_LIMITS.minHeightMm || rawHMm > CONFIG_LIMITS.maxHeightMm) {
            return `Înălțimea trebuie să fie între ${CONFIG_LIMITS.minHeightMm} și ${CONFIG_LIMITS.maxHeightMm} mm.`;
        }
        return null;
    }, [rawWMm, rawHMm, rawWidth, rawHeight]);

    useEffect(() => {
        if (sizeError) {
            showToast(sizeError, "error");
        }
    }, [sizeError]);
    // =========================================================
    // MATRICE PREȚURI EUR (din Excel)
    // =========================================================
    const pricingData = {
        plase_1_canat: {
            widthLimits: [500, 700, 900, 1100, 1300, 1500, 1700],
            heightLimits: [700, 900, 1100, 1300, 1500, 1700, 1900, 2100, 2300, 2500, 2700, 2900],
            matrix: [
                [46.97, 46.97, 46.97, 46.97, 53.43, 61.65, 69.88],
                [46.97, 46.97, 47.55, 58.13, 68.70, 79.27, 89.84],
                [46.97, 46.97, 58.13, 71.05, 83.97, 96.88, 109.80],
                [46.97, 53.25, 68.70, 83.97, 99.23, 114.50, 129.77],
                [46.97, 61.64, 79.27, 96.88, 114.50, 132.12, 149.73],
                [49.91, 69.87, 89.84, 109.80, 129.77, 149.73, 169.70],
                [55.78, 78.09, 100.41, 122.72, 145.03, 167.35, 189.68],
                [61.65, 86.31, 110.98, 135.64, 160.30, 184.96, 209.63],
                [67.52, 94.54, 121.55, 148.56, 175.57, 202.58, 229.59],
                [73.40, 102.76, 132.11, 161.48, 190.84, 220.20, 249.68],
                [79.27, 110.98, 142.69, 174.40, 206.10, 237.81, 269.52],
                [85.14, 119.20, 153.26, 187.31, 221.37, 255.43, 289.49]
            ]
        },
        plase_2_canate: {
            widthLimits: [500, 700, 900, 1100, 1300, 1500, 1700, 1900, 2100, 2300, 2500, 2700, 2900, 3100],
            heightLimits: [700, 900, 1100, 1300, 1500, 1700, 1900, 2100, 2300, 2500, 2700],
            matrix: [
                [56.86, 56.86, 51.17, 51.17, 58.23, 67.23, 76.23, 85.23, 94.23, 103.05, 112.05, 121.05, 130.05, 139.05],
                [56.86, 59.70, 57.64, 63.35, 75.00, 86.47, 97.94, 109.58, 121.05, 132.52, 144.17, 155.64, 167.11, 178.76],
                [62.54, 59.70, 63.35, 77.47, 91.58, 105.52, 119.64, 133.76, 147.88, 162.00, 176.11, 190.23, 204.17, 218.29],
                [65.39, 67.94, 75.00, 91.58, 108.17, 124.94, 141.52, 158.29, 174.88, 191.47, 208.23, 225.00, 241.41, 258.17],
                [73.92, 74.70, 86.47, 105.70, 124.94, 144.17, 163.23, 182.47, 201.70, 220.94, 240.17, 259.41, 278.64, 297.88],
                [78.50, 84.70, 97.94, 119.82, 141.52, 163.41, 174.17, 206.82, 228.70, 250.41, 272.29, 294.00, 315.17, 337.58],
                [87.94, 94.70, 109.41, 133.76, 158.11, 182.47, 206.82, 231.17, 255.52, 279.88, 304.23, 328.58, 352.94, 377.29],
                [97.11, 104.50, 121.05, 147.88, 174.88, 201.70, 228.70, 255.52, 282.52, 309.35, 336.35, 363.17, 390.17, 417.00],
                [106.29, 114.50, 132.52, 162.00, 191.47, 220.94, 250.41, 279.88, 309.35, 338.82, 368.29, 397.76, 427.23, 456.70],
                [115.47, 124.50, 144.00, 176.11, 208.05, 240.17, 272.11, 304.41, 336.17, 368.29, 400.23, 432.35, 464.29, 496.41],
                [124.90, 134.50, 155.64, 190.23, 224.82, 259.41, 294.00, 328.58, 370.58, 397.76, 432.35, 466.94, 501.52, 536.11]
            ]
        }
    };

    // Funcție lookup preț din matrice
    const getPriceFromMatrix = useCallback((width: number, height: number, type: "type1" | "type2" | "type3"): number => {
        const data = (type === "type3") ? pricingData.plase_2_canate : pricingData.plase_1_canat;
        
        // Găsește index pentru lățime
        let widthIndex = data.widthLimits.findIndex(limit => width <= limit);
        if (widthIndex === -1) widthIndex = data.widthLimits.length - 1;
        
        // Găsește index pentru înălțime
        let heightIndex = data.heightLimits.findIndex(limit => height <= limit);
        if (heightIndex === -1) heightIndex = data.heightLimits.length - 1;
        
        // Returnează prețul din matrice
        return data.matrix[heightIndex]?.[widthIndex] || 46.97; // fallback la prețul minim
    }, []);

    const [scaleMultiplier, setScaleMultiplier] = useState(240);
    useEffect(() => {
        setScaleMultiplier(window.innerWidth < 1024 ? 180 : 240);
        const handleResize = () => setScaleMultiplier(window.innerWidth < 1024 ? 180 : 240);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const scale = useMemo(() => Math.min(scaleMultiplier / Math.max(wMm, 1), scaleMultiplier / Math.max(hMm, 1)), [wMm, hMm, scaleMultiplier]);

    const plisseType = useMemo(() => {
        if (meshType === "type1") return "Plasă 1 canat - Vertical";
        if (meshType === "type2") return "Plasă 1 canat - Orizontal";
        return "Plasă 2 canate";
    }, [meshType]);

    // Calculare preț în EUR din matrice
    const basePriceEur = useMemo(() => {
        if (wMm === 0 || hMm === 0) return 0;
        return getPriceFromMatrix(wMm, hMm, meshType);
    }, [wMm, hMm, meshType, getPriceFromMatrix]);

    // Preț final în RON (bazat pe curs)
    const calculatedPrice = useMemo(() => {
        return basePriceEur * exchangeRate;
    }, [basePriceEur, exchangeRate]);

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

        if (sizeError) {
            showToast(sizeError, "error");
            return;
        }

        if (rawWidth === "" || rawHeight === "") {
            showToast("Introduceți dimensiunile plasei.", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const activeUserId = session?.user?.id || user?.id;

            if (!activeUserId) throw new Error("Sesiune expirată. Te rugăm să te reautentifici.");

            const { error } = await supabase.from("orders").insert([{
                user_id: activeUserId,
                width: wMm,
                height: hMm,
                frame_color: frameColor,
                plisse_type: plisseType,
                mesh_type: meshType,
                base_price_eur: basePriceEur,
                exchange_rate: exchangeRate,
                price: calculatedPrice,
                status: 'pending'
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
                        transition: all 0.2s ease;
                    }
                    @media (min-width: 1024px) {
                        input[type=range]::-webkit-slider-thumb { width: 18px; height: 18px; }
                        input[type=range]::-webkit-slider-thumb:hover { 
                            transform: scale(1.15); 
                            background: #1d4ed8;
                            box-shadow: 0 3px 8px rgba(37,99,235,0.4);
                        }
                    }
                    
                    /* Animații smooth pentru configurator */
                    @keyframes fadeInScale {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    
                    @keyframes shimmer {
                        0% { background-position: -1000px 0; }
                        100% { background-position: 1000px 0; }
                    }
                    
                    .mesh-animate {
                        animation: fadeInScale 0.4s ease-out;
                    }
                    
                    .mesh-shadow-dynamic {
                        filter: drop-shadow(0 20px 35px rgba(0,0,0,0.15)) 
                                drop-shadow(0 8px 15px rgba(0,0,0,0.1));
                        transition: filter 0.3s ease;
                    }
                    
                    .mesh-shadow-dynamic:hover {
                        filter: drop-shadow(0 25px 45px rgba(0,0,0,0.2)) 
                                drop-shadow(0 12px 20px rgba(0,0,0,0.15));
                    }
                    
                    /* Efect de material pentru plasa */
                    .plisse-fabric {
                        background: 
                            repeating-linear-gradient(90deg, 
                                rgba(0,0,0,0.05) 0px, 
                                rgba(0,0,0,0.15) 2px, 
                                rgba(0,0,0,0.08) 4px,
                                rgba(0,0,0,0.02) 6px,
                                rgba(0,0,0,0.05) 8px
                            ),
                            radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%);
                        transition: all 0.3s ease;
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
                        <div className="flex gap-2 bg-slate-100/80 p-1 rounded-xl backdrop-blur-sm">
                            <button 
                                onClick={() => setViewMode("2D")} 
                                className={`text-[9px] font-bold px-3 py-2 rounded-lg border transition-all duration-200 flex items-center gap-1.5 ${
                                    viewMode === "2D" 
                                        ? "bg-slate-800 text-white border-slate-800 shadow-md" 
                                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                }`}
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
                                </svg>
                                2D
                            </button>
                            <button 
                                onClick={() => { setViewMode("3D"); setRotation({ x: 15, y: -25 }); }} 
                                className={`text-[9px] font-bold px-3 py-2 rounded-lg border transition-all duration-200 flex items-center gap-1.5 ${
                                    viewMode === "3D" 
                                        ? "bg-slate-800 text-white border-slate-800 shadow-md" 
                                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                }`}
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                3D
                            </button>
                        </div>
                    </div>

                    <div
                        onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
                        onTouchStart={(e) => handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)}
                        className={`relative w-full h-[240px] sm:h-[300px] lg:h-[320px] flex flex-col items-center justify-center rounded-2xl lg:rounded-3xl bg-white border border-slate-300 shadow-md lg:shadow-xl overflow-hidden touch-manipulation-none ${viewMode === "3D" ? 'cursor-grab' : ''}`}
                        style={{ perspective: "1500px" }}
                    >
                        {/* Grid background îmbunătățit */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center opacity-50 pointer-events-none">
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent absolute top-1/2 -translate-y-1/2" />
                            <div className="h-full w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent absolute left-1/2 -translate-x-1/2" />
                            {/* Gradient radial pentru depth */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.03)_100%)]" />
                        </div>

                        <div
                            className="relative border-[10px] lg:border-[14px] pointer-events-none mesh-animate mesh-shadow-dynamic transition-all duration-300"
                            style={{
                                ...frameStyle, 
                                width: `${wMm * scale}px`, 
                                height: `${hMm * scale}px`,
                                transform: viewMode === "3D" 
                                    ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` 
                                    : "rotateX(0deg) rotateY(0deg)",
                                transformStyle: "preserve-3d",
                                transition: "transform 0.15s ease-out, box-shadow 0.3s ease",
                            }}
                        >
                            {/* Type 1: Vertical - 1 canat vertical în centru */}
                            {meshType === "type1" && (
                                <>
                                    <div
                                        className="absolute left-0 h-full overflow-hidden border-r-[4px] lg:border-r-[6px] plisse-fabric transition-all duration-300"
                                        style={{
                                            width: `${openLevel}%`, 
                                            borderColor: colorMap[frameColor],
                                            transform: viewMode === "3D" ? "translateZ(6px)" : "translateZ(0px)",
                                            boxShadow: viewMode === "3D" 
                                                ? "inset -2px 0 8px rgba(0,0,0,0.2), 2px 0 12px rgba(0,0,0,0.15)" 
                                                : "inset -1px 0 4px rgba(0,0,0,0.1)",
                                        }}
                                    >
                                        <div className="w-full h-full opacity-40 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:4px_4px]" />
                                        {/* Light reflection */}
                                        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                                    </div>
                                    {/* Canat vertical în centru - îmbunătățit */}
                                    <div 
                                        className="absolute h-full w-1.5 lg:w-2 rounded-full transition-all duration-300"
                                        style={{
                                            left: '50%',
                                            background: `linear-gradient(to right, rgba(0,0,0,0.3), rgba(0,0,0,0.6), rgba(0,0,0,0.3))`,
                                            transform: viewMode === "3D" 
                                                ? "translateX(-50%) translateZ(8px)" 
                                                : "translateX(-50%) translateZ(0px)",
                                            boxShadow: viewMode === "3D"
                                                ? "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.1)"
                                                : "0 2px 6px rgba(0,0,0,0.2)",
                                        }}
                                    />
                                </>
                            )}

                            {/* Type 2: Orizontal - 1 canat orizontal în centru */}
                            {meshType === "type2" && (
                                <>
                                    <div
                                        className="absolute top-0 w-full overflow-hidden border-b-[4px] lg:border-b-[6px] plisse-fabric transition-all duration-300"
                                        style={{
                                            height: `${openLevel}%`, 
                                            borderColor: colorMap[frameColor],
                                            transform: viewMode === "3D" ? "translateZ(6px)" : "translateZ(0px)",
                                            boxShadow: viewMode === "3D" 
                                                ? "inset 0 -2px 8px rgba(0,0,0,0.2), 0 2px 12px rgba(0,0,0,0.15)" 
                                                : "inset 0 -1px 4px rgba(0,0,0,0.1)",
                                        }}
                                    >
                                        <div className="w-full h-full opacity-40 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:4px_4px]" />
                                        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                                    </div>
                                    {/* Canat orizontal în centru - îmbunătățit */}
                                    <div 
                                        className="absolute w-full h-1.5 lg:h-2 rounded-full transition-all duration-300"
                                        style={{
                                            top: '50%',
                                            background: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6), rgba(0,0,0,0.3))`,
                                            transform: viewMode === "3D" 
                                                ? "translateY(-50%) translateZ(8px)" 
                                                : "translateY(-50%) translateZ(0px)",
                                            boxShadow: viewMode === "3D"
                                                ? "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.1)"
                                                : "0 2px 6px rgba(0,0,0,0.2)",
                                        }}
                                    />
                                </>
                            )}

                            {/* Type 3: 2 canate - din lateral spre centru */}
                            {meshType === "type3" && (
                                <>
                                    {/* Partea stângă */}
                                    <div
                                        className="absolute left-0 h-full overflow-hidden border-r-[3px] lg:border-r-[5px] plisse-fabric transition-all duration-300"
                                        style={{
                                            width: `${openLevel / 2}%`, 
                                            borderColor: colorMap[frameColor],
                                            transform: viewMode === "3D" ? "translateZ(6px)" : "translateZ(0px)",
                                            boxShadow: viewMode === "3D" 
                                                ? "inset -2px 0 8px rgba(0,0,0,0.2), 2px 0 12px rgba(0,0,0,0.15)" 
                                                : "inset -1px 0 4px rgba(0,0,0,0.1)",
                                        }}
                                    >
                                        <div className="w-full h-full opacity-40 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:4px_4px]" />
                                        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                                    </div>
                                    {/* Partea dreaptă */}
                                    <div
                                        className="absolute right-0 h-full overflow-hidden border-l-[3px] lg:border-l-[5px] plisse-fabric transition-all duration-300"
                                        style={{
                                            width: `${openLevel / 2}%`, 
                                            borderColor: colorMap[frameColor],
                                            transform: viewMode === "3D" ? "translateZ(6px)" : "translateZ(0px)",
                                            boxShadow: viewMode === "3D" 
                                                ? "inset 2px 0 8px rgba(0,0,0,0.2), -2px 0 12px rgba(0,0,0,0.15)" 
                                                : "inset 1px 0 4px rgba(0,0,0,0.1)",
                                        }}
                                    >
                                        <div className="w-full h-full opacity-40 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:4px_4px]" />
                                        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
                                    </div>
                                    {/* Canat stânga - 1/4 din lățime - îmbunătățit */}
                                    <div 
                                        className="absolute h-full w-1.5 lg:w-2 rounded-full transition-all duration-300"
                                        style={{
                                            left: '25%',
                                            background: `linear-gradient(to right, rgba(0,0,0,0.3), rgba(0,0,0,0.6), rgba(0,0,0,0.3))`,
                                            transform: viewMode === "3D" 
                                                ? "translateX(-50%) translateZ(8px)" 
                                                : "translateX(-50%) translateZ(0px)",
                                            boxShadow: viewMode === "3D"
                                                ? "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.1)"
                                                : "0 2px 6px rgba(0,0,0,0.2)",
                                        }}
                                    />
                                    {/* Canat dreapta - 3/4 din lățime - îmbunătățit */}
                                    <div 
                                        className="absolute h-full w-1.5 lg:w-2 rounded-full transition-all duration-300"
                                        style={{
                                            left: '75%',
                                            background: `linear-gradient(to right, rgba(0,0,0,0.3), rgba(0,0,0,0.6), rgba(0,0,0,0.3))`,
                                            transform: viewMode === "3D" 
                                                ? "translateX(-50%) translateZ(8px)" 
                                                : "translateX(-50%) translateZ(0px)",
                                            boxShadow: viewMode === "3D"
                                                ? "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.1)"
                                                : "0 2px 6px rgba(0,0,0,0.2)",
                                        }}
                                    />
                                </>
                            )}
                        </div>
                        {viewMode === "3D" && (
                            <div className="absolute bottom-3 lg:bottom-4 left-1/2 -translate-x-1/2 text-[9px] lg:text-[10px] font-bold text-slate-500 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full pointer-events-none shadow-lg border border-slate-200 flex items-center gap-2">
                                <svg className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                </svg>
                                <span>{window.innerWidth < 1024 ? "Atinge și trage" : "Trage pentru rotire"}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 lg:mt-6 flex flex-col items-center">
                        <label className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase block mb-2 tracking-wider text-center">
                            {meshType === "type1" && "Nivel deschidere verticală"}
                            {meshType === "type2" && "Nivel deschidere orizontală"}
                            {meshType === "type3" && "Nivel deschidere (2 canate)"}
                        </label>
                        <input type="range" min="5" max="95" value={openLevel} onChange={(e) => setOpenLevel(Number(e.target.value))} className="w-full h-1.5 lg:h-2 bg-slate-300 rounded-lg appearance-none accent-blue-600 outline-none" />
                    </div>
                </div>

                {/* ZONA CONTROALE (Jos pe mobil, Stânga pe Desktop) */}
                <div className="lg:col-span-7 p-5 sm:p-8 lg:p-12 bg-white order-last lg:order-first z-10">
                    <div className="space-y-8 lg:space-y-10">
                        
                        {/* PASUL 1: SELECTARE TIP PLASĂ */}
                        <section>
                            <h3 className="text-xs lg:text-sm font-black text-slate-900 uppercase tracking-tighter mb-4 lg:mb-6">1. Selectează Tipul de Plasă</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
                                {/* Type 1 - Vertical 1 canat */}
                                <button
                                    onClick={() => setMeshType("type1")}
                                    className={`p-4 lg:p-5 flex flex-col items-center gap-3 border-2 rounded-xl lg:rounded-2xl transition-all ${
                                        meshType === "type1" 
                                            ? "border-blue-600 bg-blue-50 shadow-lg" 
                                            : "border-slate-200 bg-white hover:border-slate-300"
                                    }`}
                                >
                                    <div className="w-full h-24 lg:h-28 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                                        {/* Placeholder pentru Type1.jpeg */}
                                        <div className="text-center">
                                            <svg className="w-8 h-8 lg:w-10 lg:h-10 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                            </svg>
                                            <p className="text-[8px] text-slate-400 mt-1">Vertical</p>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-[10px] lg:text-[11px] font-bold uppercase tracking-wide ${
                                            meshType === "type1" ? "text-blue-700" : "text-slate-700"
                                        }`}>
                                            Tip 1
                                        </p>
                                        <p className="text-[9px] lg:text-[10px] text-slate-500 mt-1">1 canat - Vertical</p>
                                    </div>
                                </button>

                                {/* Type 2 - Orizontal 1 canat */}
                                <button
                                    onClick={() => setMeshType("type2")}
                                    className={`p-4 lg:p-5 flex flex-col items-center gap-3 border-2 rounded-xl lg:rounded-2xl transition-all ${
                                        meshType === "type2" 
                                            ? "border-blue-600 bg-blue-50 shadow-lg" 
                                            : "border-slate-200 bg-white hover:border-slate-300"
                                    }`}
                                >
                                    <div className="w-full h-24 lg:h-28 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                                        {/* Placeholder pentru Type2.jpeg */}
                                        <div className="text-center">
                                            <svg className="w-8 h-8 lg:w-10 lg:h-10 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12M8 12h12M8 17h12M3 7h.01M3 12h.01M3 17h.01" />
                                            </svg>
                                            <p className="text-[8px] text-slate-400 mt-1">Orizontal</p>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-[10px] lg:text-[11px] font-bold uppercase tracking-wide ${
                                            meshType === "type2" ? "text-blue-700" : "text-slate-700"
                                        }`}>
                                            Tip 2
                                        </p>
                                        <p className="text-[9px] lg:text-[10px] text-slate-500 mt-1">1 canat - Orizontal</p>
                                    </div>
                                </button>

                                {/* Type 3 - 2 canate */}
                                <button
                                    onClick={() => setMeshType("type3")}
                                    className={`p-4 lg:p-5 flex flex-col items-center gap-3 border-2 rounded-xl lg:rounded-2xl transition-all ${
                                        meshType === "type3" 
                                            ? "border-blue-600 bg-blue-50 shadow-lg" 
                                            : "border-slate-200 bg-white hover:border-slate-300"
                                    }`}
                                >
                                    <div className="w-full h-24 lg:h-28 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                                        {/* Placeholder pentru Type3.jpeg */}
                                        <div className="text-center">
                                            <svg className="w-8 h-8 lg:w-10 lg:h-10 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                            </svg>
                                            <p className="text-[8px] text-slate-400 mt-1">2 canate</p>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-[10px] lg:text-[11px] font-bold uppercase tracking-wide ${
                                            meshType === "type3" ? "text-blue-700" : "text-slate-700"
                                        }`}>
                                            Tip 3
                                        </p>
                                        <p className="text-[9px] lg:text-[10px] text-slate-500 mt-1">2 canate</p>
                                    </div>
                                </button>
                            </div>
                        </section>

                        {/* PASUL 2: CONFIGURARE COTE */}
                        <section>
                            <div className="flex justify-between items-center mb-4 lg:mb-6">
                                <h3 className="text-xs lg:text-sm font-black text-slate-900 uppercase tracking-tighter">2. Configurare Cote</h3>
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
                            <h3 className="text-xs lg:text-sm font-black text-slate-900 uppercase tracking-tighter mb-4 lg:mb-6">3. Selecție Finisaj</h3>
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
                    <span className="text-[9px] text-slate-500 mt-0.5">
                        ({basePriceEur > 0 ? basePriceEur.toFixed(2) : "0.00"} EUR × {exchangeRate.toFixed(2)})
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
                    <div className="text-sm text-slate-500 mt-2">
                        {basePriceEur > 0 ? basePriceEur.toFixed(2) : "0.00"} EUR × {exchangeRate.toFixed(2)} curs
                    </div>
                </div>
                <button
                    onClick={handleAddToCart}
                    disabled={isSubmitting || calculatedPrice === 0}
                    className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.15em] text-xs transition-all shadow-xl hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                >
                    {isSubmitting ? "Se procesează..." : !user ? "Autentificare pentru Coș" : "Adaugă produsul în Coș"}
                </button>
            </div>

            {/* LOGO CLICK HANDLER (5 clicks → admin) - Colț stânga sus, fix */}
            <button 
                onClick={handleLogoClick}
                className="fixed top-4 left-4 z-40 p-2 rounded-lg hover:bg-slate-100/50 transition-all active:scale-95"
                aria-label="Logo"
            >
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white font-black text-sm lg:text-base">iP</span>
                </div>
            </button>

        </div>
    );
}