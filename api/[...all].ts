import type { IncomingMessage, ServerResponse } from "http";
import { createApp } from "../server/app";

export const config = {
  api: {
    bodyParser: false,
  },
};

let appPromise: ReturnType<typeof createApp> | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!appPromise) {
    appPromise = createApp({
      enableStatic: false,
      enableVite: false,
    });
  }

  const { app } = await appPromise;
  return app(req, res);
}
