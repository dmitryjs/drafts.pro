# DesignHub - Платформа для дизайнеров

## Обзор

DesignHub — это веб-платформа для дизайнеров, построенная на TypeScript с React фронтендом и Express бэкендом. Платформа предоставляет:

- **Задачи** — дизайн-задачи разного уровня сложности с фильтрацией по категориям (Продукт, Графический, UX/UI, 3D)
- **Дизайн батлы** — соревнования между дизайнерами на заранее выбранные темы
- **Оценка навыков** — загрузка портфолио, резюме и прохождение теста для определения уровня и рекомендованной ЗП
- **Менторы** — список верифицированных профессионалов для консультаций
- **Профиль** — личный кабинет с информацией о пользователе

## Настройки пользователя

- Язык интерфейса: только русский
- Тема: только светлая
- Версия: веб (desktop-first)

## Архитектура

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Routing**: Wouter
- **State**: TanStack Query
- **UI**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts

### Backend
- **Framework**: Express.js + TypeScript
- **ORM**: Drizzle ORM + PostgreSQL
- **Validation**: Zod

### База данных (PostgreSQL)

Таблицы:
- `users` — пользователи
- `profiles` — профили пользователей
- `tasks` — задачи для дизайнеров
- `task_solutions` — решения задач
- `battles` — дизайн-батлы
- `battle_entries` — работы участников батлов
- `battle_votes` — голоса за работы
- `skill_assessments` — оценки навыков
- `assessment_questions` — вопросы тестов
- `mentors` — менторы
- `mentor_slots` — слоты для записи
- `mentor_bookings` — бронирования
- `mentor_reviews` — отзывы о менторах

### Структура файлов
- `/client` — React фронтенд
- `/server` — Express бэкенд
- `/shared` — общие типы и схемы
- `shared/schema.ts` — схема БД (Drizzle)
- `shared/routes.ts` — определения API маршрутов

### Аутентификация
- **Provider**: Replit Auth (OpenID Connect)
- **Методы входа**: Google, GitHub, Apple, email/password (через Replit)
- **Таблицы**:
  - `sessions` — хранение сессий (express-session)
  - `auth_users` — пользователи Replit Auth
  - `profiles` — синхронизируется с auth_users через authUid
- **API Эндпоинты авторизации**:
  - `GET /api/login` — редирект на Replit Auth
  - `GET /api/logout` — выход из системы
  - `GET /api/auth/user` — получить текущего пользователя

## API Эндпоинты

### Задачи
- `GET /api/tasks` — список задач (фильтры: category, level, status)
- `GET /api/tasks/:slug` — детали задачи
- `POST /api/tasks` — создать задачу
- `PATCH /api/tasks/:id` — обновить задачу
- `DELETE /api/tasks/:id` — удалить задачу

### Решения задач
- `GET /api/tasks/:taskId/solutions` — решения задачи
- `GET /api/users/:userId/solutions` — решения пользователя
- `POST /api/tasks/:taskId/solutions` — отправить решение

### Батлы
- `GET /api/battles` — список батлов
- `GET /api/battles/:slug` — детали батла
- `POST /api/battles` — создать батл
- `GET /api/battles/:battleId/entries` — работы батла
- `POST /api/battles/:battleId/entries` — добавить работу

### Менторы
- `GET /api/mentors` — список менторов
- `GET /api/mentors/:slug` — профиль ментора
- `GET /api/mentors/:mentorId/slots` — слоты ментора
- `POST /api/bookings` — забронировать слот
- `GET /api/mentors/:mentorId/reviews` — отзывы

### Оценка навыков
- `GET /api/assessments/:userId` — оценка пользователя
- `POST /api/assessments` — создать оценку
- `GET /api/assessments/questions/:specialization` — вопросы теста

## Категории задач
- Продукт
- Графический
- UX/UI
- 3D
- Кейсы

## Уровни сложности
- Intern
- Junior
- Middle
- Senior
- Lead

## Система XP и уровней

### Начисление XP
| Действие | XP |
|----------|-----|
| Решение задачи | 50 |
| Принятое решение | 100 |
| Победа в батле | 300 |
| 2-е место в батле | 150 |
| 3-е место в батле | 75 |
| Участие в батле | 25 |
| Создание батла | 50 |
| Создание задачи | 75 |
| Ежедневный вход | 10 |
| Заполнение профиля | 100 |
| Первое решение | 50 |
| Бонус за серию дней | 25 |

### Уровни
| Уровень | XP | Титул |
|---------|-----|-------|
| 1 | 0 | Новичок |
| 2 | 100 | Начинающий |
| 3 | 300 | Ученик |
| 4 | 600 | Практикант |
| 5 | 1000 | Дизайнер |
| 6 | 1500 | Опытный дизайнер |
| 7 | 2200 | Продвинутый |
| 8 | 3000 | Мастер |
| 9 | 4000 | Эксперт |
| 10 | 5500 | Гуру |
| 11 | 7500 | Легенда |
| 12 | 10000 | Элита |

### Таблицы БД для XP
- `user_xp` — XP пользователя, уровень, стрики
- `xp_transactions` — история начислений XP
