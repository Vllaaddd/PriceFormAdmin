import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }){

    const { id } = await context.params

    try {
        const updatedUmkarton = await prisma.umkarton.findFirst({
            where: { id: Number(id) },
        }); 

        return NextResponse.json(updatedUmkarton);
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
        const updatedUmkarton = await prisma.umkarton.update({
            where: { id: Number(id) },
            data,
        });

        return NextResponse.json(updatedUmkarton);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Error updating cost" }, { status: 500 });
    }

}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }){
  const { id } = await context.params;

  try {
    const umkarton = await prisma.umkarton.delete({
      where: { id: Number(id) },
    });

    if (!umkarton) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(umkarton);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error deleting umkarton" }, { status: 500 });
  }
}