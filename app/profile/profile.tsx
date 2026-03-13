"use client";
import { useEffect, useState, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const supabase = useMemo(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ), []);

    useEffect(() => {
        const fetchOrders = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/auth/login");
                return;
            }

            const { data, error } = await supabase
                .from("orders")
                .select("*")
                .eq("user_id", session.user.id)
                .neq("status", "pending") // Afișăm tot ce nu e în coș
                .order("created_at", { ascending: false });

            if (!error) setOrders(data || []);
            setLoading(false);
        };

        fetchOrders();
    }, [supabase, router]);

    if (loading) return <div className="pt-32 text-center">Se încarcă istoricul...</div>;

    return (
        <div className="min-h-screen bg-slate-50 pt-24 px-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-black mb-8">Istoric Comenzi</h1>
                {orders.length === 0 ? (
                    <p className="text-slate-500">Nu ai nicio comandă finalizată încă.</p>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold">{order.plisse_type}</p>
                                        <p className="text-xs text-slate-400">ID: {order.id.slice(0,8)}</p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                                        {order.status}
                                    </span>
                                </div>
                                <div className="mt-4 text-sm font-medium">
                                    Total: {order.price} RON
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}