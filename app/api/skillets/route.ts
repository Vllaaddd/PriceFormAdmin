import { skillet } from '@/constants/constatns';
import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(){

    const skillets = await prisma.skillet.findMany({
        include: {
            tierPrices: true
        }
    })

    return NextResponse.json(skillets)
}

export async function POST(req: NextRequest){

    try {
        const { article, height, depth, width, price, knife, density, prices } = await req.json();

        const existingSkillet = await prisma.skillet.findFirst({
            where: { article: article }
        });

        if (existingSkillet) {
            return NextResponse.json({ message: "Skillet already exists", skipped: true }, { status: 200 });
        }

        const newSkillet = await prisma.skillet.create({
            data: {
                article,
                knife,
                height: Number(height) || 0, 
                depth: Number(depth) || 0,
                width: Number(width) || 0,
                basePrice: Number(price) || 0,
                density: Number(density) || 0,
            }
        });

        if (Array.isArray(prices) && prices.length > 0) {
            for (const p of prices) {
                let tier = await prisma.priceTier.findFirst({
                    where: {
                        minQty: p.min,
                        maxQty: p.max
                    }
                });

                if (!tier) {
                    tier = await prisma.priceTier.create({
                        data: {
                            minQty: p.min,
                            maxQty: p.max
                        }
                    });
                }

                await prisma.skilletTierPrice.create({
                    data: {
                        skilletId: newSkillet.id,
                        tierId: tier.id,
                        price: p.price
                    }
                });
            }
        }

        return NextResponse.json(newSkillet, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Error creating skillet" }, { status: 500 });
    }

}

export async function DELETE(){

    const skillet = await prisma.skillet.deleteMany()

    return NextResponse.json(skillet)
}