import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const client = () => {
  const ANON_KEY_SUPABASE = Deno.env.get("ANON_KEY_SUPABASE");
  const URL_SUPABASE = Deno.env.get("URL_SUPABASE");

  const supabaseClient = createClient(
    URL_SUPABASE ?? "",
    ANON_KEY_SUPABASE ??
      "",
  );
  console.log("supabaseClient", supabaseClient);
  return supabaseClient;
};
