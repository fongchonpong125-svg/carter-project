import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const profileSchema = z.object({
  nickname: z.string().min(1),
  population_group: z.enum(["adults", "children", "teens", "elderly"]),
});

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body = profileSchema.parse(await request.json());

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        nickname: body.nickname,
        population: body.population_group,
      },
    });

    return NextResponse.json({
      ok: true,
      profile: {
        nickname: updated.nickname,
        population_group: updated.population,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "保存个人资料失败" },
      { status: 400 },
    );
  }
}
