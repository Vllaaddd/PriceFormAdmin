import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }){
  const { id } = await context.params;

  try {
    const priceTier = await prisma.umkartonPriceTier.delete({
      where: { id: Number(id) },
    });

    if (!priceTier) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(priceTier);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error deleting price tier" }, { status: 500 });
  }
}