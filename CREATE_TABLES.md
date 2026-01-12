# Создание таблиц в Supabase

## Инструкция

1. **Откройте Supabase Dashboard**
   - Перейдите на https://supabase.com/dashboard
   - Выберите ваш проект

2. **Откройте SQL Editor**
   - В левом меню нажмите на иконку "SQL Editor" (или "Code Editor")
   - Нажмите "New Query"

3. **Выполните SQL скрипт**
   - Откройте файл `supabase_schema.sql` в этом проекте
   - Скопируйте весь содержимое
   - Вставьте в SQL Editor в Supabase
   - Нажмите "Run" (или Ctrl+Enter)

4. **Проверьте результат**
   - Перейдите в Table Editor
   - Должны появиться все таблицы:
     - users
     - profiles
     - tasks
     - task_solutions
     - battles
     - battle_entries
     - skill_assessments
     - mentors
     - user_xp
     - и другие...

## Что создается

### Основные таблицы:
- ✅ **users** - пользователи
- ✅ **profiles** - профили с полной информацией
- ✅ **tasks** - задачи для дизайнеров
- ✅ **task_solutions** - решения задач
- ✅ **battles** - дизайн батлы
- ✅ **battle_entries** - работы в батлах
- ✅ **skill_assessments** - оценки навыков
- ✅ **assessment_questions** - вопросы тестов
- ✅ **mentors** - менторы
- ✅ **user_xp** - система опыта
- ✅ **notifications** - уведомления
- ✅ **companies** - компании

### Вспомогательные таблицы:
- task_votes, task_favorites, task_drafts
- battle_votes, battle_comments
- mentor_slots, mentor_bookings, mentor_reviews
- xp_transactions

## После создания таблиц

1. Перезапустите сервер (если он запущен):
   ```bash
   # Остановите (Ctrl+C) и запустите снова:
   npm run dev
   ```

2. Попробуйте сохранить профиль - должно работать!

3. Проверьте, что данные сохраняются в Supabase Dashboard → Table Editor

## Если возникли ошибки

- Проверьте, что вы используете правильный проект Supabase
- Убедитесь, что база данных активна
- Проверьте логи в Supabase Dashboard → Logs
