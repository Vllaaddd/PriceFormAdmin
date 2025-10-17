import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(){

    try {
        
        const admins = await prisma.admin.findMany()

        return NextResponse.json(admins)

    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: "Failed to load admins" }, { status: 500 })
    }

}

export async function POST(req: NextRequest){

    const data = await req.json()

    try {
        
        const admin = await prisma.admin.create({ data })

        return NextResponse.json(admin)

    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: "Failed to create admin" }, { status: 500 })
    }

}