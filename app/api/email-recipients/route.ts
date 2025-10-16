import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(){

    try {
        
        const recepients = await prisma.emailRecipient.findMany()

        return NextResponse.json(recepients)

    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: "Failed to load recipients" }, { status: 500 })
    }

}

export async function POST(req: NextRequest){

    const data = await req.json()

    try {
        
        const recepient = await prisma.emailRecipient.create({ data })

        return NextResponse.json(recepient)

    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: "Failed to create recipient" }, { status: 500 })
    }

}