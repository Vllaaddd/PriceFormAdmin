import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }){
    try {

        const { id } = await context.params;
        const data = await req.json();

        const text = await prisma.emailText.update({
            where: { id: Number(id) },
            data,
        })

        return NextResponse.json(text)

    } catch (error) {
        console.error("Failed to update email text", error)
    }
}