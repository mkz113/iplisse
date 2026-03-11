import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar"; // Sau calea corectă către fișier

export const metadata: Metadata = {
    title: "iPlisse | Platformă Comenzi",
    description: "Sisteme profesionale de plase și jaluzele plisate",
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
            <Navbar />
        </header>

        {/* Padding-top pt header fixat */}
        <main className="flex min-h-screen flex-col pt-16">
            {children}
        </main>

        <footer className="relative z-20 border-t border-slate-200 bg-white/80 backdrop-blur-sm p-6 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} iPlisse. Toate drepturile rezervate.
        </footer>

        </body>
        </html>
    );
}