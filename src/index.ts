import { Discordeno } from "../deps.ts";
import { OpenAI, OpenAiResponse } from "./lib/chat.ts";
import { Memory } from "./lib/memory.ts";

const bot = Discordeno.createBot({
  token: Deno.env.get("DISCORD_TOKEN")!,
  intents:
    Discordeno.Intents.Guilds |
    Discordeno.Intents.GuildMessages |
    Discordeno.Intents.MessageContent,
  events: {
    ready: (bot) => {
      console.log("launch");
      console.log(`memory dir path: ${Deno.env.get("MEMORY_DIR_PATH")}`);

      bot.helpers.sendMessage(BigInt(Deno.env.get("DISCORD_LOG_CHANNEL")!), {
        content: "起動しました！",
      });
    },
    messageCreate: async (bot, message) => {
      if (message.isFromBot) return;
      if (!message.mentionedUserIds.includes(bot.id)) return;

      bot.helpers.addReaction(message.channelId, message.id, "👀");

      const res = await OpenAI.sendMessage(
        message.content.replace(`<@${bot.id}> `, ""),
        message.guildId
      );
      const obj: OpenAiResponse = await res.json();

      obj.choices.forEach(({ message: { role, content } }) => {
        bot.helpers.sendMessage(message.channelId, { content });
        if (message.guildId) {
          Memory.push(message.guildId, { role, content });
        }
      });

      const mem = await (async () => {
        if (message.guildId) {
          return await Memory.read(message.guildId);
        }
        return [];
      })();

      bot.helpers.sendMessage(BigInt(Deno.env.get("DISCORD_LOG_CHANNEL")!), {
        content: `response:\n\`\`\`\n${JSON.stringify(
          obj
        )}\n\`\`\`\n\nmemory:\n\`\`\`${JSON.stringify(mem)}\`\`\``,
      });
    },
  },
});

await Discordeno.startBot(bot);
