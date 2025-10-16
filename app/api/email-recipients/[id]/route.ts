import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }){

    const { id } = await context.params

    try {

        const deletedRecipient = await prisma.emailRecipient.delete({
            where: { id: Number(id) }
        });
        
        return NextResponse.json(deletedRecipient);
        
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Failed to delete recipient" }, { status: 500 });
    }

}