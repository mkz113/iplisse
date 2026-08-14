import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

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
        <body className="antialiased text-slate-800 bg-sky-50 min-h-screen flex flex-col">

        <header className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-md border-b border-white/40 shadow-sm">
            <Navbar />
        </header>
        <main className="flex-1 pt-16">
            {children}
        </main>

        <Footer />

        </body>
        </html>
    );
}