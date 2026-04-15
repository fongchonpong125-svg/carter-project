import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const fridgeSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().min(1),
  unit: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = fridgeSchema.parse(await request.json());

    const item = await db.fridgeItem.create({
      data: {
        ...body,
        addedDate: new Date().toISOString().slice(0, 10),
        userId: user.id,
      },
    });

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "保存库存失败" },
      { status: 400 },
    );
  }
}
