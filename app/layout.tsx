import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
    title: "iPlisse | Platformă Comenzi",
    description: "Platforma iPlisse",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ro">
        <body className="antialiased text-slate-800 bg-sky-50">

        <header className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-md border-b border-white/40 shadow-sm">
            <nav className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
                <Link
                    href="/"
                    className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent drop-shadow-sm transition-transform hover:scale-105"
                >
                    iPlisse
                </Link>

                <div id="user-menu" className="flex items-center gap-4">
                    <Link
                        href="/auth/login"
                        className="text-sm font-semibold text-slate-600 transition-colors hover:text-sky-600">
                        Autentificare
                    </Link>
                    <Link
                        href="/auth/register"
                        className="text-sm font-semibold text-slate-600 transition-colors hover:text-sky-600">
                        Înregistrează-te
                    </Link>
                </div>
            </nav>
        </header>

        <main className="flex min-h-screen flex-col">
            {children}
        </main>

        {/* Footer */}
        <footer className="relative z-20 border-t border-slate-200 bg-white/80 backdrop-blur-sm p-6 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} iPlisse. Toate drepturile rezervate.
        </footer>

        </body>
        </html>
    );
}