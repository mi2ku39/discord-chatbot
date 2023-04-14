import { Discordeno } from "../deps.ts";

const bot = Discordeno.createBot({
    token: Deno.env.get("DISCORD_TOKEN")!
})

await Discordeno.startBot(bot)