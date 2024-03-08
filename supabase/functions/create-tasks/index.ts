// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { client } from "../utils/client.ts";
import OpenAI from "https://deno.land/x/openai@v4.28.0/mod.ts";

const apiKey = Deno.env.get("OPENAI_API_KEY");

const openai = new OpenAI({
  apiKey,
});

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

const getPreparedForBaseTasks = (tasks: any) => {
  return tasks.map((task: any) => {
    const [assignee, taskName, description] = task?.split(": ");
    return { assignee, taskName, description };
  });
};

Deno.serve(async (req) => {
  const { data } = await req.json();
  const supabaseClient = client();

  const preparedTasks = getPreparedForBaseTasks(data);
  console.log("🚀 ~ Deno.serve ~ preparedTasks:", preparedTasks);

  const { data: users, error } = await supabaseClient
    .from("users")
    .select("*");
  console.log(error);

  const preparedUsers = getPreparedUsers(users);

  const prompt = `add the 'user_id' from of ${
    JSON.stringify(preparedUsers)
  } to the objects of the ${
    JSON.stringify(preparedTasks)
  } array. Provide your response as a JSON object`;

  const chatCompletion = await openai.chat.completions.create({
    messages: [{
      role: "user",
      content: prompt,
    }],
    model: "gpt-3.5-turbo",
    stream: false,
    temperature: 0.1,
  });
  const tasks = JSON.parse(chatCompletion.choices[0].message.content ?? "");

  for (const task of tasks) {
    const data = await supabaseClient
      .from("tasks")
      .insert([{
        user_id: task.user_id,
        title: task.taskName,
        description: task.description,
      }]);
    if (data.error?.message) console.log("Error:", data.error.message);
  }

  return new Response(
    JSON.stringify("ok"),
    { headers: { "Content-Type": "application/json" } },
  );
});

// curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-tasks' \
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
