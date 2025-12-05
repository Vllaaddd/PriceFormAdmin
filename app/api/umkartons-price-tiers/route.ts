import { prisma } from "@/prisma/prisma-client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(){
    
    const priceTiers = await prisma.umkartonPriceTier.findMany({
        include: {
            UmkartonPrices: true
        }
    })

    return NextResponse.json(priceTiers)

}

export async function PATCH(req: NextRequest){

    const { umkartonId, tierId, price } = await req.json();
    const row = await prisma.umkartonTierPrice.upsert({
        where: { umkartonId_tierId: { umkartonId, tierId } },
        update: { price },
        create: { umkartonId, tierId, price },
        include: { tier: true },
    });
    
    return NextResponse.json(row);

}

export async function POST(req: NextRequest){

    const { minQty, maxQty } = await req.json();
    const priceTier = await prisma.umkartonPriceTier.create({
        data: {
            minQty,
            maxQty 
        }
    })

    return NextResponse.json(priceTier)

}