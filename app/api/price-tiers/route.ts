import { prisma } from "@/prisma/prisma-client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(){
    
    const priceTiers = await prisma.priceTier.findMany({
        include: {
            skilletPrices: true
        }
    })

    return NextResponse.json(priceTiers)

}

export async function PATCH(req: NextRequest){

    const { skilletId, tierId, price } = await req.json();
    const row = await prisma.skilletTierPrice.upsert({
        where: { skilletId_tierId: { skilletId, tierId } },
        update: { price },
        create: { skilletId, tierId, price },
        include: { tier: true },
    });
    
    return NextResponse.json(row);

}

export async function POST(req: NextRequest){

    const { minQty, maxQty } = await req.json();
    console.log(minQty, maxQty)
    const priceTier = await prisma.priceTier.create({
        data: {
            minQty,
            maxQty 
        }
    })

    return NextResponse.json(priceTier)

}