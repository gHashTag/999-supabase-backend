// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { client } from "../utils/client.ts";
import { createChatCompletion } from "../utils/createChatCompletion.ts";
import { Bot, webhookCallback } from "https://deno.land/x/grammy@v1.8.3/mod.ts";
import { translateText } from "../utils/translateText.ts";

const bot = new Bot(Deno.env.get("TELEGRAM_BOT_TOKEN") || "");

const targetLanguage = "ru";

async function sendTaskToTelegram(chatId: number, task: any) {
  const originalMessageText =
    `💼 Task: ${task.title}\n✏️ Description: ${task.description}\n🧑🏻‍🎤 Assignee: ${task.assignee.first_name} ${task.assignee.last_name} (@${task.assignee.username})`;

  const translatedMessageText = await translateText(
    originalMessageText,
    targetLanguage,
  );

  // Отправляем переведенный текст в Telegram
  await bot.api.sendMessage(chatId, translatedMessageText);
}

const getPreparedUsers = (usersFromSupabase: any) => {
  return usersFromSupabase.map((user: any) => {
    const concatName = () => {
      if (!!user.first_name && !user.last_name) {
        return user?.first_name;
      }
      if (!user.first_name && !!user.last_name) {
        return user.last_name;
      }
      if (!!user.first_name && !!user.last_name) {
        return `${user?.first_name} ${user?.last_name}`;
      }
    };
    return ({
      ...user,
      concat_name: concatName(),
    });
  });
};

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    if (url.searchParams.get("secret") !== Deno.env.get("FUNCTION_SECRET")) {
      return new Response("not allowed", { status: 405 });
    }

    const { type, data } = await req.json();

    // if (type === "transcription.success") {
    //   // Получаем прямую ссылку на текстовый файл транскрипции
    //   const transcriptTextPresignedUrl = data.transcript_txt_presigned_url;

    //   // Выполняем запрос к URL для получения текста транскрипции
    //   const transcriptResponse = await fetch(transcriptTextPresignedUrl);
    //   if (!transcriptResponse.ok) {
    //     throw new Error("Не удалось получить транскрипцию");
    //   }
    //   const transcriptionText = await transcriptResponse.text();

    const transcriptionText =
      `Dmitrii Vasilev: Thats it. Let's go. So, the first task is to create bots that go to the Moon. The second task is to create bots that go to Mars. The third task is to create bots that go to Venus and colonize them by building a lunar base there. What do you add, Andrey?

    Andrey O: Yes, one more task. After we colonize the lunar base, we will need to capture the Universe and the last task in the Aldebaran constellation will also need to capture a couple of stars in this colony.

    Dmitrii Vasilev: So, we need to understand who will solve this problem through us. Who will not be delegated?

    Andrey O: I think that the last task can be delegated to the head of the transport department.

    Dmitrii Vasilev: Andrey O. `;

    const systemPrompt =
      `Answer with emoticons. Always answer in Russian. You are an AI assistant working at dao999nft for Russian-speaking people. Your goal is to extract all tasks from the text, the maximum number of tasks, the maximum number of tasks, the maximum number of tasks, the maximum number of tasks, the maximum number of tasks, assign them to executors using the colon sign: assignee, title,  description (Example: <b>Nikita Zhilin</b>: 💻 Develop functional requirements) Provide your response as a JSON object`;

    const preparedTasks = await createChatCompletion(
      transcriptionText,
      systemPrompt,
    );

    const supabaseClient = client();

    const { data: users } = await supabaseClient
      .from("users")
      .select("*");

    const preparedUsers = getPreparedUsers(users);
    console.log(preparedUsers, "preparedUsers");

    const prompt = `add the 'user_id' from of ${
      JSON.stringify(preparedUsers)
    } to the objects of the ${JSON.stringify(preparedTasks)} array. (Example: [{
      assignee: {
        id: "1a1e4c75-830c-4fe8-a312-c901c8aa144b",
        first_name: "Andrey",
        last_name: "O",
        username: "reactotron"
      },
      title: "🌌 Capture Universe",
      description: "Capture the Universe and a couple of stars in the Aldebaran constellation"
    }]) Provide your response as a JSON object`;

    console.log(preparedTasks, "preparedTasks");
    const tasks = await createChatCompletion(prompt);

    if (tasks) {
      const newTasks = await JSON.parse(tasks).tasks;
      console.log(newTasks, "newTasks");
      const chatId = -1001978334539;
      //144022504 - 999 Dev;
      for (const task of newTasks) {
        // console.log(task, "task");
        const userId = task.user_id ?? "f8395c6f-e6aa-4c2e-b64b-6d541ff6cd50";

        const data = await supabaseClient
          .from("tasks")
          .insert([{
            user_id: userId,
            title: task.title,
            description: task.description,
          }]);
        sendTaskToTelegram(chatId, task).catch(console.error);
        if (data.error?.message) console.log("Error:", data.error.message);
      }
    } else {
      console.error("Error: 'tasks' is not an array or is null");
    }

    console.log("type", type);
  } catch (err) {
    console.error(err);
  }

  return new Response(
    JSON.stringify("ok"),
    { headers: { "Content-Type": "application/json" } },
  );
});

// server
// https://api.telegram.org/bot6831432194:AAEQa4F9m8p5fglLUJMNaj96wIqC13GpZlw/setWebhook?url=https://api.telegram.org/bot6831432194:AAEQa4F9m8p5fglLUJMNaj96wIqC13GpZlw/setWebhook?url=https://dmrooqbmxdhdyblqzswu.supabase.co/functions/v1/create-tasks/?secret=secret123sInJlZiI6ImRtcm9vcWJt

// local
// https://api.telegram.org/bot6831432194:AAEQa4F9m8p5fglLUJMNaj96wIqC13GpZlw/setWebhook?url=https://5a93-171-6-228-25.ngrok-free.app/functions/v1/create-tasks/?secret=secret123sInJlZiI6ImRtcm9vcWJt

// curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-tasks/?secret=secret123sInJlZiI6ImRtcm9vcWJt' \
//     --header 'Content-Type: application/json' \
// --data '{"data":[
//   "Иван Иванов: 🔄 Разобраться с интеграцией видео со ссылками в TLDV: If the user_id does not exist, you need to create a corresponding user in the users table before attempting to insert the task.",
//   "Виктор Петров: 🔎 Исследовать возможность скачивания видео с Vimeo для преобразования в текст: Heres a step-by-step pseudocode to handle this"
// ]}'

/* To invoke locally:
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-tasks' \
    --header 'Content-Type: application/json' \
    --data '{"data":[
      "Иван Иванов: 🔄 Разобраться с интеграцией видео со ссылками в TLDV: If the user_id does not exist, you need to create a corresponding user in the users table before attempting to insert the task.",
      "Виктор Петров: 🔎 Исследовать возможность скачивания видео с Vimeo для преобразования в текст: Heres a step-by-step pseudocode to handle this",
    ]}'


  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-tasks' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

// console.log("Текст транскрипции:", transcriptionText);
