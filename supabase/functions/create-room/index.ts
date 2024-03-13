// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-room/?secret=secret123sInJlZiI6ImRtcm9vcWJt' \
//     --header 'Content-Type: application/json' \
// --data '{"id": "65e5d8273e7524ee22fc0423", "email": "info@dao999nft.com", "name":"999"}'

// curl -i --location --request POST 'https://dmrooqbmxdhdyblqzswu.supabase.co/functions/v1/create-room?secret=secret123sInJlZiI6ImRtcm9vcWJt' \
//     --header 'Content-Type: application/json' \
// --data '{"id": "65e5d8273e7524ee22fc0423", "email": "info@dao999nft.com", "name":"999"}'

import { createCodes } from "../utils/100ms/create-codes.ts";
import { headers } from "../utils/100ms/headers.ts";
import { myHeaders } from "../utils/100ms/my-headers.ts";
import { client } from "../utils/client.ts";
import { corsHeaders } from "../_shared/cors.ts";
// import { handleCORS } from "../_shared/handleCORS.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const supabaseClient = client();

  try {
    const url = new URL(req.url);
    if (url.searchParams.get("secret") !== Deno.env.get("FUNCTION_SECRET")) {
      return new Response("Not allowed", {
        status: 405,
        headers: { ...headers },
      });
    }

    const { id, name, email } = await req.json();

    const { data, error: errorUser } = await supabaseClient
      .from("users")
      .select("*")
      .eq("email", email);
    // console.log(data, "data");
    console.log(errorUser, "errorUser");

    const roomData = {
      name,
      description: `${name}-${id}`,
      template_id: "65efdfab48b3dd31b94ff0dc",
      enabled: true,
    };
    console.log("roomData", roomData);
    const roomResponse = await fetch(
      "https://api.100ms.live/v2/rooms",
      {
        method: "POST",
        body: JSON.stringify(roomData),
        headers: { ...myHeaders },
      },
    );
    // console.log("roomResponse", roomResponse);

    if (!roomResponse.ok) {
      throw new Error(`Failed to create room: ${roomResponse.statusText}`);
    }
    const room = await roomResponse.json();
    // console.log(room, "room");

    const codesResponse = await createCodes(room.id);
    if (!codesResponse?.ok) {
      throw new Error(`Failed to create codes: ${codesResponse.statusText}`);
    }
    const codes = await codesResponse?.json();
    console.log(codesResponse, "codesResponse");

    let workspace;
    if (data) {
      workspace = {
        ...room,
        codes,
        user_id: data[0].user_id,
        email: data[0].email,
      };
    }
    console.log(workspace, "workspace");
    const { error } = await supabaseClient.from("workspaces").insert(workspace);
    if (error) {
      throw new Error(`Error saving to Supabase: ${error.message}`);
    }

    return new Response(JSON.stringify(workspace), {
      status: 200,
      headers: { ...headers, ...corsHeaders },
    });
  } catch (error) {
    console.log("error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...headers, ...corsHeaders },
    });
  }
});
/* 2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-room' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
