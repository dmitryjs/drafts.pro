export { setupAuth, isAuthenticated, getSession } from "./replitAuth";
export { authStorage, type IAuthStorage } from "./storage";
export { registerAuthRoutes } from "./routes";

import type { RequestHandler } from "express";
import { authStorage } from "./storage";

export const isAdmin: RequestHandler = async (req, res, next) => {
  // Если Replit Auth не настроен, пропускаем проверку
  // Проверка админа будет на уровне роутов через email
  if (!process.env.REPL_ID) {
    return next();
  }

  const user = req.user as any;
  
  if (typeof req.isAuthenticated !== 'function' || !req.isAuthenticated() || !user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const isUserAdmin = await authStorage.isAdmin(user.claims.sub);
  if (!isUserAdmin) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  
  next();
};
