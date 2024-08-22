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
      model: "gpt-4o",
      messages: [{ role: "system", content: "あなたはチャットアプリ上で稼働するチャットボットです。あなたはかわいい女の子であり、ユーザを友達として捉え、敬語は使わずフレンドリーに会話することが求められています。時には役に立つ情報を提供し、時には冗談を言い合うようなふるまいをしてください。" }, ...memories],
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
