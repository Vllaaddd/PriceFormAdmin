import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(){

    const periods = await prisma.period.findMany({
        include: {materials: true} 
    })

    return NextResponse.json(periods)

}

export async function POST(req: NextRequest){

    try {
        const { period, startDate, endDate } = await req.json();

        const newPeriod = await prisma.period.create({
            data: {
                period,
                startDate: new Date(startDate),
                endDate: new Date(endDate)
            }
        });

        const periodId = newPeriod.id

        const newMaterials = await prisma.materialProperty.createMany({
            data: [
                {
                    material: 'Alu',
                    density: '2.71',
                    costPerKg: "0",
                    periodId
                },{
                    material: 'PE',
                    density: '0.92',
                    costPerKg: "0",
                    periodId
                },{
                    material: 'PVC',
                    density: '1.25',
                    costPerKg: "0",
                    periodId
                },{
                    material: 'BP',
                    costPerKg: "0",
                    periodId
                },
            ]
        })

        return NextResponse.json(newPeriod, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Error creating period" }, { status: 500 });
    }

}