import Link from "next/link";

export default function Home() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-white to-sky-100 px-4">

            {/* --- 1. TEXTURA DE PLASĂ (BUGNET PENTRU LIGHT THEME) --- */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none"></div>

            {/* --- 2. ANIMAȚII CSS PENTRU BUGS --- */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fly1 {
                    0% { transform: translate(0, 0) scale(1); opacity: 0; }
                    20% { opacity: 0.8; }
                    50% { transform: translate(150px, -100px) scale(1.2); }
                    80% { opacity: 0.8; }
                    100% { transform: translate(250px, 50px) scale(1); opacity: 0; }
                }
                @keyframes fly2 {
                    0% { transform: translate(0, 0) scale(1); opacity: 0; }
                    20% { opacity: 0.6; }
                    50% { transform: translate(-120px, 150px) scale(0.8); }
                    80% { opacity: 0.6; }
                    100% { transform: translate(-200px, -50px) scale(1); opacity: 0; }
                }
                @keyframes fly3 {
                    0% { transform: translate(0, 0) scale(1); opacity: 0; }
                    20% { opacity: 1; }
                    50% { transform: translate(80px, 200px) scale(1.5); }
                    80% { opacity: 1; }
                    100% { transform: translate(-50px, 100px) scale(1); opacity: 0; }
                }
                .bug-1 { animation: fly1 9s infinite ease-in-out; }
                .bug-2 { animation: fly2 13s infinite ease-in-out 2s; }
                .bug-3 { animation: fly3 11s infinite ease-in-out 4s; }
                .bug-4 { animation: fly1 14s infinite ease-in-out 1s reverse; }
                .bug-5 { animation: fly2 10s infinite ease-in-out 3s reverse; }
            `}} />

            {/* --- 3. PARTICULELE (GLOW BUGS - Nuanțe de Sky/Licurici) --- */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="bug-1 absolute top-[20%] left-[30%] w-1.5 h-1.5 bg-sky-400 rounded-full shadow-[0_0_10px_3px_rgba(56,189,248,0.6)]"></div>
                <div className="bug-2 absolute top-[60%] left-[70%] w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_8px_2px_rgba(96,165,250,0.6)]"></div>
                <div className="bug-3 absolute top-[40%] left-[50%] w-2 h-2 bg-yellow-300 rounded-full shadow-[0_0_12px_3px_rgba(253,224,71,0.6)]"></div>
                <div className="bug-4 absolute top-[80%] left-[20%] w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_8px_2px_rgba(129,140,248,0.6)]"></div>
                <div className="bug-5 absolute top-[30%] left-[80%] w-1 h-1 bg-sky-500 rounded-full shadow-[0_0_10px_2px_rgba(14,165,233,0.6)]"></div>
            </div>

            {/* Element de design decorativ (Holo effect) */}
            <div className="absolute top-[-10%] left-[-10%] h-[40rem] w-[40rem] rounded-full bg-sky-300/20 blur-3xl pointer-events-none z-0"></div>
            <div className="absolute bottom-[-10%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-blue-300/20 blur-3xl pointer-events-none z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center mt-8">
                <h1 className="mb-6 text-6xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">
                    Bun venit la{" "}
                    <span className="bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
            iPlisse
          </span>
                </h1>

                <p className="mb-10 max-w-xl text-lg text-slate-600 backdrop-blur-sm">
                    Platforma ta rapidă și sigură pentru comenzi. O experiență fluidă, creată pentru performanță.
                </p>

                <div className="flex flex-col gap-4 sm:flex-row">
                    <Link
                        href="/auth/register"
                        className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-sky-500/30 transition-all hover:scale-105 hover:shadow-sky-500/50"
                    >
                        <span>Creează Cont</span>
                    </Link>

                    <Link
                        href="/auth/login"
                        className="inline-flex items-center justify-center rounded-xl border-2 border-sky-100 bg-white/70 px-8 py-3.5 font-semibold text-slate-700 shadow-sm backdrop-blur-md transition-all hover:border-sky-200 hover:bg-white"
                    >
                        <span>Autentificare</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}