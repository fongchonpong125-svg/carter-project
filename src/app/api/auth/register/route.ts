import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, setSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = registerSchema.parse(await request.json());
    const exists = await db.user.findUnique({ where: { email: body.email } });

    if (exists) {
      return NextResponse.json({ error: "该邮箱已注册" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await db.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash,
        nickname: body.name,
      },
    });

    const token = await createSession(user.id);
    await setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        population_group: user.population,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "注册信息不完整" }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "注册失败" },
      { status: 500 },
    );
  }
}
