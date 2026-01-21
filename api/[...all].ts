import type { IncomingMessage, ServerResponse } from "http";
import { createRequire } from "module";

export const config = {
  api: {
    bodyParser: false,
  },
};

type AppFactory = (options: { enableVite: boolean; enableStatic: boolean }) => Promise<{
  app: (req: IncomingMessage, res: ServerResponse) => void;
  httpServer: unknown;
}>;

const require = createRequire(import.meta.url);
let appPromise: ReturnType<AppFactory> | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!appPromise) {
    const { createApp } = require("../dist/server/app.cjs") as { createApp: AppFactory };
    appPromise = createApp({
      enableStatic: false,
      enableVite: false,
    });
  }

  const { app } = await appPromise;
  return app(req, res);
}
