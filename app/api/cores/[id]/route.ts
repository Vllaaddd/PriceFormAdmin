import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }){

    const { id } = await context.params
    const data = await req.json()

    try {
        const updatedCore = await prisma.core.update({
            where: { id: Number(id) },
            data,
        });

        return NextResponse.json(updatedCore);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Error updating cost" }, { status: 500 });
    }

}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }){
    const { id } = await context.params;

    try {
        const core = await prisma.core.delete({
            where: { id: Number(id) },
        });

        if (!core) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(core);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Error deleting core" }, { status: 500 });
    }
}