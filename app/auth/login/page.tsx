"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState<{ type: 'error' | 'success' | '', message: string }>({ type: '', message: '' });
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) router.push("/");
        };
        checkSession();
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ type: '', message: 'Se procesează...' });

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setStatus({ type: 'error', message: 'Email sau parolă incorectă.' });
        } else {
            setStatus({ type: 'success', message: 'Autentificare reușită! Se încarcă...' });
            router.push("/");
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-white to-sky-100 px-4">

            {/* Decor Holo */}
            <div className="absolute top-0 left-0 h-[30rem] w-[30rem] rounded-full bg-blue-200/30 blur-3xl"></div>

            <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/60 bg-white/70 p-8 shadow-xl shadow-sky-100/50 backdrop-blur-xl">
                <h1 className="mb-2 text-center text-3xl font-extrabold text-slate-800">
                    Autentificare
                </h1>
                <p className="mb-8 text-center text-slate-500">
                    Bine ai revenit pe <span className="font-semibold text-sky-500">iPlisse</span>
                </p>

                {status.message && (
                    <div className={`mb-6 rounded-xl p-4 text-sm font-medium ${status.type === 'error' ? 'border border-red-100 bg-red-50 text-red-600' : 'border border-sky-100 bg-sky-50 text-sky-600'}`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white/50 p-3.5 text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-400/10"
                            placeholder="nume@exemplu.ro"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Parolă</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white/50 p-3.5 text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-400/10"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" className="mt-2 w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 p-3.5 font-semibold text-white shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02] hover:shadow-sky-500/40 active:scale-[0.98]">
                        Intră în cont
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-500">
                    Nu ai cont? <Link href="/auth/register" className="font-semibold text-sky-600 transition-colors hover:text-sky-500 hover:underline">Înregistrează-te aici</Link>
                </p>
            </div>
        </div>
    );
}