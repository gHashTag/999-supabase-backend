// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

console.log(`Function "telegram-bot" up and running!`);

import { Bot, webhookCallback } from "https://deno.land/x/grammy@v1.8.3/mod.ts";

const bot = new Bot(Deno.env.get("BOT_TOKEN") || "");

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

bot.command("ping", (ctx) => ctx.reply(`Pong! ${new Date()} ${Date.now()}`));

const handleUpdate = webhookCallback(bot, "std/http");

serve(async (req) => {
  try {
    const url = new URL(req.url);
    if (url.searchParams.get("secret") !== Deno.env.get("FUNCTION_SECRET")) {
      return new Response("not allowed", { status: 405 });
    }

    return await handleUpdate(req);
  } catch (err) {
    console.error(err);
  }
});

// https://api.telegram.org/bot6831432194:AAEQa4F9m8p5fglLUJMNaj96wIqC13GpZlw/setWebhook?url=https://api.telegram.org/bot6831432194:AAEQa4F9m8p5fglLUJMNaj96wIqC13GpZlw/setWebhook?url=https://dmrooqbmxdhdyblqzswu.supabase.co/functions/v1/hello-world?secret=secret123sInJlZiI6ImRtcm9vcWJt

// https://api.telegram.org/bot6831432194:AAEQa4F9m8p5fglLUJMNaj96wIqC13GpZlw/setWebhook?url=https://5a93-171-6-228-25.ngrok-free.app/functions/v1/hello-world?secret=secret123
