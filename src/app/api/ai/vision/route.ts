import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { analyzeFoodImage } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    await requireUser();
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json({ error: "未上传图片" }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mime = image.type || "image/jpeg";
    const dataUrl = `data:${mime};base64,${base64}`;
    const content = await analyzeFoodImage(dataUrl);

    return NextResponse.json({
      content:
        content ||
        "图片已上传，但当前未配置视觉模型密钥。部署后配置 ZHIPU_API_KEY 即可返回正式识别结果。",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "识别请求失败",
      },
      { status: 500 },
    );
  }
}
