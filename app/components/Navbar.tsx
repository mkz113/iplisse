"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, JSX } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const [user, setUser] = useState<any>(null);
    const [cartCount, setCartCount] = useState<number>(0);
    const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
    const router = useRouter();
    const [lang, setLang] = useState<"RO" | "RU">("RO");
    const [isLangOpen, setIsLangOpen] = useState<boolean>(false);

// Block langSwitch
    useEffect(() => {
        const savedLang = localStorage.getItem("iplisse_lang") as "RO" | "RU";
        if (savedLang) {
            setLang(savedLang);
        }
    }, []);
    const selectLanguage = (newLang: "RO" | "RU") => {
        setLang(newLang);
        localStorage.setItem("iplisse_lang", newLang);
        setIsLangOpen(false); // Închidem pop-up-ul după selecție

        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("lang:changed", { detail: { lang: newLang } }));
        }
    };


    // 1. Preluarea numărului de produse din coș
    const fetchCartCount = useCallback(async (userId: string) => {
        const { count, error } = await supabase
            .from("orders")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", userId)
            .eq("status", "pending");

        if (!error && count !== null) {
            setCartCount(count);
        }
    }, []);

    // 2. Sesiunea de utilizator
    useEffect(() => {
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setIsAuthLoading(false);
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setIsAuthLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // 3. Ascultătorul local instant (Eveniment "cart:changed")
    useEffect(() => {
        if (!user?.id) {
            setCartCount(0);
            return;
        }

        fetchCartCount(user.id);

        const handleLocalCartChange = (e: Event) => {
            const { delta } = (e as CustomEvent<{ delta?: number }>).detail || {};
            setCartCount(prev => Math.max(0, prev + (delta ?? 0)));
        };

        window.addEventListener("cart:changed", handleLocalCartChange);

        return () => {
            window.removeEventListener("cart:changed", handleLocalCartChange);
        };
    }, [user?.id, fetchCartCount]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setCartCount(0);
        router.refresh();
        router.push("/");
    };

    const getInitial = () => {
        const name = user?.user_metadata?.nickname || user?.email || "?";
        return name.charAt(0).toUpperCase();
    };

    // Funcție dedicată de randare a badge-ului (Rezolvă 100% eroarea JSX/TypeScript)
    const renderCartBadge = (): JSX.Element => {
        if (cartCount <= 0) return <></>;
        return (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">
                {cartCount}
            </span>
        );
    };

    return (
        <nav className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
            {/* Logo */}
            <Link
                href="/"
                className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent drop-shadow-sm transition-transform hover:scale-105"
            >
                iPlisse
            </Link>

            {/* Meniu Utilizator */}
            <div id="user-menu" className="flex items-center gap-3 sm:gap-4">

                {/* 1. ZONA UTILIZATOR (Auth / Coș / Profil / Ieșire) */}
                {isAuthLoading ? (
                    <div className="flex gap-3 animate-pulse items-center">
                        <div className="w-20 h-8 bg-slate-200 rounded-lg"></div>
                        <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                    </div>
                ) : !user ? (
                    <>
                        <Link
                            href="/auth/login"
                            className="text-sm font-semibold text-slate-600 transition-colors hover:text-sky-600">
                            Autentificare
                        </Link>
                        <Link
                            href="/auth/register"
                            className="text-[13px] font-bold bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-all shadow-md shadow-sky-200">
                            Cont Nou
                        </Link>
                    </>
                ) : (
                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Coș cu badge dinamic */}
                        <Link
                            href="/cart"
                            className="text-slate-500 hover:text-blue-600 transition-all relative group p-2 rounded-full hover:bg-blue-50"
                            aria-label="Coșul meu"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                            </svg>

                            {renderCartBadge()}
                        </Link>

                        {/* Profil */}
                        <Link
                            href="/profile"
                            className="text-xs font-bold text-slate-600 hidden sm:flex items-center gap-2 hover:text-blue-600 transition-colors bg-slate-50 hover:bg-blue-50 px-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-200"
                            title="Vezi Profilul și Istoricul"
                        >
                            <div className="w-6 h-6 bg-gradient-to-tr from-blue-500 to-sky-400 rounded-full flex items-center justify-center text-white text-[11px] shadow-sm">
                                {getInitial()}
                            </div>
                            <span className="pr-2">{user?.user_metadata?.nickname || user.email?.split('@')[0]}</span>
                        </Link>

                        {/* Ieșire */}
                        <button
                            onClick={handleSignOut}
                            className="text-xs font-bold text-slate-600 hover:text-red-600 transition-colors cursor-pointer bg-slate-50 hover:bg-red-50 px-3 py-2 rounded-full border border-slate-200 hover:border-red-100"                        >
                            Ieșire
                        </button>
                    </div>
                )}

                {/* Separator vertical discret */}
                <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

                {/* 2. SWITCHER LIMBĂ */}
                <div className="relative">
                    <button
                        onClick={() => setIsLangOpen(!isLangOpen)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-600 shadow-sm active:scale-95"
                        aria-label="Selectează limba"
                        title="Schimbă limba / Сменить язык"
                    >
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 014-9z" />
                        </svg>
                        <span className="text-[11px] font-black text-slate-700 uppercase">{lang}</span>
                        <svg className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isLangOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Pop-up Dropdown */}
                    {isLangOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />

                            <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-200/80 rounded-2xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150">
                                <button
                                    onClick={() => selectLanguage("RO")}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                                        lang === "RO" ? "bg-sky-50 text-sky-600" : "text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    <span>🇷🇴 Română</span>
                                    {lang === "RO" && <span className="text-sky-600 text-[10px]">✓</span>}
                                </button>

                                <button
                                    onClick={() => selectLanguage("RU")}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                                        lang === "RU" ? "bg-sky-50 text-sky-600" : "text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    <span>🇷🇺 Русский</span>
                                    {lang === "RU" && <span className="text-sky-600 text-[10px]">✓</span>}
                                </button>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </nav>
    );
}