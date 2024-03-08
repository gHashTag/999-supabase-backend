1. При локальной разработке
   supabase functions serve --env-file ./supabase/functions/.env --no-verify-jwt

2. '.env' положить по адресу ./supabase/functions/.env

3. Вызов функции без Bearer token
   curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-tasks' \
    --header 'Content-Type: application/json' \
    --data '{"data":["Иван Иванов: 🔄 Разобраться с интеграцией видео со ссылками в TLDV", "Виктор Петров: 🔎 Исследовать возможность скачивания видео с Vimeo для преобразования в текст"]}'
   a
