// Минимальная реализация storage через Supabase API
// Только критичные операции для запуска MVP
import { supabaseServer } from "./supabase-server";
import type { Profile, InsertProfile, TaskSolution } from "@shared/schema";

export class SupabaseStorage {
  // ============================================
  // PROFILES (критично для MVP)
  // ============================================

  async getProfileByAuthUid(authUid: string): Promise<Profile | undefined> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }

    const { data, error } = await supabaseServer
      .from("profiles")
      .select("*")
      .eq("auth_uid", authUid)
      .single();

    if (error) {
      if (error.code === "PGRST116" || error.message?.includes("No rows")) {
        // No rows returned
        return undefined;
      }
      console.error("Error getting profile by authUid:", error);
      throw error;
    }

    // Преобразуем snake_case в camelCase для совместимости
    if (data) {
      return {
        ...data,
        fullName: data.full_name,
        avatarUrl: data.avatar_url,
        telegramUsername: data.telegram_username,
        behanceUrl: data.behance_url,
        dribbbleUrl: data.dribbble_url,
        portfolioUrl: data.portfolio_url,
        createdAt: data.created_at,
        isPro: data.is_pro || false, // Добавляем isPro из is_pro
      } as Profile;
    }

    return undefined;
  }

  async getProfileById(id: number): Promise<Profile | undefined> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }

    const { data, error } = await supabaseServer
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116" || error.message?.includes("No rows")) {
        return undefined;
      }
      console.error("Error getting profile by id:", error);
      throw error;
    }

    // Преобразуем snake_case в camelCase
    if (data) {
      return {
        ...data,
        fullName: data.full_name,
        avatarUrl: data.avatar_url,
        telegramUsername: data.telegram_username,
        behanceUrl: data.behance_url,
        dribbbleUrl: data.dribbble_url,
        portfolioUrl: data.portfolio_url,
        createdAt: data.created_at,
      } as Profile;
    }

    return undefined;
  }

  async upsertProfile(authUid: string, email: string): Promise<Profile> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }

    // Проверяем, существует ли профиль
    const existing = await this.getProfileByAuthUid(authUid);
    
    if (existing) {
      return existing;
    }

    // Создаем новый профиль
    const { data, error } = await supabaseServer
      .from("profiles")
      .insert({
        auth_uid: authUid,
        email: email,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating profile:", error);
      throw error;
    }

          // Преобразуем snake_case в camelCase
          if (data) {
            return {
              ...data,
              fullName: data.full_name,
              avatarUrl: data.avatar_url,
              telegramUsername: data.telegram_username,
              behanceUrl: data.behance_url,
              dribbbleUrl: data.dribbble_url,
              portfolioUrl: data.portfolio_url,
              createdAt: data.created_at,
              isPro: data.is_pro || false, // Добавляем isPro из is_pro
            } as Profile;
          }

          throw new Error("Failed to create profile");
  }

  async updateProfile(id: number, data: Partial<InsertProfile>): Promise<Profile> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }

    // Преобразуем camelCase в snake_case для Supabase
    const updateData: Record<string, any> = {};
    if (data.fullName !== undefined) updateData.full_name = data.fullName;
    if (data.username !== undefined) updateData.username = data.username;
    if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.profession !== undefined) updateData.profession = data.profession;
    if (data.company !== undefined) updateData.company = data.company;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.grade !== undefined) updateData.grade = data.grade;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.portfolioUrl !== undefined) updateData.portfolio_url = data.portfolioUrl;
    if (data.telegramUsername !== undefined) updateData.telegram_username = data.telegramUsername;
    if (data.behanceUrl !== undefined) updateData.behance_url = data.behanceUrl;
    if (data.dribbbleUrl !== undefined) updateData.dribbble_url = data.dribbbleUrl;
    if ((data as any).isPro !== undefined) updateData.is_pro = (data as any).isPro;

    const { data: updated, error } = await supabaseServer
      .from("profiles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }

    // Преобразуем snake_case в camelCase
    if (updated) {
      return {
        ...updated,
        fullName: updated.full_name,
        avatarUrl: updated.avatar_url,
        telegramUsername: updated.telegram_username,
        behanceUrl: updated.behance_url,
        dribbbleUrl: updated.dribbble_url,
        portfolioUrl: updated.portfolio_url,
        createdAt: updated.created_at,
        isPro: updated.is_pro || false, // Добавляем isPro из is_pro
      } as Profile;
    }

    throw new Error("Failed to update profile");
  }

  // ============================================
  // TASKS (временно - возвращаем пустой массив)
  // ============================================

  async getTasks(_filters?: { category?: string; level?: string; status?: string }): Promise<any[]> {
    // Временно возвращаем пустой массив, чтобы сервер не падал
    // Позже можно реализовать через Supabase API
    return [];
  }

  async getTaskBySlug(_slug: string): Promise<any | undefined> {
    // Временно возвращаем undefined
    return undefined;
  }

  async getTasksByAuthor(_authorId: number): Promise<any[]> {
    return [];
  }

  // ============================================
  // Остальные методы - заглушки
  // ============================================

  async createTask(_task: any): Promise<any> {
    throw new Error("Not implemented - use Supabase API directly");
  }

  async updateTask(_id: number, _data: any): Promise<any> {
    throw new Error("Not implemented - use Supabase API directly");
  }

  async deleteTask(_id: number): Promise<void> {
    throw new Error("Not implemented - use Supabase API directly");
  }

  // ============================================
  // NOTIFICATIONS (заглушки - возвращаем пустые данные)
  // ============================================

  async getUserNotifications(_userId: number): Promise<any[]> {
    // Временно возвращаем пустой массив
    return [];
  }

  async createNotification(_notification: any): Promise<any> {
    throw new Error("Not implemented - use Supabase API directly");
  }

  async markNotificationRead(_id: number): Promise<void> {
    // Заглушка
  }

  async markAllNotificationsRead(_userId: number): Promise<void> {
    // Заглушка
  }

  async getUnreadNotificationsCount(_userId: number): Promise<number> {
    // Временно возвращаем 0
    return 0;
  }

  // ============================================
  // TASK SOLUTIONS (решения задач)
  // ============================================

  async createTaskSolution(solution: any): Promise<any> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }

    const { data, error } = await supabaseServer
      .from("task_solutions")
      .insert({
        task_id: solution.taskId,
        user_id: solution.userId,
        description: solution.description,
        status: solution.status || "pending",
        feedback: solution.feedback || null,
        rating: solution.rating || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating task solution:", error);
      throw error;
    }

    return {
      ...data,
      taskId: data.task_id,
      userId: data.user_id,
      createdAt: data.created_at,
    };
  }

  async getTaskSolution(taskId: number, userId: number): Promise<any | undefined> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }

    const { data, error } = await supabaseServer
      .from("task_solutions")
      .select("*")
      .eq("task_id", taskId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116" || error.message?.includes("No rows")) {
        return undefined;
      }
      console.error("Error getting task solution:", error);
      throw error;
    }

    if (data) {
      return {
        ...data,
        taskId: data.task_id,
        userId: data.user_id,
        createdAt: data.created_at,
      };
    }

    return undefined;
  }

  async updateTaskSolution(id: number, data: any): Promise<any> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }

    const updateData: Record<string, any> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.feedback !== undefined) updateData.feedback = data.feedback;
    if (data.rating !== undefined) updateData.rating = data.rating;

    const { data: updated, error } = await supabaseServer
      .from("task_solutions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating task solution:", error);
      throw error;
    }

    if (updated) {
      return {
        ...updated,
        taskId: updated.task_id,
        userId: updated.user_id,
        createdAt: updated.created_at,
      };
    }

    throw new Error("Failed to update task solution");
  }

  // ============================================
  // BATTLES (заглушки)
  // ============================================

  async getBattles(_filters?: { status?: string; category?: string }): Promise<any[]> {
    // Временно возвращаем пустой массив
    return [];
  }

  async getBattlesByProfile(_profileId: number): Promise<any[]> {
    return [];
  }

  async getBattleBySlug(_slug: string): Promise<any | undefined> {
    return undefined;
  }

  async createBattle(_battle: any): Promise<any> {
    throw new Error("Not implemented - use Supabase API directly");
  }

  async updateBattle(_id: number, _data: any): Promise<any> {
    throw new Error("Not implemented - use Supabase API directly");
  }

  async deleteBattle(_id: number): Promise<void> {
    throw new Error("Not implemented - use Supabase API directly");
  }

  // ============================================
  // ASSESSMENT QUESTIONS (заглушки)
  // ============================================

  async getAssessmentQuestions(_specialization: string): Promise<any[]> {
    // Временно возвращаем пустой массив
    return [];
  }

  // Добавьте другие методы как заглушки по необходимости
}
