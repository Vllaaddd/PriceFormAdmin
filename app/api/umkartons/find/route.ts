import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const format = Number(searchParams.get("format"));
        const knife = searchParams.get("knife");
        const density = Number(searchParams.get("density"));

        const filters: any = {};
        if (format) filters.format = format;
        if (knife) filters.knife = knife;
        if (density) filters.density = density;  

        const bestUmkarton = await prisma.umkarton.findFirst({
            where: filters,
            include: {
                tierPrices: { include: { tier: true } }
            }
        });

        if (!bestUmkarton) {
            return NextResponse.json({
                "article": "This type of umkarton isn't available"
            }, { status: 200 });
        }

        return NextResponse.json(bestUmkarton);
    } catch (err) {
        console.error("Error finding umkarton:", err);
        return NextResponse.json({ error: "Failed to find umkarton" }, { status: 500 });
    }
}