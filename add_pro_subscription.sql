-- ============================================
-- Добавление PRO подписки для аккаунта
-- ============================================

-- Шаг 1: Добавить поле is_pro в таблицу profiles (если его еще нет)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE;

-- Шаг 2: Установить PRO подписку для galkindmitry27@gmail.com
UPDATE profiles 
SET is_pro = TRUE 
WHERE email = 'galkindmitry27@gmail.com';

-- Проверка: посмотреть результат
SELECT id, email, full_name, is_pro 
FROM profiles 
WHERE email = 'galkindmitry27@gmail.com';
