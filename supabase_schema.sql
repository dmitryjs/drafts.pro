-- ============================================
-- SUPABASE DATABASE SCHEMA
-- Создание всех таблиц для платформы Drafts
-- ============================================

-- ВАЖНО: Выполните этот скрипт в Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Вставьте этот скрипт → Run

-- ============================================
-- 1. USERS & PROFILES (Пользователи и профили)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  auth_uid TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  auth_uid TEXT UNIQUE,
  email TEXT NOT NULL,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  profession TEXT,
  company TEXT,
  country TEXT,
  city TEXT,
  grade TEXT,
  location TEXT,
  portfolio_url TEXT,
  telegram_username TEXT,
  behance_url TEXT,
  dribbble_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_auth_uid ON profiles(auth_uid);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- ============================================
-- 2. COMPANIES (Компании)
-- ============================================

CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  password TEXT,
  logo_url TEXT,
  website TEXT,
  description TEXT,
  industry TEXT,
  size TEXT,
  tasks_created INTEGER DEFAULT 0,
  battles_created INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3. TASKS (Задачи)
-- ============================================

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  tags TEXT[],
  sphere TEXT,
  attachments JSONB,
  author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'published',
  solutions_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_author_id ON tasks(author_id);
CREATE INDEX IF NOT EXISTS idx_tasks_company_id ON tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_level ON tasks(level);

CREATE TABLE IF NOT EXISTS task_solutions (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  figma_url TEXT,
  description TEXT,
  attachments JSONB,
  status TEXT DEFAULT 'pending',
  feedback TEXT,
  rating INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_solutions_task_id ON task_solutions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_solutions_user_id ON task_solutions(user_id);

CREATE TABLE IF NOT EXISTS task_votes (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  value INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

CREATE TABLE IF NOT EXISTS task_favorites (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

CREATE TABLE IF NOT EXISTS task_drafts (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  category TEXT,
  level TEXT,
  tags TEXT[],
  spheres TEXT[],
  attachments JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_drafts_profile_id ON task_drafts(profile_id);

-- ============================================
-- 4. BATTLES (Дизайн батлы)
-- ============================================

CREATE TABLE IF NOT EXISTS battles (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  theme TEXT NOT NULL,
  category TEXT NOT NULL,
  cover_image TEXT,
  status TEXT DEFAULT 'upcoming',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  voting_end_date TIMESTAMP,
  prize_description TEXT,
  participants_count INTEGER DEFAULT 0,
  created_by INTEGER REFERENCES profiles(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_battles_status ON battles(status);
CREATE INDEX IF NOT EXISTS idx_battles_created_by ON battles(created_by);

CREATE TABLE IF NOT EXISTS battle_entries (
  id SERIAL PRIMARY KEY,
  battle_id INTEGER NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  image_url TEXT NOT NULL,
  figma_url TEXT,
  description TEXT,
  votes_count INTEGER DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_battle_entries_battle_id ON battle_entries(battle_id);
CREATE INDEX IF NOT EXISTS idx_battle_entries_user_id ON battle_entries(user_id);

CREATE TABLE IF NOT EXISTS battle_votes (
  id SERIAL PRIMARY KEY,
  battle_id INTEGER NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  entry_id INTEGER NOT NULL REFERENCES battle_entries(id) ON DELETE CASCADE,
  voter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  xp_awarded BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(battle_id, entry_id, voter_id)
);

CREATE TABLE IF NOT EXISTS battle_comments (
  id SERIAL PRIMARY KEY,
  battle_id INTEGER NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_battle_comments_battle_id ON battle_comments(battle_id);
CREATE INDEX IF NOT EXISTS idx_battle_comments_profile_id ON battle_comments(profile_id);

CREATE TABLE IF NOT EXISTS battle_comment_votes (
  id SERIAL PRIMARY KEY,
  comment_id INTEGER NOT NULL REFERENCES battle_comments(id) ON DELETE CASCADE,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  value INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(comment_id, profile_id)
);

-- ============================================
-- 5. SKILL ASSESSMENT (Оценка навыков)
-- ============================================

CREATE TABLE IF NOT EXISTS skill_assessments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  portfolio_url TEXT,
  resume_url TEXT,
  specialization TEXT,
  experience_years INTEGER,
  test_score INTEGER,
  overall_level TEXT,
  recommended_salary_min INTEGER,
  recommended_salary_max INTEGER,
  skills JSONB,
  strengths TEXT[],
  areas_to_improve TEXT[],
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skill_assessments_user_id ON skill_assessments(user_id);

CREATE TABLE IF NOT EXISTS assessment_questions (
  id SERIAL PRIMARY KEY,
  specialization TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  category TEXT,
  difficulty TEXT,
  "order" INTEGER
);

CREATE INDEX IF NOT EXISTS idx_assessment_questions_specialization ON assessment_questions(specialization);

-- ============================================
-- 6. MENTORS (Менторы)
-- ============================================

CREATE TABLE IF NOT EXISTS mentors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  title TEXT NOT NULL,
  company TEXT,
  specializations TEXT[],
  bio TEXT,
  experience TEXT,
  hourly_rate INTEGER,
  rating INTEGER DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  sessions_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  languages TEXT[],
  social_links JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentors_user_id ON mentors(user_id);
CREATE INDEX IF NOT EXISTS idx_mentors_slug ON mentors(slug);

CREATE TABLE IF NOT EXISTS mentor_slots (
  id SERIAL PRIMARY KEY,
  mentor_id INTEGER NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  date TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  is_booked BOOLEAN DEFAULT false,
  price INTEGER
);

CREATE INDEX IF NOT EXISTS idx_mentor_slots_mentor_id ON mentor_slots(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_slots_date ON mentor_slots(date);

CREATE TABLE IF NOT EXISTS mentor_bookings (
  id SERIAL PRIMARY KEY,
  slot_id INTEGER NOT NULL REFERENCES mentor_slots(id) ON DELETE CASCADE,
  mentor_id INTEGER NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  meeting_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentor_bookings_slot_id ON mentor_bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_mentor_bookings_mentor_id ON mentor_bookings(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_bookings_user_id ON mentor_bookings(user_id);

CREATE TABLE IF NOT EXISTS mentor_reviews (
  id SERIAL PRIMARY KEY,
  mentor_id INTEGER NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id INTEGER REFERENCES mentor_bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentor_reviews_mentor_id ON mentor_reviews(mentor_id);

-- ============================================
-- 7. XP & GAMIFICATION (Система опыта)
-- ============================================

CREATE TABLE IF NOT EXISTS user_xp (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  daily_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_daily_login TIMESTAMP,
  tasks_completed INTEGER DEFAULT 0,
  battles_won INTEGER DEFAULT 0,
  battles_participated INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_xp_user_id ON user_xp(user_id);

CREATE TABLE IF NOT EXISTS xp_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  xp_amount INTEGER NOT NULL,
  description TEXT,
  related_task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
  related_battle_id INTEGER REFERENCES battles(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_action_type ON xp_transactions(action_type);

-- ============================================
-- 8. NOTIFICATIONS (Уведомления)
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ============================================
-- 9. SESSIONS (Сессии для express-session)
-- ============================================

CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_expire ON sessions(expire);

-- ============================================
-- 10. AUTH USERS (Для совместимости с Replit Auth)
-- ============================================

CREATE TABLE IF NOT EXISTS auth_users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ГОТОВО!
-- ============================================
-- Все таблицы созданы. Теперь можно использовать платформу.
-- Проверьте таблицы в Supabase Dashboard → Table Editor
