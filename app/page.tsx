"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase/client"; // Asigură-te că calea este corectă
import { useRouter } from "next/navigation";

export default function ConstructorPlisse() {
    // --- 1. STATE-URI FRONTEND ---
    const [unit, setUnit] = useState<"mm" | "cm" | "m">("mm");
    const [rawWidth, setRawWidth] = useState<number>(1200);
    const [rawHeight, setRawHeight] = useState<number>(1500);
    const [frameColor, setFrameColor] = useState<string>("Antracit (RAL 7016)");
    const [meshType, setMeshType] = useState<string>("Standard Gri");

    const [viewMode, setViewMode] = useState<"2D" | "3D">("2D");
    const [price, setPrice] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Auth State
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    // Verificăm dacă user-ul este logat
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };
        checkUser();

        // Ascultăm schimbările de stare (login/logout) în timp real
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // --- 2. MOTOR DE CONVERSIE ---
    const convertToMm = (value: number, currentUnit: string) => {
        switch (currentUnit) {
            case "cm": return value * 10;
            case "m": return value * 1000;
            default: return value;
        }
    };

    const widthMm = Math.round(convertToMm(rawWidth, unit));
    const heightMm = Math.round(convertToMm(rawHeight, unit));

    // --- 3. LOGICĂ VIZUALIZATOR ---
    const maxVisualSize = 240;
    const scale = Math.min(maxVisualSize / Math.max(widthMm, 1), maxVisualSize / Math.max(heightMm, 1));

    const visualWidth = widthMm * scale;
    const visualHeight = heightMm * scale;

    const getFrameStyling = () => {
        switch (frameColor) {
            case "Antracit (RAL 7016)":
                return { background: "linear-gradient(135deg, #373e47 0%, #2b3038 100%)", borderColor: "#1e2229" };
            case "Alb (RAL 9016)":
                return { background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)", borderColor: "#dee2e6" };
            case "Maro (RAL 8017)":
                return { background: "linear-gradient(135deg, #4a3028 0%, #36221c 100%)", borderColor: "#241612" };
            default: return {};
        }
    };

    // --- 4. CALCUL PREȚ / REDIRECȚIONARE LOGIN ---
    const handleCalculate = () => {
        // Dacă nu e logat, îl trimitem la pagina de login
        if (!user) {
            router.push("/auth/login");
            return;
        }

        setLoading(true);

        // Aici va veni logica reală de calcul din Excel
        setTimeout(() => {
            const areaSqm = (widthMm * heightMm) / 1000000;
            let basePrice = Math.max(areaSqm * 45, 30);

            if (meshType === "Fibră Sticlă (Anti-Pisică)") basePrice *= 1.2;

            setPrice(basePrice);
            setLoading(false);
        }, 600);
    };
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-10 flex justify-center items-center">
            <div className="bg-white border border-slate-200 shadow-xl max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-xl">

                {/* === COLOANA STÂNGĂ: Specificații === */}
                <div className="lg:col-span-7 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-slate-200 z-10 bg-white">
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Configurator Plisse</h1>
                        <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest">Sisteme Premium de culisare</p>
                    </div>

                    <div className="space-y-8">

                        {/* 1. Dimensiuni */}
                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">1. Dimensiuni Gol</h3>
                                <div className="flex bg-slate-100 p-1 rounded-md border border-slate-200">
                                    {(["mm", "cm", "m"] as const).map((u) => (
                                        <button
                                            key={u}
                                            onClick={() => setUnit(u)}
                                            className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 transition-all rounded-sm ${unit === u ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            {u}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">LĂȚIME ({unit.toUpperCase()})</label>
                                    <input
                                        type="number" value={rawWidth} onChange={(e) => setRawWidth(Number(e.target.value))}
                                        className="w-full border border-slate-300 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">ÎNĂLȚIME ({unit.toUpperCase()})</label>
                                    <input
                                        type="number" value={rawHeight} onChange={(e) => setRawHeight(Number(e.target.value))}
                                        className="w-full border border-slate-300 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Culoare Profil */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">2. Culoare Profil (RAL)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {["Antracit (RAL 7016)", "Alb (RAL 9016)", "Maro (RAL 8017)"].map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setFrameColor(color)}
                                        className={`p-3 text-sm font-medium border rounded-lg transition-all ${frameColor === color ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Tip Plasă */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">3. Tip Plasă</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {["Standard Gri", "Fibră Sticlă (Anti-Pisică)"].map((mesh) => (
                                    <button
                                        key={mesh}
                                        onClick={() => setMeshType(mesh)}
                                        className={`p-3 text-left border rounded-lg transition-all ${meshType === mesh ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-200 hover:border-slate-300'}`}
                                    >
                                        <div className={`text-sm font-bold ${meshType === mesh ? 'text-blue-700' : 'text-slate-700'}`}>{mesh}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* --- SECȚIUNEA VIDEO --- */}
                        <div className="pt-6 border-t border-slate-100">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Ghiduri Video Integrare</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button className="flex items-center justify-center gap-2 p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors">
                                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                    Cum se strânge / pliază
                                </button>
                                <button className="flex items-center justify-center gap-2 p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors">
                                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                    Ghid de instalare
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* === COLOANA DREAPTĂ: Randare & Preț === */}
                <div className="lg:col-span-5 bg-slate-50 p-8 md:p-12 flex flex-col justify-between border-l border-slate-200">
                    <div>
                        <div className="flex justify-between items-end mb-6">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vizualizare Sistem</h3>

                            {/* 3D / 2D Toggle Switch */}
                            <div className="flex bg-slate-200 p-1 rounded-md">
                                <button
                                    onClick={() => setViewMode("2D")}
                                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 transition-all rounded-sm ${viewMode === "2D" ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                                >Plan 2D</button>
                                <button
                                    onClick={() => setViewMode("3D")}
                                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 transition-all rounded-sm ${viewMode === "3D" ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                                >3D Iso</button>
                            </div>
                        </div>

                        {/* --- Vizualizatorul 2.5D --- */}
                        <div
                            className="w-full h-[360px] bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden p-8"
                            style={{ perspective: "1000px" }}
                        >
                            <div className="absolute top-4 left-6 text-[10px] text-slate-400 font-mono tracking-widest uppercase z-0">
                                L: {rawWidth} {unit}
                            </div>
                            <div className="absolute left-[-20px] top-1/2 -rotate-90 text-[10px] text-slate-400 font-mono tracking-widest uppercase z-0">
                                H: {rawHeight} {unit}
                            </div>

                            {/* Rama exterioară */}
                            <div
                                className={`relative flex transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] border-[12px] z-10`}
                                style={{
                                    ...getFrameStyling(),
                                    width: `${Math.max(visualWidth, 60)}px`,
                                    height: `${Math.max(visualHeight, 60)}px`,
                                    transform: viewMode === "3D" ? "rotateX(15deg) rotateY(-25deg) scale(0.9)" : "rotateX(0deg) rotateY(0deg) scale(1)",
                                    boxShadow: viewMode === "3D" ? "20px 20px 30px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.1)" : "0 10px 15px -3px rgba(0,0,0,0.1)",
                                }}
                            >

                                {/* Iluzie de adâncime 3D */}
                                <div className={`absolute -right-[12px] top-0 w-[12px] h-full transition-opacity duration-300 ${viewMode === "3D" ? "opacity-100" : "opacity-0"}`} style={{ backgroundColor: 'rgba(0,0,0,0.3)', transform: 'skewY(45deg)', transformOrigin: 'left' }}></div>
                                <div className={`absolute left-0 -bottom-[12px] w-full h-[12px] transition-opacity duration-300 ${viewMode === "3D" ? "opacity-100" : "opacity-0"}`} style={{ backgroundColor: 'rgba(0,0,0,0.5)', transform: 'skewX(45deg)', transformOrigin: 'top' }}></div>

                                {/* Plasa tip Plisse (Jumătate deschisă) */}
                                <div className="relative w-1/2 h-full border-r-[8px] border-black/40 shadow-[2px_0_10px_rgba(0,0,0,0.3)] z-20 flex" style={{...getFrameStyling()}}>
                                    <div className="w-full h-full opacity-80" style={{
                                        background: "repeating-linear-gradient(to right, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.6) 4px, rgba(0,0,0,0.2) 8px)"
                                    }}></div>
                                </div>

                                {/* Spațiul gol (pe unde treci) */}
                                <div className="w-1/2 h-full bg-transparent"></div>
                            </div>

                        </div>
                    </div>

                    <div className="space-y-4 pt-8">
                        <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estimare Cost</span>
                            <span className="text-4xl font-extrabold text-blue-600 tracking-tight">
                {price ? `${price.toFixed(2)} RON` : "---"}
              </span>
                        </div>

                        <button
                            onClick={handleCalculate}
                            disabled={loading}
                            className={`w-full py-4 px-4 text-sm font-bold uppercase tracking-widest transition-all rounded-xl shadow-lg ${loading ? 'bg-blue-300 text-blue-50 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/30 hover:-translate-y-1'}`}
                        >
                            {loading ? "Se calculează..." : "Calculează Preț"}
                        </button>
                    </div>
                </div>

            </div>
        </main>
    );
}