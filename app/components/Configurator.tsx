"use client";

import { useState, useEffect } from "react";

interface ConfiguratorProps {
    user: any;
    onCalculate: () => void;
    loading: boolean;
    price: number | null;
}

export default function Configurator({ user, onCalculate, loading, price }: ConfiguratorProps) {
    const [unit, setUnit] = useState<"mm" | "cm" | "m">("mm");
    const [rawWidth, setRawWidth] = useState<string>("1200");
    const [rawHeight, setRawHeight] = useState<string>("1500");
    const [frameColor, setFrameColor] = useState<string>("Antracit (RAL 7016)");
    const [viewMode, setViewMode] = useState<"2D" | "3D">("2D");
    const [openLevel, setOpenLevel] = useState<number>(70);
    const [plisseType, setPlisseType] = useState<string>("Plisse Orizontal");

    // Curăță inputul (permite doar cifre, elimină zerourile initiale)
    const handleInputChange = (val: string, type: "w" | "h") => {
        const cleanVal = val.replace(/[^0-9]/g, "").replace(/^0+/, "") || "0";
        if (type === "w") setRawWidth(cleanVal);
        else setRawHeight(cleanVal);
    };

    // Determină tipul plisse în funcție de înălțime
    useEffect(() => {
        const h = Number(rawHeight);
        if (h > 2200) setPlisseType("Plisse XL Orizontal");
        else if (h < 800) setPlisseType("Plisse Vertical");
        else setPlisseType("Plisse Orizontal");
    }, [rawHeight]);

    // Conversie la mm pentru calcule
    const convertToMm = (val: string, u: string) => {
        const n = Number(val);
        if (u === "cm") return n * 10;
        if (u === "m") return n * 1000;
        return n;
    };

    const wMm = Math.round(convertToMm(rawWidth, unit));
    const hMm = Math.round(convertToMm(rawHeight, unit));
    const scale = Math.min(240 / Math.max(wMm, 1), 240 / Math.max(hMm, 1));

    const colorMap: Record<string, string> = {
        "Antracit (RAL 7016)": "#373e47",
        "Alb (RAL 9016)": "#ffffff",
        "Maro (RAL 8017)": "#4a3028",
    };

    const getFrameStyling = () => {
        const hex = colorMap[frameColor];
        return {
            backgroundColor: hex,
            borderColor: hex === "#ffffff" ? "#cbd5e1" : "rgba(0,0,0,0.2)",
            boxShadow: "0 0 15px rgba(0,0,0,0.1)",
        };
    };

    return (
        <div className="bg-white border border-slate-200 shadow-2xl max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-3xl transition-all">
            {/* STÂNGA: Configurare */}
            <div className="lg:col-span-7 p-8 md:p-12 bg-white">
                <div className="space-y-10">
                    <section>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">
                                1. Configurare Cote
                            </h3>
                            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
                                {["mm", "cm", "m"].map((u) => (
                                    <button
                                        key={u}
                                        onClick={() => setUnit(u as any)}
                                        className={`text-[11px] font-bold uppercase px-4 py-1.5 rounded-lg transition-all ${
                                            unit === u
                                                ? "bg-white shadow-md text-blue-600"
                                                : "text-slate-400"
                                        }`}
                                    >
                                        {u}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2 block tracking-widest">
                                    Lățime Gol
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={rawWidth}
                                    onChange={(e) => handleInputChange(e.target.value, "w")}
                                    className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-blue-600 bg-slate-50/50 outline-none font-mono text-lg transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2 block tracking-widest">
                                    Înălțime Gol
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={rawHeight}
                                    onChange={(e) => handleInputChange(e.target.value, "h")}
                                    className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-blue-600 bg-slate-50/50 outline-none font-mono text-lg transition-all"
                                />
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter mb-6">
                            2. Selecție Finisaj RAL
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {Object.keys(colorMap).map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setFrameColor(c)}
                                    className={`group relative p-4 flex items-center gap-3 border-2 rounded-2xl transition-all ${
                                        frameColor === c
                                            ? "border-blue-600 bg-blue-50/50 shadow-sm"
                                            : "border-slate-100 hover:border-slate-200"
                                    }`}
                                >
                  <span
                      className="w-6 h-6 rounded-full border border-black/10 shadow-inner"
                      style={{ backgroundColor: colorMap[c] }}
                  />
                                    <span
                                        className={`text-[11px] font-bold ${
                                            frameColor === c ? "text-blue-700" : "text-slate-500"
                                        }`}
                                    >
                    {c}
                  </span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100/50">
                        <h4 className="text-[10px] font-black text-blue-400 uppercase mb-4 tracking-[0.2em]">
                            Sumar Producție
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-[11px] font-bold">
                            <p className="text-slate-600 italic">
                                Suprafață:{" "}
                                <span className="text-slate-900 not-italic">
                  {(wMm * hMm) / 1000000} m²
                </span>
                            </p>
                            <p className="text-slate-600 italic">
                                Tip:{" "}
                                <span className="text-slate-900 not-italic uppercase tracking-tight">
                  {plisseType}
                </span>
                            </p>
                        </div>
                    </section>
                </div>
            </div>

            {/* DREAPTA: Previzualizare și Preț */}
            <div className="lg:col-span-5 bg-slate-100 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden border-l border-slate-200">
                {/* Efect de iluminare de fundal */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-white to-slate-200 opacity-50 z-0" />

                <div className="relative z-10 flex justify-between items-center mb-8">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Simulare Reală
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode("2D")}
                            className={`text-[9px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                                viewMode === "2D"
                                    ? "bg-slate-800 text-white border-slate-800"
                                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            2D
                        </button>
                        <button
                            onClick={() => setViewMode("3D")}
                            className={`text-[9px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                                viewMode === "3D"
                                    ? "bg-slate-800 text-white border-slate-800"
                                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            3D
                        </button>
                    </div>
                </div>

                {/* Vizualizator plisă */}
                <div
                    className="relative z-10 w-full h-[320px] flex flex-col items-center justify-center rounded-3xl bg-white border border-slate-300 shadow-xl overflow-hidden"
                    style={{ perspective: "1500px" }}
                >
                    {/* Liniile interioare ale ferestrei (geam) */}
                    <div className="absolute inset-0 bg-slate-50 flex items-center justify-center opacity-40">
                        <div className="w-full h-1 bg-slate-200 absolute top-1/2 -translate-y-1/2 shadow-sm" />
                        <div className="h-full w-1 bg-slate-200 absolute left-1/2 -translate-x-1/2 shadow-sm" />
                    </div>

                    <div
                        className="relative transition-all duration-1000 ease-out border-[14px]"
                        style={{
                            ...getFrameStyling(),
                            width: `${wMm * scale}px`,
                            height: `${hMm * scale}px`,
                            transform:
                                viewMode === "3D" ? "rotateX(15deg) rotateY(-20deg)" : "none",
                        }}
                    >
                        {/* Mesh plisat (acordeon) */}
                        <div
                            className="absolute left-0 h-full overflow-hidden transition-all duration-100 ease-linear border-r-[10px]"
                            style={{
                                width: `${openLevel}%`,
                                borderColor: colorMap[frameColor],
                                background: `repeating-linear-gradient(to right, 
                  rgba(0,0,0,0.1) 0px, 
                  rgba(0,0,0,0.3) 4px, 
                  rgba(0,0,0,0.1) 8px)`,
                            }}
                        >
                            <div className="w-full h-full opacity-30 bg-[radial-gradient(circle,#000_1px,transparent_1px)] bg-[size:3px_3px]" />
                        </div>

                        {/* Fire de ghidaj subtile */}
                        <div className="absolute top-1/4 left-0 w-full h-[1px] bg-black/10" />
                        <div className="absolute bottom-1/4 left-0 w-full h-[1px] bg-black/10" />
                    </div>

                    <div className="absolute bottom-4 text-[9px] font-bold text-slate-400 bg-white/80 px-2 py-1 rounded">
                        Glisează sliderul pentru operare
                    </div>
                </div>

                {/* Slider pentru nivelul de deschidere */}
                <div className="relative z-10 mt-6 flex flex-col items-center">
                    <input
                        type="range"
                        min="5"
                        max="95"
                        value={openLevel}
                        onChange={(e) => setOpenLevel(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                {/* Preț și buton de acțiune */}
                <div className="relative z-10 mt-8 space-y-5">
                    <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                        <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Preț Final (TVA inclus)
              </span>
                            <span className="text-5xl font-black text-slate-900 tracking-tighter">
                {price ? `${price.toFixed(2)}` : "---"}
                                <span className="text-lg ml-1 text-blue-600 font-bold">RON</span>
              </span>
                        </div>
                    </div>
                    <button
                        onClick={onCalculate}
                        disabled={loading}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.15em] text-xs transition-all shadow-xl ${
                            loading
                                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200 active:scale-95 shadow-blue-500/20"
                        }`}
                    >
                        {loading
                            ? "Se trimite cererea..."
                            : user
                                ? "Adaugă în Coș"
                                : "Autentificare pentru preț"}
                    </button>
                </div>
            </div>
        </div>
    );
}