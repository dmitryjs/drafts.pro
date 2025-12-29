import { z } from 'zod';
import { insertProblemSchema, insertSubmissionSchema, insertTrackSchema, insertUserSchema, insertProfileSchema, problems, submissions, tracks, users, profiles } from './schema';

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

export const api = {
  health: {
    check: {
      method: 'GET' as const,
      path: '/api/health',
      responses: {
        200: z.object({ ok: z.boolean(), ts: z.number() }),
      },
    },
  },
  tracks: {
    list: {
      method: 'GET' as const,
      path: '/api/tracks',
      responses: {
        200: z.array(z.custom<typeof tracks.$inferSelect>()),
      },
    },
  },
  problems: {
    list: {
      method: 'GET' as const,
      path: '/api/problems',
      input: z.object({
        trackId: z.coerce.number().optional(),
        difficulty: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof problems.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/problems/:slug',
      responses: {
        200: z.custom<typeof problems.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  submissions: {
    list: {
      method: 'GET' as const,
      path: '/api/submissions',
      responses: {
        200: z.array(z.custom<typeof submissions.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/submissions',
      input: insertSubmissionSchema,
      responses: {
        201: z.custom<typeof submissions.$inferSelect>(),
      },
    },
  },
  profiles: {
    upsert: {
      method: 'POST' as const,
      path: '/api/profiles/upsert',
      input: z.object({
        authUid: z.string(),
        email: z.string().email(),
      }),
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        201: z.custom<typeof profiles.$inferSelect>(),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/profiles/:authUid',
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

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
