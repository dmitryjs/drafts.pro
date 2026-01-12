# Добавление PRO подписки для аккаунта

## Шаг 1: Добавить поле is_pro в таблицу profiles в Supabase

Выполните следующий SQL в Supabase SQL Editor:

```sql
-- Добавить поле is_pro в таблицу profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE;
```

## Шаг 2: Установить PRO подписку для вашего аккаунта

### Вариант 1: Через SQL (быстро)

Выполните в Supabase SQL Editor:

```sql
-- Установить PRO подписку для galkindmitry27@gmail.com
UPDATE profiles 
SET is_pro = TRUE 
WHERE email = 'galkindmitry27@gmail.com';
```

### Вариант 2: Через API (после авторизации)

1. Авторизуйтесь в приложении с аккаунтом `galkindmitry27@gmail.com`
2. Откройте консоль браузера (F12)
3. Выполните:

```javascript
fetch('/api/admin/set-pro?userId=YOUR_USER_ID', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'galkindmitry27@gmail.com', 
    isPro: true 
  })
})
.then(r => r.json())
.then(console.log);
```

Где `YOUR_USER_ID` - это ваш `auth_uid` из Supabase Auth.

## Проверка

После установки PRO подписки:
1. Перезагрузите страницу
2. Откройте модалку отправки решения задачи
3. Должна появиться плашка "Проверка от ментора"
4. Лимит символов должен быть безграничным (∞)
