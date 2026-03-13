"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const [user, setUser] = useState<any>(null);
    const [cartCount, setCartCount] = useState<number>(0);
    const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true); // ✨ Previne flash-ul de UI
    const router = useRouter();

    // 1. Funcția izolată pentru citirea coșului
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

    // 2. Gestionarea sesiunii de bază
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

    // 3. Gestionarea Canalului Realtime, legată STRICT de ID-ul utilizatorului activ
    useEffect(() => {
        if (!user?.id) {
            setCartCount(0);
            return;
        }

        // Aducem valoarea inițială imediat după login
        fetchCartCount(user.id);

        // Activăm ascultătorul (Realtime)
        const channel = supabase.channel(`cart_updates_${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // Ascultă INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'orders',
                    filter: `user_id=eq.${user.id}`
                },
                () => {
                    fetchCartCount(user.id);
                }
            )
            .subscribe();

        // Facem clean-up la delogare sau schimbare de cont
        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, fetchCartCount]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setCartCount(0);
        router.refresh();
        router.push("/");
    };

    // Helper pentru inițiala numelui
    const getInitial = () => {
        const name = user?.user_metadata?.nickname || user?.email || "?";
        return name.charAt(0).toUpperCase();
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
            <div id="user-menu" className="flex items-center gap-4">
                {isAuthLoading ? (
                    // Skeleton UI - Se afișează scurt cât timp verificăm sesiunea
                    <div className="flex gap-3 animate-pulse items-center">
                        <div className="w-20 h-8 bg-slate-200 rounded-lg"></div>
                        <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                    </div>
                ) : !user ? (
                    // UI Delogat
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
                    // UI Logat
                    <div className="flex items-center gap-3 sm:gap-5">

                        {/* Buton Coș (Cart) cu Badge Dinamic */}
                        <Link
                            href="/cart"
                            className="text-slate-500 hover:text-blue-600 transition-all relative group p-2 rounded-full hover:bg-blue-50"
                            aria-label="Coșul meu"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                            </svg>

                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Profil Utilizator Clickable */}
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

                        {/* Buton Ieșire Minimal */}
                        <button
                            onClick={handleSignOut}
                            className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors cursor-pointer bg-slate-50 hover:bg-red-50 px-3 py-2 rounded-full border border-slate-100 hover:border-red-100"
                        >
                            Ieșire
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}