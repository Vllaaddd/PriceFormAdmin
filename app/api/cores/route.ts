import { prisma } from "@/prisma/prisma-client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(){

    const cores = await prisma.core.findMany()

    return NextResponse.json(cores)
}

export async function POST(req: NextRequest){

    try {
        const { article, length, width, thickness, type, price } = await req.json();

        const newCore = await prisma.core.create({
            data: {
                article,
                length: Number(length),
                width: Number(width),
                thickness: Number(thickness),
                type,
                price: Number(price),
            }
        });

        return NextResponse.json(newCore, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Error creating core" }, { status: 500 });
    }

}

export async function DELETE(){

    const core = await prisma.core.deleteMany()

    return NextResponse.json(core)
}