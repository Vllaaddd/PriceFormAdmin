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
        const { article, format, knife, density } = await req.json();

        const newSkillet = await prisma.skillet.create({
            data: {
                article,
                format: Number(format),
                knife,
                density: Number(density),
            }
        });

        return NextResponse.json(newSkillet, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Error creating skillet" }, { status: 500 });
    }

}