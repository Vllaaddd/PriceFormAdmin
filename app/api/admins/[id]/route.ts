import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }){

    const { id } = await context.params

    try {

        const deleteAdmin = await prisma.admin.delete({
            where: { id: Number(id) }
        });
        
        return NextResponse.json(deleteAdmin);
        
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Failed to delete admin" }, { status: 500 });
    }

}