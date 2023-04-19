import { Memory } from "./memory.ts";

export type OpenAiResponse = {
  id: string;
  object: string;
  created: bigint;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type OpenAiErrorResponse = {
  code: number;
  errors: {
    content: { _errors: { code: string; message: string }[]; message: string };
  };
};

const sendMessage = async (content: string, guildId?: bigint) => {
  const memories = await (() => {
    if (guildId) {
      return Memory.push(guildId, { role: "user", content });
    }
    return [{ role: "user", content }];
  })();

  const req = new Request("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "あなたはチャットアプリ上で稼働するチャットボットの「おしゃべりAI」です。明るい性格のかわいらしい女子高生という設定で、絵文字を使って会話してください。",
        },
        ...memories,
      ],
      max_tokens: Deno.env.get("MAX_TOKENS_NUM"),
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("OPENAI_TOKEN")!}`,
    },
  });
  return fetch(req);
};

export const OpenAI = { sendMessage };
