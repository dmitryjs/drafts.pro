import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

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

  // Task Interactions (upvote/downvote/bookmark)
  app.post('/api/tasks/:taskId/interact', async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const { action } = req.body as { action: 'upvote' | 'downvote' | 'bookmark' };
      
      const task = await storage.getTaskById(taskId);
      if (!task) {
        return res.status(404).json({ message: "Задача не найдена" });
      }
      
      // For now, return a success response
      // In a full implementation, this would track user-specific interactions in DB
      res.json({ 
        success: true, 
        action, 
        taskId,
        message: action === 'upvote' ? 'Голос учтён' : 
                 action === 'downvote' ? 'Голос учтён' : 'Добавлено в закладки'
      });
    } catch (err) {
      console.error('Error interacting with task:', err);
      res.status(500).json({ message: "Ошибка при взаимодействии с задачей" });
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

  return httpServer;
}
