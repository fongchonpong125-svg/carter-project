import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializeAppState } from "@/lib/serializers";

export async function GET() {
  try {
    const user = await requireUser();

    const [intakeRecords, fridgeItems, shoppingItems, chatMessages] = await Promise.all([
      db.intakeRecord.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.fridgeItem.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
      db.shoppingItem.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
      db.chatMessage.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" }, take: 24 }),
    ]);

    return NextResponse.json(
      serializeAppState({
        user,
        intakeRecords,
        fridgeItems,
        shoppingItems,
        chatMessages,
      }),
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "读取状态失败" },
      { status: 401 },
    );
  }
}
