import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

interface BNMValute {
    CharCode: string;
    Nominal: number;
    Value: number;
}

export async function GET() {
    try {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const yyyy = today.getFullYear();
        const dateParam = `${dd}.${mm}.${yyyy}`;

        const res = await fetch(
            `https://www.bnm.md/ro/official_exchange_rates?get_xml=1&date=${dateParam}`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) throw new Error("BNM API unreachable");

        const xmlData = await res.text();

        const parser = new XMLParser({
            ignoreAttributes: false,
            parseTagValue: false, // Keep values as strings so Number() doesn't fail
        });

        const parsed = parser.parse(xmlData);
        const valutes: BNMValute[] = parsed?.ValCurs?.Valute || [];

        const rawRates: Record<string, number> = { MDL: 1.0 };

        valutes.forEach((v: any) => {
            // Replaces comma decimal separators if present
            const val = parseFloat(String(v.Value).replace(",", "."));
            const nom = parseFloat(String(v.Nominal).replace(",", "."));
            if (v.CharCode && !isNaN(val) && !isNaN(nom) && nom > 0) {
                rawRates[v.CharCode] = val / nom;
            }
        });

        const eurInMdl = rawRates["EUR"];

        return NextResponse.json({
            success: true,
            date: parsed.ValCurs["@_Date"],
            rates: {
                EUR: 1.0,
                MDL: eurInMdl,
                RON: eurInMdl / rawRates["RON"],
                USD: eurInMdl / rawRates["USD"],
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            {success: false, error: error.message},
            {status: 500} as any
        );
    }
}