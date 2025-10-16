import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, context: { params: Promise<{ article: string }> }){
    const { article } = await context.params
    const body = await req.json()

    try {
        const updated = await prisma.core.updateMany({
            where: { article },
            data: body,
        });

    
        if (updated.count === 0) {
            return NextResponse.json({
                message: `Втулку з артикулом ${article} не знайдено — пропущено`,
                skipped: true,
            });
        }

        return NextResponse.json({
            message: `Втулку ${article} оновлено`,
            updated,
            skipped: false,
        });
  } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Failed to update core by article" }, { status: 500 });
    }
}