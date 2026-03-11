"use client";

import { useEffect, useState, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CartPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const supabase = useMemo(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ), []);

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push("/auth/login");
            return;
        }

        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .eq("user_id", session.user.id)
            .eq("status", "pending")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setOrders(data);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        setProcessingId(id);
        const { error } = await supabase.from("orders").delete().eq("id", id);
        if (!error) {
            setOrders(prev => prev.filter(o => o.id !== id));
        } else {
            alert("Eroare la ștergere.");
        }
        setProcessingId(null);
    };

    const handleCheckout = async () => {
        // Aici va fi logica de plată (ex: Stripe) sau trimiterea confirmării
        // Deocamdată le trecem în status 'processing'
        setLoading(true);
        const { error } = await supabase
            .from("orders")
            .update({ status: 'processing' })
            .in('id', orders.map(o => o.id));

        if (!error) {
            router.push("/profile?success=true");
        } else {
            alert("Eroare la procesarea comenzii.");
            setLoading(false);
        }
    };

    const total = orders.reduce((sum, order) => sum + Number(order.price), 0);

    if (loading) return <div className="min-h-screen pt-32 text-center">Se încarcă coșul...</div>;

    return (
        <div className="min-h-screen bg-sky-50 pt-24 pb-12 px-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-black text-slate-900 mb-8">Coșul tău de cumpărături</h1>

                {orders.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
                        <p className="text-slate-500 mb-6">Coșul tău este gol.</p>
                        <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                            Întoarce-te la Configurator
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-4">
                            {orders.map(order => (
                                <div key={order.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-slate-800">{order.plisse_type}</h3>
                                        <p className="text-sm text-slate-500">
                                            {order.width} x {order.height} mm • {order.frame_color}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className="font-black text-lg">{order.price} RON</span>
                                        <button
                                            onClick={() => handleDelete(order.id)}
                                            disabled={processingId === order.id}
                                            className="text-red-500 hover:text-red-700 text-sm font-bold disabled:opacity-50"
                                        >
                                            {processingId === order.id ? '...' : 'Șterge'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit sticky top-24">
                            <h3 className="font-bold text-lg mb-4 border-b border-slate-100 pb-4">Sumar Comandă</h3>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-slate-500">Total:</span>
                                <span className="text-2xl font-black text-slate-900">{total.toFixed(2)} RON</span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                            >
                                Finalizează Comanda
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}