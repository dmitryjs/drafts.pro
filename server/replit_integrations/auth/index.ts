export { setupAuth, isAuthenticated, getSession } from "./replitAuth";
export { authStorage, type IAuthStorage } from "./storage";
export { registerAuthRoutes } from "./routes";

import type { RequestHandler } from "express";
import { authStorage } from "./storage";

export const isAdmin: RequestHandler = async (req, res, next) => {
  // Если Replit Auth не настроен, пропускаем проверку
  // Проверка админа будет на уровне роутов через email
  if (!process.env.REPL_ID) {
    const user = req.user as any;
    const email = user?.claims?.email;
    const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "galkindmitry27@gmail.com")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (!email || !superAdmins.includes(email)) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

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
