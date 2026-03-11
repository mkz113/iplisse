import Link from "next/link";

export default function Home() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-white to-sky-100 px-4">

            {/* Element de design decorativ (Holo effect) */}
            <div className="absolute top-[-10%] left-[-10%] h-[40rem] w-[40rem] rounded-full bg-sky-300/20 blur-3xl"></div>
            <div className="absolute bottom-[-10%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-blue-300/20 blur-3xl"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
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