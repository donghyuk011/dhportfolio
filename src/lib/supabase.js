import { createClient } from "@supabase/supabase-js";

export const ADMIN_EMAIL = "gimd50236@gmail.com";

export const supabase = createClient(
  "https://yjkzhaiuomzrzaffycnl.supabase.co",
  "sb_publishable_l0yzQ7p8tEq8ZylySX9m4g_RclUzuuC",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  },
);
