import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(){

    const umkartons = await prisma.umkarton.findMany({
        include: {
            tierPrices: true
        }
    })

    return NextResponse.json(umkartons)
}

export async function POST(req: NextRequest){

    try {
        const { article, height, depth, width, price, prices, fsDimension, displayCarton, color, deckel, fsQty, bedoManu } = await req.json();

        const existingUmkarton = await prisma.umkarton.findFirst({
            where: { article: article }
        });

        if (existingUmkarton) {
            return NextResponse.json({ message: "Umkarton already exists", skipped: true }, { status: 200 });
        }

        const newUmkarton = await prisma.umkarton.create({
            data: {
                article,
                fsDimension: Number(fsDimension) || 0,
                displayCarton: displayCarton || "",
                color: color,
                deckel: deckel || "",
                fsQty: Number(fsQty) || 0,
                bedoManu: bedoManu || "",
                height: Number(height) || 0, 
                depth: Number(depth) || 0,
                width: Number(width) || 0,
                basePrice: Number(price) || 0,
            }
        });

        if (Array.isArray(prices) && prices.length > 0) {
            for (const p of prices) {
                let tier = await prisma.umkartonPriceTier.findFirst({
                    where: {
                        minQty: p.min,
                        maxQty: p.max
                    }
                });

                if (!tier) {
                    tier = await prisma.umkartonPriceTier.create({
                        data: {
                            minQty: p.min,
                            maxQty: p.max
                        }
                    });
                }

                await prisma.umkartonTierPrice.create({
                    data: {
                        umkartonId: newUmkarton.id,
                        tierId: tier.id,
                        price: p.price
                    }
                });
            }
        }

        return NextResponse.json(newUmkarton, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Error creating umkarton" }, { status: 500 });
    }

}

export async function DELETE(req: NextRequest){

    const calculation = await prisma.calculation.deleteMany()

    return NextResponse.json(calculation)
}