import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// ENUMS
// ============================================

export const TaskCategory = {
  PRODUCT: "Продукт",
  GRAPHIC: "Графический",
  UXUI: "UX/UI",
  THREED: "3D",
  CASES: "Кейсы",
} as const;

export const TaskLevel = {
  INTERN: "Intern",
  JUNIOR: "Junior",
  MIDDLE: "Middle",
  SENIOR: "Senior",
  LEAD: "Lead",
} as const;

export const TaskStatus = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export const SolutionStatus = {
  PENDING: "pending",
  REVIEWED: "reviewed",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
} as const;

export const BattleStatus = {
  UPCOMING: "upcoming",
  ACTIVE: "active",
  VOTING: "voting",
  FINISHED: "finished",
} as const;

export const MentorSpecialization = {
  PRODUCT: "Продуктовый дизайн",
  GRAPHIC: "Графический дизайн",
  UXUI: "UX/UI дизайн",
  THREED: "3D дизайн",
  MOTION: "Motion дизайн",
  BRAND: "Брендинг",
} as const;

// ============================================
// USERS & PROFILES
// ============================================

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  authUid: text("auth_uid").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  authUid: text("auth_uid").unique(),
  email: text("email").notNull(),
  username: text("username"),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  profession: text("profession"),
  company: text("company"),
  location: text("location"),
  portfolioUrl: text("portfolio_url"),
  telegramUsername: text("telegram_username"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// TASKS (ЗАДАЧИ)
// ============================================

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // Продукт, Графический, UX/UI, 3D, Кейсы
  level: text("level").notNull(), // Intern, Junior, Middle, Senior, Lead
  tags: text("tags").array(),
  sphere: text("sphere"), // Сфера применения
  attachments: jsonb("attachments"), // Вложения (ссылки на файлы)
  authorId: integer("author_id").references(() => users.id),
  status: text("status").default("published"),
  solutionsCount: integer("solutions_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const taskSolutions = pgTable("task_solutions", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  figmaUrl: text("figma_url"),
  description: text("description"),
  attachments: jsonb("attachments"),
  status: text("status").default("pending"),
  feedback: text("feedback"),
  rating: integer("rating"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// DESIGN BATTLES (ДИЗАЙН БАТЛЫ)
// ============================================

export const battles = pgTable("battles", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  theme: text("theme").notNull(), // Тема батла
  category: text("category").notNull(),
  coverImage: text("cover_image"),
  status: text("status").default("upcoming"), // upcoming, active, voting, finished
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  votingEndDate: timestamp("voting_end_date"),
  prizeDescription: text("prize_description"),
  participantsCount: integer("participants_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const battleEntries = pgTable("battle_entries", {
  id: serial("id").primaryKey(),
  battleId: integer("battle_id").references(() => battles.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title"),
  imageUrl: text("image_url").notNull(),
  figmaUrl: text("figma_url"),
  description: text("description"),
  votesCount: integer("votes_count").default(0),
  rank: integer("rank"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const battleVotes = pgTable("battle_votes", {
  id: serial("id").primaryKey(),
  battleId: integer("battle_id").references(() => battles.id).notNull(),
  entryId: integer("entry_id").references(() => battleEntries.id).notNull(),
  voterId: integer("voter_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// SKILL ASSESSMENT (ОЦЕНКА НАВЫКОВ)
// ============================================

export const skillAssessments = pgTable("skill_assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  portfolioUrl: text("portfolio_url"),
  resumeUrl: text("resume_url"),
  specialization: text("specialization"),
  experienceYears: integer("experience_years"),
  testScore: integer("test_score"),
  overallLevel: text("overall_level"), // Junior, Middle, Senior, Lead
  recommendedSalaryMin: integer("recommended_salary_min"),
  recommendedSalaryMax: integer("recommended_salary_max"),
  skills: jsonb("skills"), // { skill: level } object
  strengths: text("strengths").array(),
  areasToImprove: text("areas_to_improve").array(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assessmentQuestions = pgTable("assessment_questions", {
  id: serial("id").primaryKey(),
  specialization: text("specialization").notNull(),
  question: text("question").notNull(),
  options: jsonb("options").notNull(), // Array of { text, isCorrect, points }
  category: text("category"), // Теория, Практика, Инструменты
  difficulty: text("difficulty"), // Easy, Medium, Hard
  order: integer("order"),
});

// ============================================
// MENTORS (МЕНТОРЫ)
// ============================================

export const mentors = pgTable("mentors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  slug: text("slug").notNull().unique(),
  fullName: text("full_name").notNull(),
  avatarUrl: text("avatar_url"),
  title: text("title").notNull(), // Должность
  company: text("company"),
  specializations: text("specializations").array(),
  bio: text("bio"),
  experience: text("experience"),
  hourlyRate: integer("hourly_rate"), // Цена за час в рублях
  rating: integer("rating").default(0), // 0-50 (умножить на 0.1 для звёзд)
  reviewsCount: integer("reviews_count").default(0),
  sessionsCount: integer("sessions_count").default(0),
  isVerified: boolean("is_verified").default(false),
  isAvailable: boolean("is_available").default(true),
  languages: text("languages").array(),
  socialLinks: jsonb("social_links"), // { telegram, linkedin, behance, dribbble }
  createdAt: timestamp("created_at").defaultNow(),
});

export const mentorSlots = pgTable("mentor_slots", {
  id: serial("id").primaryKey(),
  mentorId: integer("mentor_id").references(() => mentors.id).notNull(),
  date: timestamp("date").notNull(),
  durationMinutes: integer("duration_minutes").default(60),
  isBooked: boolean("is_booked").default(false),
  price: integer("price"),
});

export const mentorBookings = pgTable("mentor_bookings", {
  id: serial("id").primaryKey(),
  slotId: integer("slot_id").references(() => mentorSlots.id).notNull(),
  mentorId: integer("mentor_id").references(() => mentors.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  topic: text("topic"),
  notes: text("notes"),
  status: text("status").default("pending"), // pending, confirmed, completed, cancelled
  meetingUrl: text("meeting_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mentorReviews = pgTable("mentor_reviews", {
  id: serial("id").primaryKey(),
  mentorId: integer("mentor_id").references(() => mentors.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  bookingId: integer("booking_id").references(() => mentorBookings.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// XP & GAMIFICATION SYSTEM
// ============================================

export const XpActionType = {
  TASK_SOLVED: "task_solved",
  TASK_ACCEPTED: "task_accepted",
  BATTLE_WIN: "battle_win",
  BATTLE_SECOND: "battle_second",
  BATTLE_THIRD: "battle_third",
  BATTLE_PARTICIPATION: "battle_participation",
  BATTLE_CREATED: "battle_created",
  TASK_CREATED: "task_created",
  DAILY_LOGIN: "daily_login",
  PROFILE_COMPLETED: "profile_completed",
  FIRST_SOLUTION: "first_solution",
  STREAK_BONUS: "streak_bonus",
} as const;

export const XpRewards = {
  TASK_SOLVED: 50,
  TASK_ACCEPTED: 100,
  BATTLE_WIN: 300,
  BATTLE_SECOND: 150,
  BATTLE_THIRD: 75,
  BATTLE_PARTICIPATION: 25,
  BATTLE_CREATED: 50,
  TASK_CREATED: 75,
  DAILY_LOGIN: 10,
  PROFILE_COMPLETED: 100,
  FIRST_SOLUTION: 50,
  STREAK_BONUS: 25,
} as const;

export const LevelThresholds = [
  { level: 1, xpRequired: 0, title: "Новичок" },
  { level: 2, xpRequired: 100, title: "Начинающий" },
  { level: 3, xpRequired: 300, title: "Ученик" },
  { level: 4, xpRequired: 600, title: "Практикант" },
  { level: 5, xpRequired: 1000, title: "Дизайнер" },
  { level: 6, xpRequired: 1500, title: "Опытный дизайнер" },
  { level: 7, xpRequired: 2200, title: "Продвинутый" },
  { level: 8, xpRequired: 3000, title: "Мастер" },
  { level: 9, xpRequired: 4000, title: "Эксперт" },
  { level: 10, xpRequired: 5500, title: "Гуру" },
  { level: 11, xpRequired: 7500, title: "Легенда" },
  { level: 12, xpRequired: 10000, title: "Элита" },
] as const;

export const userXp = pgTable("user_xp", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  totalXp: integer("total_xp").default(0),
  currentLevel: integer("current_level").default(1),
  dailyStreak: integer("daily_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastDailyLogin: timestamp("last_daily_login"),
  tasksCompleted: integer("tasks_completed").default(0),
  battlesWon: integer("battles_won").default(0),
  battlesParticipated: integer("battles_participated").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const xpTransactions = pgTable("xp_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  actionType: text("action_type").notNull(),
  xpAmount: integer("xp_amount").notNull(),
  description: text("description"),
  relatedTaskId: integer("related_task_id").references(() => tasks.id),
  relatedBattleId: integer("related_battle_id").references(() => battles.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// INSERT SCHEMAS
// ============================================

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, createdAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, solutionsCount: true });
export const insertTaskSolutionSchema = createInsertSchema(taskSolutions).omit({ id: true, createdAt: true });
export const insertBattleSchema = createInsertSchema(battles).omit({ id: true, createdAt: true, participantsCount: true });
export const insertBattleEntrySchema = createInsertSchema(battleEntries).omit({ id: true, createdAt: true, votesCount: true, rank: true });
export const insertBattleVoteSchema = createInsertSchema(battleVotes).omit({ id: true, createdAt: true });
export const insertSkillAssessmentSchema = createInsertSchema(skillAssessments).omit({ id: true, createdAt: true });
export const insertMentorSchema = createInsertSchema(mentors).omit({ id: true, createdAt: true, rating: true, reviewsCount: true, sessionsCount: true });
export const insertMentorSlotSchema = createInsertSchema(mentorSlots).omit({ id: true });
export const insertMentorBookingSchema = createInsertSchema(mentorBookings).omit({ id: true, createdAt: true });
export const insertMentorReviewSchema = createInsertSchema(mentorReviews).omit({ id: true, createdAt: true });
export const insertUserXpSchema = createInsertSchema(userXp).omit({ id: true, createdAt: true, updatedAt: true });
export const insertXpTransactionSchema = createInsertSchema(xpTransactions).omit({ id: true, createdAt: true });

// ============================================
// TYPES
// ============================================

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type TaskSolution = typeof taskSolutions.$inferSelect;
export type InsertTaskSolution = z.infer<typeof insertTaskSolutionSchema>;

export type Battle = typeof battles.$inferSelect;
export type InsertBattle = z.infer<typeof insertBattleSchema>;

export type BattleEntry = typeof battleEntries.$inferSelect;
export type InsertBattleEntry = z.infer<typeof insertBattleEntrySchema>;

export type BattleVote = typeof battleVotes.$inferSelect;
export type InsertBattleVote = z.infer<typeof insertBattleVoteSchema>;

export type SkillAssessment = typeof skillAssessments.$inferSelect;
export type InsertSkillAssessment = z.infer<typeof insertSkillAssessmentSchema>;

export type Mentor = typeof mentors.$inferSelect;
export type InsertMentor = z.infer<typeof insertMentorSchema>;

export type MentorSlot = typeof mentorSlots.$inferSelect;
export type InsertMentorSlot = z.infer<typeof insertMentorSlotSchema>;

export type MentorBooking = typeof mentorBookings.$inferSelect;
export type InsertMentorBooking = z.infer<typeof insertMentorBookingSchema>;

export type MentorReview = typeof mentorReviews.$inferSelect;
export type InsertMentorReview = z.infer<typeof insertMentorReviewSchema>;

export type UserXp = typeof userXp.$inferSelect;
export type InsertUserXp = z.infer<typeof insertUserXpSchema>;

export type XpTransaction = typeof xpTransactions.$inferSelect;
export type InsertXpTransaction = z.infer<typeof insertXpTransactionSchema>;
