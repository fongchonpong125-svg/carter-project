import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const intakeSchema = z.object({
  date: z.string().min(1),
  time: z.string().min(1),
  vegetables: z.number().int().min(0),
  fruits: z.number().int().min(0),
  meat: z.number().int().min(0),
  eggs: z.number().int().min(0),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = intakeSchema.parse(await request.json());

    const record = await db.intakeRecord.create({
      data: {
        ...body,
        userId: user.id,
      },
    });

    return NextResponse.json({ ok: true, record });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "保存摄入记录失败" },
      { status: 400 },
    );
  }
}
