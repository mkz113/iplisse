"use client";

import { useLanguage } from "@/lib/i18n";

export default function Footer() {
    const { t } = useLanguage();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative z-20 border-t border-slate-200 bg-white/80 backdrop-blur-sm p-8 text-center flex flex-col items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-10 text-sm font-medium text-slate-600">
                <a
                    href="https://wa.me/40750424228"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-green-600 transition-colors group"
                >
                    <svg className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12.031 2.016a9.96 9.96 0 00-8.528 15.112l-1.488 5.438 5.561-1.46a9.957 9.957 0 004.455 1.05h.004c5.498 0 9.966-4.468 9.966-9.966a9.969 9.969 0 00-2.92-7.048 9.966 9.966 0 00-7.05-2.926zm0 18.257h-.003a8.27 8.27 0 01-4.214-1.214l-.302-.178-3.13.823.839-3.053-.196-.312A8.252 8.252 0 013.73 11.982c0-4.562 3.712-8.275 8.274-8.275a8.268 8.268 0 015.852 2.427 8.266 8.266 0 012.425 5.85c0 4.563-3.712 8.275-8.275 8.275zm4.536-6.19c-.248-.125-1.472-.73-1.699-.813-.228-.084-.393-.125-.56.124-.165.25-.642.813-.785.98-.145.166-.289.187-.538.061-.249-.124-1.05-.386-2-1.23-.74-.658-1.24-1.471-1.385-1.72-.145-.25-.015-.385.11-.508.113-.11.249-.292.373-.438.125-.145.166-.25.25-.416.082-.167.042-.313-.02-.438-.063-.125-.56-1.352-.767-1.85-.201-.482-.405-.417-.56-.425h-.478c-.165 0-.435.063-.662.313-.228.25-.87.854-.87 2.083s.891 2.417 1.015 2.584c.125.166 1.762 2.688 4.27 3.77 1.545.666 2.148.718 2.923.603.854-.127 2.607-1.063 2.978-2.084.373-1.021.373-1.896.262-2.084-.112-.187-.414-.291-.663-.416z" clipRule="evenodd" />
                    </svg>
                    +40 750 424 228
                </a>
                <a
                    href="mailto:iplisse@proton.me"
                    className="flex items-center gap-2 hover:text-blue-600 transition-colors group"
                >
                    <svg className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    iplisse@proton.me
                </a>
            </div>

            <div className="text-xs text-slate-400">
                &copy; {currentYear} iPlisse. {t.allRightsReserved}
            </div>
        </footer>
    );
}