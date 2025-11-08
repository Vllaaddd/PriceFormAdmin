import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }){

    const { id } = await context.params

    try {
        const updatedSkillet = await prisma.skillet.findFirst({
            where: { id: Number(id) },
        }); 

        return NextResponse.json(updatedSkillet);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Error finding cost" }, { status: 500 });
    }

}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }){

    const { id } = await context.params
    const data = await req.json()

    console.log(data);
    

    try {
        const updatedSkillet = await prisma.skillet.update({
            where: { id: Number(id) },
            data,
        });

        return NextResponse.json(updatedSkillet);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Error updating cost" }, { status: 500 });
    }

}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }){
  const { id } = await context.params;

  try {
    const skillet = await prisma.skillet.delete({
      where: { id: Number(id) },
    });

    if (!skillet) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(skillet);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error deleting skillet" }, { status: 500 });
  }
}