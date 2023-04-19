import { Discordeno } from "../deps.ts";
import { OpenAI, OpenAiErrorResponse, OpenAiResponse } from "./lib/chat.ts";
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

      try {
        bot.helpers.addReaction(message.channelId, message.id, "👀");

        const res = await OpenAI.sendMessage(
          message.content.replace(`<@${bot.id}> `, ""),
          message.guildId
        );

        if (!res.ok) {
          const text = (await res.json()) as OpenAiErrorResponse
          throw new Error(`status: ${res.status} ${res.statusText}\nreason: \n${text.errors.content._errors.map(it => `${it.code}: ${it.message}\n`)}`)
        }

        const obj: OpenAiResponse = await res.json();

        obj.choices.forEach(({ message: { role, content } }) => {
          bot.helpers.sendMessage(message.channelId, {
            content,
            messageReference: {
              channelId: message.channelId,
              guildId: message.guildId,
              messageId: message.id,
              failIfNotExists: false,
            },
          });

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
          content: `memory:\n\`\`\`${JSON.stringify(
            mem
          )}\`\`\`\nresponse:\n\`\`\`${JSON.stringify(obj)}\`\`\``,
        });
      } catch (e) {
        await bot.helpers.addReaction(message.channelId, message.id, "👉");
        await bot.helpers.addReaction(message.channelId, message.id, "😖");
        await bot.helpers.addReaction(message.channelId, message.id, "👈");
        bot.helpers.sendMessage(BigInt(Deno.env.get("DISCORD_LOG_CHANNEL")!), {
          content: e,
        });
      }
    },
  },
});

await Discordeno.startBot(bot);
