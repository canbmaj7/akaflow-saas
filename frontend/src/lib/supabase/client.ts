import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY .env.local içinde tanımlı olmalı",
  );
}

if (supabaseUrl.includes("YOUR_PROJECT_REF")) {
  throw new Error(
    "Supabase URL placeholder — frontend/.env.local dosyasını gerçek değerlerle doldurun",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
