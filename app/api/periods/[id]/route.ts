import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }){

    const { id } = await context.params

    try {
        const period = await prisma.period.findUnique({
            where: { id: Number(id) },
            include: { materials: true },
        }); 

        if (!period) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(period);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Error fetching period" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const data = await req.json();

    try {
        const updatedPeriod = await prisma.materialProperty.update({
            where: { id: Number(id) },
            data: { costPerKg: String(data) },
        });

        return NextResponse.json(updatedPeriod);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Error updating cost" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }){

    const { id } = await context.params;

    try {

        const deletePeriod = await prisma.period.delete({
            where: { id: Number(id) },
            include: { materials: true },
        });

        const materials = deletePeriod?.materials;

        materials?.map(async (material) => {
            await prisma.materialProperty.delete({
                where: { id: material.id },
            });
        })

        return NextResponse.json(deletePeriod);

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Error deleting period" }, { status: 500 });
    }

}