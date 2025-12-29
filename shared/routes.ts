import { z } from "zod";
import {
  insertTaskSchema,
  insertTaskSolutionSchema,
  insertBattleSchema,
  insertBattleEntrySchema,
  insertBattleVoteSchema,
  insertSkillAssessmentSchema,
  insertMentorSchema,
  insertMentorSlotSchema,
  insertMentorBookingSchema,
  insertMentorReviewSchema,
  insertProfileSchema,
} from "./schema";

// ============================================
// ERROR SCHEMAS
// ============================================

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API ROUTE DEFINITIONS
// ============================================

export const api = {
  // Health check
  health: {
    check: {
      method: "GET" as const,
      path: "/api/health",
      responses: {
        200: z.object({ ok: z.boolean(), ts: z.number() }),
      },
    },
  },

  // Profiles
  profiles: {
    get: {
      method: "GET" as const,
      path: "/api/profiles/:authUid",
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    upsert: {
      method: "POST" as const,
      path: "/api/profiles/upsert",
      input: z.object({
        authUid: z.string(),
        email: z.string().email(),
      }),
      responses: {
        200: z.any(),
        201: z.any(),
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/profiles/:id",
      input: insertProfileSchema.partial(),
      responses: {
        200: z.any(),
      },
    },
  },

  // Tasks (Задачи)
  tasks: {
    list: {
      method: "GET" as const,
      path: "/api/tasks",
      query: z.object({
        category: z.string().optional(),
        level: z.string().optional(),
        status: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.any()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/tasks/:slug",
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/tasks",
      input: insertTaskSchema,
      responses: {
        201: z.any(),
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/tasks/:id",
      input: insertTaskSchema.partial(),
      responses: {
        200: z.any(),
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/tasks/:id",
      responses: {
        204: z.null(),
      },
    },
  },

  // Task Solutions (Решения задач)
  taskSolutions: {
    list: {
      method: "GET" as const,
      path: "/api/tasks/:taskId/solutions",
      responses: {
        200: z.array(z.any()),
      },
    },
    listByUser: {
      method: "GET" as const,
      path: "/api/users/:userId/solutions",
      responses: {
        200: z.array(z.any()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/tasks/:taskId/solutions",
      input: insertTaskSolutionSchema,
      responses: {
        201: z.any(),
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/solutions/:id",
      input: insertTaskSolutionSchema.partial(),
      responses: {
        200: z.any(),
      },
    },
  },

  // Battles (Дизайн батлы)
  battles: {
    list: {
      method: "GET" as const,
      path: "/api/battles",
      query: z.object({
        status: z.string().optional(),
        category: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.any()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/battles/:slug",
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/battles",
      input: insertBattleSchema,
      responses: {
        201: z.any(),
      },
    },
  },

  // Battle Entries (Работы на батле)
  battleEntries: {
    list: {
      method: "GET" as const,
      path: "/api/battles/:battleId/entries",
      responses: {
        200: z.array(z.any()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/battles/:battleId/entries",
      input: insertBattleEntrySchema,
      responses: {
        201: z.any(),
      },
    },
    vote: {
      method: "POST" as const,
      path: "/api/battles/:battleId/entries/:entryId/vote",
      input: insertBattleVoteSchema,
      responses: {
        201: z.any(),
      },
    },
  },

  // Skill Assessments (Оценка навыков)
  assessments: {
    get: {
      method: "GET" as const,
      path: "/api/assessments/:userId",
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/assessments",
      input: insertSkillAssessmentSchema,
      responses: {
        201: z.any(),
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/assessments/:id",
      input: insertSkillAssessmentSchema.partial(),
      responses: {
        200: z.any(),
      },
    },
    getQuestions: {
      method: "GET" as const,
      path: "/api/assessments/questions/:specialization",
      responses: {
        200: z.array(z.any()),
      },
    },
  },

  // Mentors (Менторы)
  mentors: {
    list: {
      method: "GET" as const,
      path: "/api/mentors",
      query: z.object({
        specialization: z.string().optional(),
        isAvailable: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.any()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/mentors/:slug",
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/mentors",
      input: insertMentorSchema,
      responses: {
        201: z.any(),
      },
    },
  },

  // Mentor Slots (Слоты менторов)
  mentorSlots: {
    list: {
      method: "GET" as const,
      path: "/api/mentors/:mentorId/slots",
      responses: {
        200: z.array(z.any()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/mentors/:mentorId/slots",
      input: insertMentorSlotSchema,
      responses: {
        201: z.any(),
      },
    },
  },

  // Mentor Bookings (Бронирования)
  bookings: {
    list: {
      method: "GET" as const,
      path: "/api/users/:userId/bookings",
      responses: {
        200: z.array(z.any()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/bookings",
      input: insertMentorBookingSchema,
      responses: {
        201: z.any(),
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/bookings/:id",
      input: insertMentorBookingSchema.partial(),
      responses: {
        200: z.any(),
      },
    },
  },

  // Mentor Reviews (Отзывы о менторах)
  reviews: {
    list: {
      method: "GET" as const,
      path: "/api/mentors/:mentorId/reviews",
      responses: {
        200: z.array(z.any()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/reviews",
      input: insertMentorReviewSchema,
      responses: {
        201: z.any(),
      },
    },
  },
};

// Helper to build URL with params
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
