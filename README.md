1. При локальной разработке
   supabase functions serve --env-file ./supabase/functions/.env --no-verify-jwt

2. '.env' положить по адресу ./supabase/functions/.env

3. Вызов функции без Bearer token
   curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-tasks' \
    --header 'Content-Type: application/json' \
    --data '{"data":["Иван Иванов: 🔄 Разобраться с интеграцией видео со ссылками в TLDV", "Виктор Петров: 🔎 Исследовать возможность скачивания видео с Vimeo для преобразования в текст"]}'

# [grammY](https://grammy.dev) on [Supabase Edge Functions](https://supabase.com/edge-functions)

> Try it out: [@supabase_example_bot](https://t.me/supabase_example_bot)

## Deploying

1. Create the function:

```shell
supabase functions deploy --no-verify-jwt telegram-bot
```

2. Contact [@BotFather](https://t.me/BotFather) to create a bot and get its
   token.
3. Set the secrets:

```shell
supabase secrets set BOT_TOKEN=your_token FUNCTION_SECRET=random_secret
```

4. Set your bot’s webhook URL to
   `https://<PROJECT_NAME>.functions.supabase.co/telegram-bot` (replacing
   `<...>` with respective values). To do that, you open the request URL in your
   browser:

```text
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<PROJECT_NAME>.functions.supabase.co/telegram-bot?secret=<FUNCTION_SECRET>
```
