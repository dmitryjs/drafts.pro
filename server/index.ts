import { createApp, log } from "./app";

(async () => {
  const isProduction = process.env.NODE_ENV === "production";
  const { httpServer } = await createApp({
    enableStatic: isProduction,
    enableVite: !isProduction,
  });

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  // Use localhost for local development, 0.0.0.0 for production/Replit
  const host =
    process.env.NODE_ENV === "production" && process.env.REPL_ID
      ? "0.0.0.0"
      : "127.0.0.1";
  httpServer.listen(
    port,
    host,
    () => {
      log(`serving on http://${host}:${port}`);
    },
  );
})();
