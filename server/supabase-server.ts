import { createClient } from '@supabase/supabase-js';
import { config } from "dotenv";
import { resolve } from "path";

// Загружаем .env из корня проекта
config({ path: resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase credentials not configured for server. Some features may not work.');
}

// Supabase клиент для сервера с полными правами
// Использует service_role ключ для обхода RLS (Row Level Security)
export const supabaseServer = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;
