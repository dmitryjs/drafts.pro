import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated, isAdmin, authStorage } from "./replit_integrations/auth";
import { analyzeResume, generateTestRecommendations, evaluateFreeTextAnswers } from "./polzaAI";

async function seedDatabase() {
  const existingTasks = await storage.getTasks();
  if (existingTasks.length === 0) {
    console.log("Seeding database with sample design tasks...");
    
    // Create sample tasks
    await storage.createTask({
      slug: "retention-onboarding",
      title: "Увеличить Retention на этапе онбординга",
      description: `**Контекст:**
В продукте наблюдается существенный отток пользователей на этапе онбординга. Пользователи устанавливают приложение, проходят 1-2 шага начального сценария и покидают продукт, не доходя до первого «ценностного действия».

**По данным аналитики:**
- D1 Retention ниже целевого значения
- Основной дроп — между первым запуском и завершением онбординга
- Пользователи не всегда понимают ценность продукта до начала основного сценария

**Цель задачи:**
Повысить Retention пользователей за счёт улучшения онбординга и более раннего донесения ценности продукта.

**Что нужно сделать:**
1. Проанализировать текущий онбординг с точки зрения пользовательского пути
2. Выявить ключевые точки фрикции и потери пользователей
3. Предложить изменения в логике онбординга
4. Описать, как предложенные решения повлияют на Retention
5. Указать, какие метрики стоит отслеживать после внедрения`,
      category: "Продукт",
      level: "Middle",
      tags: ["retention", "onboarding", "b2c", "аналитика"],
      sphere: "Мобильные приложения",
      status: "published",
    });

    await storage.createTask({
      slug: "landing-redesign",
      title: "Редизайн лендинга для SaaS продукта",
      description: `**Контекст:**
Стартап выпускает B2B SaaS продукт для автоматизации HR-процессов. Текущий лендинг устарел и плохо конвертирует посетителей в лиды.

**Цель задачи:**
Разработать новый дизайн лендинга, который увеличит конверсию в заявку на демо.

**Что нужно сделать:**
1. Проанализировать целевую аудиторию и их боли
2. Разработать структуру лендинга
3. Создать UI дизайн главной страницы
4. Подготовить адаптивные версии`,
      category: "UX/UI",
      level: "Junior",
      tags: ["лендинг", "saas", "b2b", "конверсия"],
      sphere: "Веб",
      status: "published",
    });

    await storage.createTask({
      slug: "brand-identity",
      title: "Разработка фирменного стиля для кофейни",
      description: `**Контекст:**
Новая сеть кофеен открывает первую точку и нуждается в полном комплекте фирменного стиля.

**Что нужно сделать:**
1. Разработать логотип
2. Создать цветовую палитру
3. Подобрать шрифтовые пары
4. Разработать паттерны и графические элементы
5. Подготовить гайдлайн по использованию`,
      category: "Графический",
      level: "Senior",
      tags: ["брендинг", "логотип", "фирменный стиль"],
      sphere: "HoReCa",
      status: "published",
    });

    await storage.createTask({
      slug: "3d-product-visualization",
      title: "3D визуализация упаковки продукта",
      description: `**Контекст:**
Производитель косметики запускает новую линейку и нуждается в 3D визуализации упаковки для маркетинговых материалов.

**Что нужно сделать:**
1. Создать 3D модель флакона
2. Настроить материалы и освещение
3. Отрендерить несколько ракурсов
4. Подготовить изображения для соцсетей и каталога`,
      category: "3D",
      level: "Middle",
      tags: ["3d", "визуализация", "упаковка", "рендер"],
      sphere: "E-commerce",
      status: "published",
    });

    // Create sample battles
    await storage.createBattle({
      slug: "mobile-app-ui-battle",
      title: "UI для мобильного приложения",
      description: "Создайте концепт главного экрана мобильного приложения для доставки еды",
      theme: "Мобильный дизайн",
      category: "UX/UI",
      status: "active",
    });

    // Create sample mentors
    await storage.createMentor({
      userId: 1,
      slug: "ivan-petrov",
      fullName: "Иван Петров",
      title: "Principal Product Designer",
      company: "Яндекс",
      specializations: ["Продуктовый дизайн", "UX/UI дизайн"],
      bio: "15+ лет опыта в продуктовом дизайне. Работал над ключевыми продуктами Яндекса.",
      hourlyRate: 5000,
      isVerified: true,
      isAvailable: true,
      languages: ["Русский", "English"],
    });

    console.log("Database seeded!");
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup Replit Auth (BEFORE other routes)
  await setupAuth(app);
  registerAuthRoutes(app);
  
  // Seed data on startup
  seedDatabase();

  // Health
  app.get(api.health.check.path, (_req, res) => {
    res.json({ ok: true, ts: Date.now() });
  });

  // ============================================
  // PROFILES
  // ============================================
  
  app.post(api.profiles.upsert.path, async (req, res) => {
    try {
      const input = api.profiles.upsert.input.parse(req.body);
      const existingProfile = await storage.getProfileByAuthUid(input.authUid);
      if (existingProfile) {
        return res.status(200).json(existingProfile);
      }
      const profile = await storage.upsertProfile(input.authUid, input.email);
      res.status(201).json(profile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.profiles.get.path, async (req, res) => {
    const profile = await storage.getProfileByAuthUid(req.params.authUid);
    if (!profile) {
      return res.status(404).json({ message: "Профиль не найден" });
    }
    res.json(profile);
  });

  app.patch(api.profiles.update.path, async (req, res) => {
    try {
      const input = api.profiles.update.input.parse(req.body);
      const profile = await storage.updateProfile(parseInt(req.params.id), input);
      res.json(profile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // ============================================
  // TASKS (ЗАДАЧИ)
  // ============================================

  app.get(api.tasks.list.path, async (req, res) => {
    const filters = {
      category: req.query.category as string | undefined,
      level: req.query.level as string | undefined,
      status: req.query.status as string | undefined,
    };
    const tasks = await storage.getTasks(filters);
    res.json(tasks);
  });

  app.get(api.tasks.get.path, async (req, res) => {
    const task = await storage.getTaskBySlug(req.params.slug);
    if (!task) {
      return res.status(404).json({ message: "Задача не найдена" });
    }
    res.json(task);
  });

  app.post(api.tasks.create.path, async (req, res) => {
    try {
      const input = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask(input);
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.tasks.update.path, async (req, res) => {
    try {
      const input = api.tasks.update.input.parse(req.body);
      const task = await storage.updateTask(parseInt(req.params.id), input);
      res.json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.tasks.delete.path, async (req, res) => {
    await storage.deleteTask(parseInt(req.params.id));
    res.status(204).send();
  });

  // Task Votes
  app.post('/api/tasks/:taskId/vote', isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const { value } = req.body as { value: 1 | -1 };
      const profile = await storage.getProfileByAuthUid(req.user.claims.sub);
      if (!profile || !profile.userId) {
        return res.status(401).json({ message: "Необходима авторизация" });
      }
      const existingVote = await storage.getTaskVote(taskId, profile.userId);
      if (existingVote && existingVote.value === value) {
        await storage.deleteTaskVote(taskId, profile.userId);
        const counts = await storage.getTaskVoteCounts(taskId);
        return res.json({ ...counts, userVote: null });
      }
      await storage.upsertTaskVote(taskId, profile.userId, value);
      const counts = await storage.getTaskVoteCounts(taskId);
      res.json({ ...counts, userVote: value });
    } catch (err) {
      console.error('Error voting on task:', err);
      res.status(500).json({ message: "Ошибка при голосовании" });
    }
  });

  app.get('/api/tasks/:taskId/vote', async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const counts = await storage.getTaskVoteCounts(taskId);
      let userVote = null;
      if (req.user?.claims?.sub) {
        const profile = await storage.getProfileByAuthUid(req.user.claims.sub);
        if (profile?.userId) {
          const vote = await storage.getTaskVote(taskId, profile.userId);
          userVote = vote?.value || null;
        }
      }
      res.json({ ...counts, userVote });
    } catch (err) {
      console.error('Error getting task votes:', err);
      res.status(500).json({ message: "Ошибка при получении голосов" });
    }
  });

  // Task Favorites
  app.post('/api/tasks/:taskId/favorite', isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const profile = await storage.getProfileByAuthUid(req.user.claims.sub);
      if (!profile || !profile.userId) {
        return res.status(401).json({ message: "Необходима авторизация" });
      }
      const existing = await storage.getTaskFavorite(taskId, profile.userId);
      if (existing) {
        await storage.removeTaskFavorite(taskId, profile.userId);
        return res.json({ isFavorite: false });
      }
      await storage.addTaskFavorite(taskId, profile.userId);
      res.json({ isFavorite: true });
    } catch (err) {
      console.error('Error toggling favorite:', err);
      res.status(500).json({ message: "Ошибка при добавлении в избранное" });
    }
  });

  app.get('/api/tasks/:taskId/favorite', async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      let isFavorite = false;
      if (req.user?.claims?.sub) {
        const profile = await storage.getProfileByAuthUid(req.user.claims.sub);
        if (profile?.userId) {
          const fav = await storage.getTaskFavorite(taskId, profile.userId);
          isFavorite = !!fav;
        }
      }
      res.json({ isFavorite });
    } catch (err) {
      console.error('Error checking favorite status:', err);
      res.status(500).json({ message: "Ошибка при проверке избранного" });
    }
  });

  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const profile = await storage.getProfileByAuthUid(req.user.claims.sub);
      if (!profile || !profile.userId) {
        return res.json([]);
      }
      const favorites = await storage.getUserFavorites(profile.userId);
      res.json(favorites);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      res.status(500).json({ message: "Ошибка при получении избранного" });
    }
  });

  // ============================================
  // TASK DRAFTS (ЧЕРНОВИКИ)
  // ============================================

  app.get('/api/drafts', isAuthenticated, async (req: any, res) => {
    try {
      const profile = await storage.getProfileByAuthUid(req.user.claims.sub);
      if (!profile) {
        return res.json([]);
      }
      const drafts = await storage.getTaskDrafts(profile.id);
      res.json(drafts);
    } catch (err) {
      console.error('Error fetching drafts:', err);
      res.status(500).json({ message: "Ошибка при получении черновиков" });
    }
  });

  app.post('/api/drafts', isAuthenticated, async (req: any, res) => {
    try {
      const profile = await storage.getProfileByAuthUid(req.user.claims.sub);
      if (!profile) {
        return res.status(401).json({ message: "Профиль не найден" });
      }
      const draft = await storage.createTaskDraft({
        profileId: profile.id,
        ...req.body,
      });
      res.status(201).json(draft);
    } catch (err) {
      console.error('Error creating draft:', err);
      res.status(500).json({ message: "Ошибка при сохранении черновика" });
    }
  });

  app.delete('/api/drafts/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteTaskDraft(parseInt(req.params.id));
      res.status(204).send();
    } catch (err) {
      console.error('Error deleting draft:', err);
      res.status(500).json({ message: "Ошибка при удалении черновика" });
    }
  });

  // ============================================
  // TASK SOLUTIONS (РЕШЕНИЯ)
  // ============================================

  app.get(api.taskSolutions.list.path, async (req, res) => {
    const solutions = await storage.getTaskSolutions(parseInt(req.params.taskId));
    res.json(solutions);
  });

  app.get(api.taskSolutions.listByUser.path, async (req, res) => {
    const solutions = await storage.getUserSolutions(parseInt(req.params.userId));
    res.json(solutions);
  });

  app.post(api.taskSolutions.create.path, async (req, res) => {
    try {
      const input = api.taskSolutions.create.input.parse(req.body);
      const solution = await storage.createTaskSolution(input);
      res.status(201).json(solution);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // ============================================
  // BATTLES (ДИЗАЙН БАТЛЫ)
  // ============================================

  app.get(api.battles.list.path, async (req, res) => {
    const filters = {
      status: req.query.status as string | undefined,
      category: req.query.category as string | undefined,
    };
    const battles = await storage.getBattles(filters);
    res.json(battles);
  });

  app.get(api.battles.get.path, async (req, res) => {
    const battle = await storage.getBattleBySlug(req.params.slug);
    if (!battle) {
      return res.status(404).json({ message: "Батл не найден" });
    }
    res.json(battle);
  });

  app.post(api.battles.create.path, async (req, res) => {
    try {
      const input = api.battles.create.input.parse(req.body);
      const battle = await storage.createBattle(input);
      res.status(201).json(battle);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // ============================================
  // BATTLE ENTRIES
  // ============================================

  app.get(api.battleEntries.list.path, async (req, res) => {
    const entries = await storage.getBattleEntries(parseInt(req.params.battleId));
    res.json(entries);
  });

  app.post(api.battleEntries.create.path, async (req, res) => {
    try {
      const input = api.battleEntries.create.input.parse(req.body);
      const entry = await storage.createBattleEntry(input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // ============================================
  // SKILL ASSESSMENTS (ОЦЕНКА НАВЫКОВ)
  // ============================================

  app.get(api.assessments.get.path, async (req, res) => {
    const assessment = await storage.getAssessment(parseInt(req.params.userId));
    if (!assessment) {
      return res.status(404).json({ message: "Оценка не найдена" });
    }
    res.json(assessment);
  });

  app.post(api.assessments.create.path, async (req, res) => {
    try {
      const input = api.assessments.create.input.parse(req.body);
      const assessment = await storage.createAssessment(input);
      res.status(201).json(assessment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.assessments.getQuestions.path, async (req, res) => {
    const questions = await storage.getAssessmentQuestions(req.params.specialization);
    res.json(questions);
  });

  // ============================================
  // MENTORS (МЕНТОРЫ)
  // ============================================

  app.get(api.mentors.list.path, async (req, res) => {
    const filters = {
      specialization: req.query.specialization as string | undefined,
      isAvailable: req.query.isAvailable === 'true' ? true : undefined,
    };
    const mentors = await storage.getMentors(filters);
    res.json(mentors);
  });

  app.get(api.mentors.get.path, async (req, res) => {
    const mentor = await storage.getMentorBySlug(req.params.slug);
    if (!mentor) {
      return res.status(404).json({ message: "Ментор не найден" });
    }
    res.json(mentor);
  });

  app.post(api.mentors.create.path, async (req, res) => {
    try {
      const input = api.mentors.create.input.parse(req.body);
      const mentor = await storage.createMentor(input);
      res.status(201).json(mentor);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // ============================================
  // MENTOR SLOTS
  // ============================================

  app.get(api.mentorSlots.list.path, async (req, res) => {
    const slots = await storage.getMentorSlots(parseInt(req.params.mentorId));
    res.json(slots);
  });

  app.post(api.mentorSlots.create.path, async (req, res) => {
    try {
      const input = api.mentorSlots.create.input.parse(req.body);
      const slot = await storage.createMentorSlot(input);
      res.status(201).json(slot);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // ============================================
  // BOOKINGS (БРОНИРОВАНИЯ)
  // ============================================

  app.get(api.bookings.list.path, async (req, res) => {
    const bookings = await storage.getUserBookings(parseInt(req.params.userId));
    res.json(bookings);
  });

  app.post(api.bookings.create.path, async (req, res) => {
    try {
      const input = api.bookings.create.input.parse(req.body);
      const booking = await storage.createBooking(input);
      res.status(201).json(booking);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // ============================================
  // REVIEWS (ОТЗЫВЫ)
  // ============================================

  app.get(api.reviews.list.path, async (req, res) => {
    const reviews = await storage.getMentorReviews(parseInt(req.params.mentorId));
    res.json(reviews);
  });

  app.post(api.reviews.create.path, async (req, res) => {
    try {
      const input = api.reviews.create.input.parse(req.body);
      const review = await storage.createReview(input);
      res.status(201).json(review);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // ============================================
  // ASSESSMENT TESTS (ТЕСТЫ ДЛЯ ОЦЕНКИ)
  // ============================================

  app.get("/api/assessment-tests/:sphereId", async (req, res) => {
    const { sphereId } = req.params;
    const fs = await import("fs/promises");
    const path = await import("path");
    
    const testFiles: Record<string, string> = {
      "product": "product-designer-test.json"
    };
    
    const fileName = testFiles[sphereId];
    if (!fileName) {
      return res.status(404).json({ message: "Test not found for this sphere" });
    }
    
    try {
      const filePath = path.join(process.cwd(), "designers_tests", "data", fileName);
      const content = await fs.readFile(filePath, "utf-8");
      res.json(JSON.parse(content));
    } catch (err) {
      console.error("Failed to load test file:", err);
      res.status(500).json({ message: "Failed to load test" });
    }
  });

  // ============================================
  // POLZA AI - АНАЛИЗ РЕЗЮМЕ
  // ============================================

  app.post("/api/analyze-resume", async (req, res) => {
    try {
      const { resumeText, sphere } = req.body;
      
      if (!resumeText || typeof resumeText !== "string") {
        return res.status(400).json({ message: "Resume text is required" });
      }
      
      const analysis = await analyzeResume(resumeText, sphere || "product");
      res.json(analysis);
    } catch (err) {
      console.error("Error analyzing resume:", err);
      res.status(500).json({ message: "Failed to analyze resume" });
    }
  });

  // ============================================
  // POLZA AI - РЕКОМЕНДАЦИИ ПОСЛЕ ТЕСТА
  // ============================================

  app.post("/api/test-recommendations", async (req, res) => {
    try {
      const { sphere, testScore, incorrectTopics, gibberishAnswers } = req.body;
      
      if (typeof testScore !== "number") {
        return res.status(400).json({ message: "Test score is required" });
      }
      
      const recommendations = await generateTestRecommendations(
        sphere || "product",
        testScore,
        incorrectTopics || [],
        gibberishAnswers || []
      );
      res.json(recommendations);
    } catch (err) {
      console.error("Error generating recommendations:", err);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // ============================================
  // POLZA AI - ОЦЕНКА ОТКРЫТЫХ ВОПРОСОВ
  // ============================================

  app.post("/api/evaluate-free-text", async (req, res) => {
    try {
      const { sphere, answers } = req.body;
      
      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: "Answers array is required" });
      }
      
      const evaluation = await evaluateFreeTextAnswers(sphere || "product", answers);
      res.json(evaluation);
    } catch (err) {
      console.error("Error evaluating free text:", err);
      res.status(500).json({ message: "Failed to evaluate answers" });
    }
  });

  // ============================================
  // ADMIN ROUTES (СУПЕР АДМИН)
  // ============================================

  // Check if current user is admin
  app.get("/api/admin/check", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const isUserAdmin = await authStorage.isAdmin(userId);
      res.json({ isAdmin: isUserAdmin });
    } catch (err) {
      console.error("Error checking admin status:", err);
      res.status(500).json({ message: "Failed to check admin status" });
    }
  });

  // Get all users (admin only)
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await authStorage.getAllUsers();
      res.json(users);
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Set admin status (admin only)
  app.patch("/api/admin/users/:userId/admin", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { isAdmin: setAdmin } = req.body;
      const user = await authStorage.setAdmin(userId, setAdmin === true);
      res.json(user);
    } catch (err) {
      console.error("Error setting admin status:", err);
      res.status(500).json({ message: "Failed to set admin status" });
    }
  });

  // Get all battles for admin (including pending verification)
  app.get("/api/admin/battles", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const battles = await storage.getBattles({});
      res.json(battles);
    } catch (err) {
      console.error("Error fetching battles:", err);
      res.status(500).json({ message: "Failed to fetch battles" });
    }
  });

  // Update battle status (admin only)
  app.patch("/api/admin/battles/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const battle = await storage.updateBattle(parseInt(id), req.body);
      res.json(battle);
    } catch (err) {
      console.error("Error updating battle:", err);
      res.status(500).json({ message: "Failed to update battle" });
    }
  });

  // Delete battle (admin only)
  app.delete("/api/admin/battles/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteBattle(parseInt(req.params.id));
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting battle:", err);
      res.status(500).json({ message: "Failed to delete battle" });
    }
  });

  // Get admin dashboard stats
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const [usersCount, tasks, battles, assessmentQuestions] = await Promise.all([
        authStorage.getUsersCount(),
        storage.getTasks(),
        storage.getBattles({}),
        storage.getAssessmentQuestions("product")
      ]);
      
      res.json({
        usersCount,
        tasksCount: tasks.length,
        battlesCount: battles.length,
        questionsCount: assessmentQuestions.length,
        activeBattles: battles.filter((b: any) => b.status === "active").length,
        pendingBattles: battles.filter((b: any) => b.status === "upcoming").length,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get all assessment questions (admin only)
  app.get("/api/admin/questions", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { sphere } = req.query;
      const questions = await storage.getAssessmentQuestions(sphere as string || "product");
      res.json(questions);
    } catch (err) {
      console.error("Error fetching questions:", err);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Create assessment question (admin only)
  app.post("/api/admin/questions", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const question = await storage.createAssessmentQuestion(req.body);
      res.status(201).json(question);
    } catch (err) {
      console.error("Error creating question:", err);
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  // Update assessment question (admin only)
  app.patch("/api/admin/questions/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const question = await storage.updateAssessmentQuestion(parseInt(req.params.id), req.body);
      res.json(question);
    } catch (err) {
      console.error("Error updating question:", err);
      res.status(500).json({ message: "Failed to update question" });
    }
  });

  // Delete assessment question (admin only)
  app.delete("/api/admin/questions/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteAssessmentQuestion(parseInt(req.params.id));
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting question:", err);
      res.status(500).json({ message: "Failed to delete question" });
    }
  });

  return httpServer;
}
