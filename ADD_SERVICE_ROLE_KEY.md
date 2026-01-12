# Добавление Service Role Key

## ✅ Ваш Service Role Key

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbnJpeXliYWJpdWVieHdtdm9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODE0MzM5MSwiZXhwIjoyMDgzNzE5MzkxfQ.dCLceQJRScJxfW0mAATY_-LiBPhRsC9-5s7JdfwJySs
```

## 📝 Что нужно сделать

1. Откройте файл `.env` в корне проекта
2. Добавьте строку (или замените, если уже есть):
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbnJpeXliYWJpdWVieHdtdm9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODE0MzM5MSwiZXhwIjoyMDgzNzE5MzkxfQ.dCLceQJRScJxfW0mAATY_-LiBPhRsC9-5s7JdfwJySs
   ```

3. (Опционально) Закомментируйте или удалите строку `DATABASE_URL` - она больше не нужна:
   ```
   # DATABASE_URL=postgresql://postgres:[1379258456JoK.]@db.ionriyybabiuebxwmvoc.supabase.co:5432/postgres
   ```

4. Сохраните файл

5. Перезапустите сервер (если он запущен):
   ```bash
   npm run dev
   ```

## ✅ Результат

После добавления ключа:
- ✅ Сервер будет использовать Service Role Key для доступа к БД
- ✅ Обход RLS (Row Level Security) - полный доступ к данным
- ✅ Профили будут работать (создание, обновление)
- ✅ Ошибка ENOTFOUND больше не появится

## 🔒 Безопасность

**Важно:** Service Role Key - это секретный ключ с полными правами. 
- ❌ НЕ коммитьте его в git
- ✅ Убедитесь, что `.env` в `.gitignore`
- ✅ Не делитесь ключом публично
