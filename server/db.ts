// DATABASE_URL больше не используется - используем Supabase API
// Этот файл оставлен для совместимости, но db не инициализируется

import { config } from "dotenv";
import { resolve } from "path";
// Загружаем .env из корня проекта
config({ path: resolve(process.cwd(), ".env") });

// Заглушка для совместимости - db больше не используется
// Все операции идут через Supabase API
export const pool = null;
export const db = null as any;
