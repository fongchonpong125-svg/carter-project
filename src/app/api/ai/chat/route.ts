import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { chatWithAi } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { prompt } = (await request.json()) as { prompt?: string };

    if (!prompt) {
      return NextResponse.json({ error: "缺少 prompt" }, { status: 400 });
    }

    await db.chatMessage.create({
      data: {
        role: "user",
        content: prompt,
        userId: user.id,
      },
    });

    const reply = await chatWithAi([
      {
        role: "system",
        content:
          "你是 FoodGuardian AI 的营养与食谱助理，请用简洁、实用、亲和的中文回答。",
      },
      {
        role: "user",
        content: prompt,
      },
    ]);

    const resolvedReply =
      reply ||
      "当前未配置在线大模型密钥，页面仍可完成本地营养分析、记录管理、库存查看和语音输入体验。";

    await db.chatMessage.create({
      data: {
        role: "assistant",
        content: resolvedReply,
        userId: user.id,
      },
    });

    return NextResponse.json({
      content: resolvedReply,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "聊天请求失败",
      },
      { status: 500 },
    );
  }
}
