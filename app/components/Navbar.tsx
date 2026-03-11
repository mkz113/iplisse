"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client"; // Verifică dacă calea e corectă (@/lib sau ../lib)
import { useRouter } from "next/navigation";

export default function Navbar() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        // Luăm sesiunea inițială
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        getSession();

        // Ascultăm schimbările de login/logout
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh(); // Reîmprospătează datele de pe pagină
        router.push("/");
    };

    return (
        <nav className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
            <Link
                href="/"
                className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent drop-shadow-sm transition-transform hover:scale-105"
            >
                iPlisse
            </Link>

            <div id="user-menu" className="flex items-center gap-4">
                {!user ? (
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
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-slate-500 hidden sm:inline">
                            Salut, {user.email?.split('@')[0]}
                        </span>
                        <button
                            onClick={handleSignOut}
                            className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                        >
                            Ieșire
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}