const ZHIPU_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const DOUBAO_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

async function callJsonApi(url: string, apiKey: string, body: object) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`AI 服务请求失败：${response.status}`);
  }

  return response.json();
}

export async function chatWithAi(messages: ChatMessage[]) {
  const zhipuKey = process.env.ZHIPU_API_KEY_TEXT || process.env.ZHIPU_API_KEY;
  const doubaoKey = process.env.DOUBAO_API_KEY;

  if (zhipuKey) {
    const result = await callJsonApi(ZHIPU_URL, zhipuKey, {
      model: "glm-4-flash",
      messages,
      temperature: 0.7,
      max_tokens: 900,
    });
    return result?.choices?.[0]?.message?.content as string | undefined;
  }

  if (doubaoKey) {
    const result = await callJsonApi(DOUBAO_URL, doubaoKey, {
      model: "doubao-seed-1-6-250615",
      messages,
      temperature: 0.7,
      max_tokens: 900,
    });
    return result?.choices?.[0]?.message?.content as string | undefined;
  }

  return undefined;
}

export async function analyzeFoodImage(base64DataUrl: string) {
  const zhipuKey = process.env.ZHIPU_API_KEY;

  if (!zhipuKey) {
    return undefined;
  }

  const result = await callJsonApi(ZHIPU_URL, zhipuKey, {
    model: "glm-4v-flash",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "请识别这张图片中的食材或菜品，并用中文返回：1. 识别对象 2. 可能重量 3. 营养亮点 4. 建议如何记录到饮食日志。",
          },
          {
            type: "image_url",
            image_url: {
              url: base64DataUrl,
            },
          },
        ],
      },
    ],
    temperature: 0.3,
    max_tokens: 700,
  });

  return result?.choices?.[0]?.message?.content as string | undefined;
}
