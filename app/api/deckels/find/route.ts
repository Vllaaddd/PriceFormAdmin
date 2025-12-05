import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const article = searchParams.get("article");
        const price = Number(searchParams.get("length")) + 8;

        const filters: any = {};
        if (article) filters.article = article;
        if (price) filters.price = { gte: price };

        const bestDeckel = await prisma.deckel.findFirst({
            where: filters,
            orderBy: { price: "asc" },
        });

        if (!bestDeckel) {
            return NextResponse.json({ "type": "No suitable deckel found", "price": 0 }, { status: 200 });
        }

        return NextResponse.json(bestDeckel);
    } catch (err) {
        console.error("Error finding deckel:", err);
        return NextResponse.json({ error: "Failed to find deckel" }, { status: 500 });
    }
}
