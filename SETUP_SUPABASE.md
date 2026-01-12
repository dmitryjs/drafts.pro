# Инструкция по настройке Supabase для локальной разработки

## Шаг 1: Создайте проект в Supabase

1. Перейдите на https://supabase.com
2. Зарегистрируйтесь или войдите
3. Создайте новый проект:
   - Название: `designhub` (или любое другое)
   - Пароль базы данных: **сохраните его!** (он понадобится для DATABASE_URL)
   - Регион: выберите ближайший (например, `West Europe` для России)

## Шаг 2: Получите строку подключения к базе данных

1. В проекте Supabase перейдите в **Settings** → **Database**
2. Прокрутите до секции **Connection string**
3. Выберите вкладку **URI**
4. Скопируйте строку подключения (она выглядит так: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)
5. Замените `[YOUR-PASSWORD]` на ваш реальный пароль базы данных

## Шаг 3: Получите ключи для клиента

1. В проекте Supabase перейдите в **Settings** → **API**
2. Найдите:
   - **Project URL** (это `VITE_SUPABASE_URL`)
   - **anon public** ключ (это `VITE_SUPABASE_ANON_KEY`)

## Шаг 4: Настройте файл .env

Создайте или обновите файл `.env` в корне проекта со следующим содержимым:

```env
# Supabase Database (PostgreSQL connection string)
DATABASE_URL=postgresql://postgres:ВАШ_ПАРОЛЬ@db.xxx.supabase.co:5432/postgres

# Supabase для клиента (Frontend)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=ваш_anon_ключ

# Polza AI API Key (секретный ключ, только для сервера)
POLZA_AI_API_KEY=ваш_ключ_polza_ai

# Node Environment
NODE_ENV=development

# Port (опционально)
PORT=5000
```

**ВАЖНО:**
- Замените `ВАШ_ПАРОЛЬ` на реальный пароль базы данных
- Замените `xxx` на ваш реальный ID проекта Supabase
- Замените `ваш_anon_ключ` на реальный anon ключ
- Замените `ваш_ключ_polza_ai` на реальный API ключ Polza AI (если есть)

## Шаг 5: Создайте таблицы в Supabase

После настройки `.env` выполните миграции:

```bash
npm run db:push
```

Эта команда создаст все необходимые таблицы в вашей базе данных Supabase.

## Шаг 6: Запустите проект

```bash
npm run dev
```

Проект будет доступен по адресу: http://localhost:5000

---

## Для продакшена (Vercel)

При деплое на Vercel добавьте те же переменные окружения в настройках проекта Vercel:
- Settings → Environment Variables

**ВАЖНО для безопасности:**
- `POLZA_AI_API_KEY` должен быть **только** в переменных окружения сервера (serverless функций)
- `VITE_SUPABASE_ANON_KEY` может быть в клиенте (это безопасно, это публичный ключ)
- `DATABASE_URL` должен быть **только** на сервере, никогда не попадать в клиентский код
