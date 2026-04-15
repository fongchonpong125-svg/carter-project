import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const shoppingSchema = z.object({
  name: z.string().min(1),
  note: z.string().optional(),
});

const updateSchema = z.object({
  id: z.string().min(1),
  checked: z.boolean(),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = shoppingSchema.parse(await request.json());

    const item = await db.shoppingItem.create({
      data: {
        ...body,
        userId: user.id,
      },
    });

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "保存采购项失败" },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body = updateSchema.parse(await request.json());

    const existing = await db.shoppingItem.findFirst({
      where: { id: body.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "采购项不存在" }, { status: 404 });
    }

    const item = await db.shoppingItem.update({
      where: { id: body.id },
      data: { checked: body.checked },
    });

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "更新采购项失败" },
      { status: 400 },
    );
  }
}
