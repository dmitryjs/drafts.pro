// Минимальная реализация storage через Supabase API
// Только критичные операции для запуска MVP
import { supabaseServer } from "./supabase-server";
import type { Profile, InsertProfile, TaskSolution } from "@shared/schema";

export class SupabaseStorage {
  private mapProfile(data: any): Profile {
    return {
      ...data,
      userId: data.user_id ?? null,
      authUid: data.auth_uid ?? null,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      telegramUsername: data.telegram_username,
      behanceUrl: data.behance_url,
      dribbbleUrl: data.dribbble_url,
      portfolioUrl: data.portfolio_url,
      createdAt: data.created_at,
      isPro: data.is_pro || false,
    } as Profile;
  }

  private mapTask(data: any): any {
    // Извлекаем данные автора из JOIN или из отдельных полей
    const author = data.author || null;
    // authorId должен быть из tasks.author_id (это profile.id)
    const authorId = data.author_id ?? null;
    // Имя автора из профиля или "Аноним"
    const authorName = author?.full_name || author?.username || (authorId ? "Пользователь" : "Аноним");
    
    return {
      ...data,
      authorId, // Это profile.id, используется для ссылки /users/:id
      author: authorName,
      authorName,
      createdAt: data.created_at,
      solutionsCount: data.solutions_count ?? 0,
    };
  }

  private mapBattle(data: any): any {
    return {
      ...data,
      createdBy: data.created_by ?? null,
      coverImage: data.cover_image ?? null,
      startDate: data.start_date ?? null,
      endDate: data.end_date ?? null,
      votingEndDate: data.voting_end_date ?? null,
      prizeDescription: data.prize_description ?? null,
      createdAt: data.created_at,
    };
  }

  private mapComment(data: any): any {
    return {
      ...data,
      battleId: data.battle_id,
      profileId: data.profile_id,
      createdAt: data.created_at,
    };
  }

  private mapSolution(data: any): any {
    return {
      ...data,
      taskId: data.task_id,
      userId: data.user_id,
      createdAt: data.created_at,
    };
  }

  private mapMentor(data: any): any {
    return {
      ...data,
      userId: data.user_id,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      hourlyRate: data.hourly_rate,
      reviewsCount: data.reviews_count,
      sessionsCount: data.sessions_count,
      isVerified: data.is_verified,
      isAvailable: data.is_available,
      socialLinks: data.social_links,
      createdAt: data.created_at,
    };
  }

  private mapMentorSlot(data: any): any {
    return {
      ...data,
      mentorId: data.mentor_id,
      durationMinutes: data.duration_minutes,
      isBooked: data.is_booked,
    };
  }

  private mapMentorBooking(data: any): any {
    return {
      ...data,
      slotId: data.slot_id,
      mentorId: data.mentor_id,
      userId: data.user_id,
      meetingUrl: data.meeting_url,
      createdAt: data.created_at,
    };
  }

  private mapMentorReview(data: any): any {
    return {
      ...data,
      mentorId: data.mentor_id,
      userId: data.user_id,
      bookingId: data.booking_id,
      createdAt: data.created_at,
    };
  }

  private async getOrCreateUserId(authUid: string, email?: string | null): Promise<number> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }

    const { data: existingUser, error: existingError } = await supabaseServer
      .from("users")
      .select("id,email")
      .eq("auth_uid", authUid)
      .maybeSingle();

    if (existingError && existingError.code !== "PGRST116") {
      throw existingError;
    }

    if (existingUser?.id) {
      if (email && existingUser.email !== email) {
        await supabaseServer.from("users").update({ email }).eq("id", existingUser.id);
      }
      return existingUser.id;
    }

    const { data: created, error: createError } = await supabaseServer
      .from("users")
      .insert({ auth_uid: authUid, email: email || "" })
      .select("id")
      .single();

    if (createError || !created) {
      throw createError || new Error("Failed to create user");
    }

    return created.id;
  }
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

    if (data) {
      return this.mapProfile(data);
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

    if (data) {
      return this.mapProfile(data);
    }

    return undefined;
  }

  async upsertProfile(authUid: string, email: string): Promise<Profile> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }

    // Проверяем, существует ли профиль
    const existing = await this.getProfileByAuthUid(authUid);
    
    const userId = await this.getOrCreateUserId(authUid, email);

    if (existing) {
      if (!existing.userId || existing.userId !== userId) {
        await supabaseServer
          .from("profiles")
          .update({ user_id: userId, email })
          .eq("auth_uid", authUid);
        const refreshed = await this.getProfileByAuthUid(authUid);
        if (refreshed) {
          return refreshed;
        }
      }
      return existing;
    }

    // Создаем новый профиль
    const { data, error } = await supabaseServer
      .from("profiles")
      .insert({
        auth_uid: authUid,
        email,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating profile:", error);
      throw error;
    }

          if (data) {
            return this.mapProfile(data);
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

    if (updated) {
      return this.mapProfile(updated);
    }

    throw new Error("Failed to update profile");
  }

  // ============================================
  // TASKS
  // ============================================

  async getTasks(filters?: { category?: string; level?: string; status?: string }): Promise<any[]> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }

    let query = supabaseServer.from("tasks").select("*").order("created_at", { ascending: false });
    if (filters?.category) query = query.eq("category", filters.category);
    if (filters?.level) query = query.eq("level", filters.level);
    if (filters?.status) query = query.eq("status", filters.status);

    const { data, error } = await query;
    if (error) {
      console.error("Error getting tasks:", error);
      throw error;
    }
    
    // Получаем профили авторов для всех задач
    const tasks = data || [];
    const authorIds = [...new Set(tasks.map((t: any) => t.author_id).filter((id: any) => id))];
    const profilesMap = new Map<number, any>();
    
    if (authorIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabaseServer
        .from("profiles")
        .select("id, full_name, username, avatar_url, auth_uid")
        .in("id", authorIds);
      
      if (!profilesError && profiles) {
        profiles.forEach((p: any) => profilesMap.set(p.id, p));
      }
    }
    
    return tasks.map((row: any) => {
      const author = row.author_id ? profilesMap.get(row.author_id) : null;
      return this.mapTask({ ...row, author });
    });
  }

  async getTaskBySlug(slug: string): Promise<any | undefined> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer.from("tasks").select("*").eq("slug", slug).single();
    if (error) {
      if (error.code === "PGRST116" || error.message?.includes("No rows")) {
        return undefined;
      }
      console.error("Error getting task by slug:", error);
      throw error;
    }
    
    // Получаем профиль автора, если есть author_id
    let author = null;
    if (data?.author_id) {
      const { data: profile, error: profileError } = await supabaseServer
        .from("profiles")
        .select("id, full_name, username, avatar_url, auth_uid")
        .eq("id", data.author_id)
        .single();
      
      if (!profileError && profile) {
        author = profile;
      }
    }
    
    return data ? this.mapTask({ ...data, author }) : undefined;
  }

  async getTasksByAuthor(authorId: number): Promise<any[]> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer
      .from("tasks")
      .select("*")
      .eq("author_id", authorId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error getting tasks by author:", error);
      throw error;
    }
    return (data || []).map((row) => this.mapTask(row));
  }

  // ============================================
  // TASK MUTATIONS
  // ============================================

  async createTask(task: any): Promise<any> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const payload = {
      slug: task.slug,
      title: task.title,
      description: task.description,
      category: task.category,
      level: task.level,
      tags: task.tags || null,
      sphere: task.sphere || null,
      status: task.status || "published",
      attachments: task.attachments || null,
      author_id: task.authorId ?? null,
    };
    const { data, error } = await supabaseServer.from("tasks").insert(payload).select("*").single();
    if (error) {
      console.error("Error creating task:", error);
      throw error;
    }
    return this.mapTask(data);
  }

  async updateTask(id: number, data: any): Promise<any> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const payload: Record<string, any> = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.description !== undefined) payload.description = data.description;
    if (data.category !== undefined) payload.category = data.category;
    if (data.level !== undefined) payload.level = data.level;
    if (data.tags !== undefined) payload.tags = data.tags;
    if (data.sphere !== undefined) payload.sphere = data.sphere;
    if (data.status !== undefined) payload.status = data.status;
    if (data.attachments !== undefined) payload.attachments = data.attachments;
    if (data.authorId !== undefined) payload.author_id = data.authorId;

    const { data: updated, error } = await supabaseServer
      .from("tasks")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      console.error("Error updating task:", error);
      throw error;
    }
    return this.mapTask(updated);
  }

  async deleteTask(id: number): Promise<void> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { error } = await supabaseServer.from("tasks").delete().eq("id", id);
    if (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }

  // ============================================
  // NOTIFICATIONS (заглушки - возвращаем пустые данные)
  // ============================================

  async getUserNotifications(_userId: number): Promise<any[]> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer
      .from("notifications")
      .select("*")
      .eq("user_id", _userId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error getting user notifications:", error);
      throw error;
    }
    return (data || []).map((row) => ({
      ...row,
      userId: row.user_id,
      isRead: row.is_read,
      createdAt: row.created_at,
    }));
  }

  async createNotification(_notification: any): Promise<any> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const payload = {
      user_id: _notification.userId ?? _notification.user_id,
      type: _notification.type,
      title: _notification.title,
      message: _notification.message,
      metadata: _notification.metadata ?? null,
    };
    const { data, error } = await supabaseServer
      .from("notifications")
      .insert(payload)
      .select("*")
      .single();
    if (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
    return data;
  }

  async markNotificationRead(_id: number): Promise<void> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { error } = await supabaseServer
      .from("notifications")
      .update({ is_read: true })
      .eq("id", _id);
    if (error) {
      console.error("Error marking notification read:", error);
      throw error;
    }
  }

  async markAllNotificationsRead(_userId: number): Promise<void> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { error } = await supabaseServer
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", _userId);
    if (error) {
      console.error("Error marking all notifications read:", error);
      throw error;
    }
  }

  async getUnreadNotificationsCount(_userId: number): Promise<number> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", _userId)
      .eq("is_read", false);
    if (error) {
      console.error("Error getting unread notifications count:", error);
      throw error;
    }
    return data?.length ? data.length : 0;
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

    return this.mapSolution(data);
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
      return this.mapSolution(data);
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
      return this.mapSolution(updated);
    }

    throw new Error("Failed to update task solution");
  }

  async getTaskSolutions(taskId: number): Promise<any[]> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer
      .from("task_solutions")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error getting task solutions:", error);
      throw error;
    }
    return (data || []).map((row) => this.mapSolution(row));
  }

  async getUserSolutions(userId: number): Promise<any[]> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer
      .from("task_solutions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error getting user solutions:", error);
      throw error;
    }
    return (data || []).map((row) => this.mapSolution(row));
  }

  // ============================================
  // TASK VOTES
  // ============================================

  async getTaskVote(taskId: number, userId: number): Promise<any | undefined> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer
      .from("task_votes")
      .select("*")
      .eq("task_id", taskId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error && error.code !== "PGRST116") {
      console.error("Error getting task vote:", error);
      throw error;
    }
    return data || undefined;
  }

  async getTaskVoteCounts(taskId: number): Promise<{ likes: number; dislikes: number }> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer
      .from("task_votes")
      .select("value")
      .eq("task_id", taskId);
    if (error) {
      console.error("Error getting task vote counts:", error);
      throw error;
    }
    const likes = (data || []).filter((v) => v.value === 1).length;
    const dislikes = (data || []).filter((v) => v.value === -1).length;
    return { likes, dislikes };
  }

  async upsertTaskVote(taskId: number, userId: number, value: number): Promise<any> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer
      .from("task_votes")
      .upsert({ task_id: taskId, user_id: userId, value }, { onConflict: "task_id,user_id" })
      .select("*")
      .single();
    if (error) {
      console.error("Error upserting task vote:", error);
      throw error;
    }
    return data;
  }

  async deleteTaskVote(taskId: number, userId: number): Promise<void> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { error } = await supabaseServer
      .from("task_votes")
      .delete()
      .eq("task_id", taskId)
      .eq("user_id", userId);
    if (error) {
      console.error("Error deleting task vote:", error);
      throw error;
    }
  }

  // ============================================
  // TASK FAVORITES
  // ============================================

  async getTaskFavorite(taskId: number, userId: number): Promise<any | undefined> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer
      .from("task_favorites")
      .select("*")
      .eq("task_id", taskId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error && error.code !== "PGRST116") {
      console.error("Error getting task favorite:", error);
      throw error;
    }
    return data || undefined;
  }

  async getUserFavorites(userId: number): Promise<any[]> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer
      .from("task_favorites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error getting user favorites:", error);
      throw error;
    }
    return data || [];
  }

  async addTaskFavorite(taskId: number, userId: number): Promise<any> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer
      .from("task_favorites")
      .insert({ task_id: taskId, user_id: userId })
      .select("*")
      .single();
    if (error) {
      console.error("Error adding task favorite:", error);
      throw error;
    }
    return data;
  }

  async removeTaskFavorite(taskId: number, userId: number): Promise<void> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { error } = await supabaseServer
      .from("task_favorites")
      .delete()
      .eq("task_id", taskId)
      .eq("user_id", userId);
    if (error) {
      console.error("Error removing task favorite:", error);
      throw error;
    }
  }

  // ============================================
  // TASK DRAFTS
  // ============================================

  async getTaskDrafts(profileId: number): Promise<any[]> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer
      .from("task_drafts")
      .select("*")
      .eq("profile_id", profileId)
      .order("updated_at", { ascending: false });
    if (error) {
      console.error("Error getting task drafts:", error);
      throw error;
    }
    return data || [];
  }

  async getTaskDraft(id: number): Promise<any | undefined> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer
      .from("task_drafts")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error && error.code !== "PGRST116") {
      console.error("Error getting task draft:", error);
      throw error;
    }
    return data || undefined;
  }

  async createTaskDraft(draft: any): Promise<any> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const payload = {
      profile_id: draft.profileId,
      title: draft.title ?? null,
      description: draft.description ?? null,
      category: draft.category ?? null,
      level: draft.level ?? null,
      tags: draft.tags ?? null,
      spheres: draft.spheres ?? null,
      attachments: draft.attachments ?? null,
    };
    const { data, error } = await supabaseServer
      .from("task_drafts")
      .insert(payload)
      .select("*")
      .single();
    if (error) {
      console.error("Error creating task draft:", error);
      throw error;
    }
    return data;
  }

  async updateTaskDraft(id: number, data: any): Promise<any> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const payload: Record<string, any> = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.description !== undefined) payload.description = data.description;
    if (data.category !== undefined) payload.category = data.category;
    if (data.level !== undefined) payload.level = data.level;
    if (data.tags !== undefined) payload.tags = data.tags;
    if (data.spheres !== undefined) payload.spheres = data.spheres;
    if (data.attachments !== undefined) payload.attachments = data.attachments;

    const { data: updated, error } = await supabaseServer
      .from("task_drafts")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      console.error("Error updating task draft:", error);
      throw error;
    }
    return updated;
  }

  async deleteTaskDraft(id: number): Promise<void> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { error } = await supabaseServer.from("task_drafts").delete().eq("id", id);
    if (error) {
      console.error("Error deleting task draft:", error);
      throw error;
    }
  }

  // ============================================
  // BATTLE ENTRIES & VOTES (минимум для стабильности)
  // ============================================

  async getBattleEntries(battleId: number): Promise<any[]> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer
      .from("battle_entries")
      .select("*")
      .eq("battle_id", battleId)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error getting battle entries:", error);
      throw error;
    }
    return data || [];
  }

  async getBattleEntriesByUser(userId: number): Promise<any[]> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer
      .from("battle_entries")
      .select("*")
      .eq("user_id", userId);
    if (error) {
      console.error("Error getting battle entries by user:", error);
      throw error;
    }
    return data || [];
  }

  async createBattleEntry(entry: any): Promise<any> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const payload = {
      battle_id: entry.battleId,
      user_id: entry.userId,
      title: entry.title ?? null,
      image_url: entry.imageUrl,
      figma_url: entry.figmaUrl ?? null,
      description: entry.description ?? null,
    };
    const { data, error } = await supabaseServer
      .from("battle_entries")
      .insert(payload)
      .select("*")
      .single();
    if (error) {
      console.error("Error creating battle entry:", error);
      throw error;
    }
    return data;
  }

  async getBattleVote(battleId: number, voterId: number): Promise<any | undefined> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer
      .from("battle_votes")
      .select("*")
      .eq("battle_id", battleId)
      .eq("voter_id", voterId)
      .maybeSingle();
    if (error && error.code !== "PGRST116") {
      console.error("Error getting battle vote:", error);
      throw error;
    }
    return data || undefined;
  }

  async createBattleVote(vote: any): Promise<any> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const payload = {
      battle_id: vote.battleId,
      entry_id: vote.entryId,
      voter_id: vote.voterId,
    };
    const { data, error } = await supabaseServer
      .from("battle_votes")
      .insert(payload)
      .select("*")
      .single();
    if (error) {
      console.error("Error creating battle vote:", error);
      throw error;
    }
    return data;
  }

  async markBattleVoteXpAwarded(_voteId: number): Promise<void> {
    // Заглушка для MVP
  }

  // ============================================
  // BATTLES
  // ============================================

  async getBattles(filters?: { status?: string; category?: string }): Promise<any[]> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    let query = supabaseServer.from("battles").select("*").order("created_at", { ascending: false });
    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.category) query = query.eq("category", filters.category);
    const { data, error } = await query;
    if (error) {
      console.error("Error getting battles:", error);
      throw error;
    }
    return (data || []).map((row) => this.mapBattle(row));
  }

  async getBattlesByProfile(profileId: number): Promise<any[]> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer
      .from("battles")
      .select("*")
      .eq("created_by", profileId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error getting battles by profile:", error);
      throw error;
    }
    return (data || []).map((row) => this.mapBattle(row));
  }

  async getBattleBySlug(slug: string): Promise<any | undefined> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer.from("battles").select("*").eq("slug", slug).single();
    if (error) {
      if (error.code === "PGRST116" || error.message?.includes("No rows")) {
        return undefined;
      }
      console.error("Error getting battle by slug:", error);
      throw error;
    }
    return data ? this.mapBattle(data) : undefined;
  }

  async createBattle(battle: any): Promise<any> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    
    // Генерируем уникальный slug, если его нет или он может быть не уникальным
    let slug = battle.slug;
    if (!slug || slug.trim() === "") {
      const slugBase = (battle.title || "battle")
        .toLowerCase()
        .replace(/[^a-zа-яё0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      slug = `${slugBase}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;
    }
    
    const payload = {
      slug,
      title: battle.title,
      description: battle.description,
      theme: battle.theme || battle.category || battle.title,
      category: battle.category,
      cover_image: battle.coverImage ?? battle.cover_image ?? null,
      status: battle.status ?? "moderation",
      start_date: battle.startDate ?? battle.start_date ?? null,
      end_date: battle.endDate ?? battle.end_date ?? null,
      voting_end_date: battle.votingEndDate ?? battle.voting_end_date ?? null,
      prize_description: battle.prizeDescription ?? battle.prize_description ?? null,
      created_by: battle.createdBy ?? battle.created_by ?? null,
      rejection_reason: battle.rejectionReason ?? battle.rejection_reason ?? null,
    };
    
    console.log("Creating battle with payload:", { ...payload, description: payload.description?.substring(0, 50) + "..." });
    
    const { data, error } = await supabaseServer.from("battles").insert(payload).select("*").single();
    if (error) {
      console.error("Error creating battle:", error);
      console.error("Payload was:", payload);
      throw new Error(`Failed to create battle: ${error.message || JSON.stringify(error)}`);
    }
    return this.mapBattle(data);
  }

  async updateBattle(id: number, data: any): Promise<any> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const payload: Record<string, any> = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.description !== undefined) payload.description = data.description;
    if (data.theme !== undefined) payload.theme = data.theme;
    if (data.category !== undefined) payload.category = data.category;
    if (data.status !== undefined) payload.status = data.status;
    if (data.coverImage !== undefined) payload.cover_image = data.coverImage;
    if (data.startDate !== undefined) payload.start_date = data.startDate;
    if (data.endDate !== undefined) payload.end_date = data.endDate;
    if (data.votingEndDate !== undefined) payload.voting_end_date = data.votingEndDate;
    if (data.prizeDescription !== undefined) payload.prize_description = data.prizeDescription;
    if (data.rejectionReason !== undefined) payload.rejection_reason = data.rejectionReason;
    if (data.createdBy !== undefined) payload.created_by = data.createdBy;

    const { data: updated, error } = await supabaseServer
      .from("battles")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      console.error("Error updating battle:", error);
      throw error;
    }
    return this.mapBattle(updated);
  }

  async deleteBattle(id: number): Promise<void> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { error } = await supabaseServer.from("battles").delete().eq("id", id);
    if (error) {
      console.error("Error deleting battle:", error);
      throw error;
    }
  }

  // ============================================
  // BATTLE COMMENTS
  // ============================================

  async getBattleComments(battleId: number): Promise<any[]> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer
      .from("battle_comments")
      .select("*")
      .eq("battle_id", battleId)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error getting battle comments:", error);
      throw error;
    }
    return (data || []).map((row) => this.mapComment(row));
  }

  async createBattleComment(comment: any): Promise<any> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const payload = {
      battle_id: comment.battleId ?? comment.battle_id,
      profile_id: comment.profileId ?? comment.profile_id,
      content: comment.content,
    };
    const { data, error } = await supabaseServer
      .from("battle_comments")
      .insert(payload)
      .select("*")
      .single();
    if (error) {
      console.error("Error creating battle comment:", error);
      throw error;
    }
    return this.mapComment(data);
  }

  async getBattleCommentVote(_commentId: number, _profileId: number): Promise<any | undefined> {
    return undefined;
  }

  async upsertBattleCommentVote(_commentId: number, _profileId: number, _value: number): Promise<any> {
    throw new Error("Not implemented - use Supabase API directly");
  }

  async updateBattleCommentCounts(_commentId: number): Promise<void> {
    // Заглушка
  }

  // ============================================
  // ASSESSMENTS
  // ============================================

  async getAssessment(userId: number): Promise<any | undefined> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer
      .from("skill_assessments")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error && error.code !== "PGRST116") {
      console.error("Error getting assessment:", error);
      throw error;
    }
    return data || undefined;
  }

  async createAssessment(assessment: any): Promise<any> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const payload = {
      user_id: assessment.userId,
      portfolio_url: assessment.portfolioUrl ?? null,
      resume_url: assessment.resumeUrl ?? null,
      specialization: assessment.specialization ?? null,
      experience_years: assessment.experienceYears ?? null,
      test_score: assessment.testScore ?? null,
      overall_level: assessment.overallLevel ?? null,
      recommended_salary_min: assessment.recommendedSalaryMin ?? null,
      recommended_salary_max: assessment.recommendedSalaryMax ?? null,
      skills: assessment.skills ?? null,
      strengths: assessment.strengths ?? null,
      areas_to_improve: assessment.areasToImprove ?? null,
      completed_at: assessment.completedAt ?? null,
    };
    const { data, error } = await supabaseServer
      .from("skill_assessments")
      .insert(payload)
      .select("*")
      .single();
    if (error) {
      console.error("Error creating assessment:", error);
      throw error;
    }
    return data;
  }

  async updateAssessment(id: number, data: any): Promise<any> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const payload: Record<string, any> = {};
    if (data.portfolioUrl !== undefined) payload.portfolio_url = data.portfolioUrl;
    if (data.resumeUrl !== undefined) payload.resume_url = data.resumeUrl;
    if (data.specialization !== undefined) payload.specialization = data.specialization;
    if (data.experienceYears !== undefined) payload.experience_years = data.experienceYears;
    if (data.testScore !== undefined) payload.test_score = data.testScore;
    if (data.overallLevel !== undefined) payload.overall_level = data.overallLevel;
    if (data.recommendedSalaryMin !== undefined) payload.recommended_salary_min = data.recommendedSalaryMin;
    if (data.recommendedSalaryMax !== undefined) payload.recommended_salary_max = data.recommendedSalaryMax;
    if (data.skills !== undefined) payload.skills = data.skills;
    if (data.strengths !== undefined) payload.strengths = data.strengths;
    if (data.areasToImprove !== undefined) payload.areas_to_improve = data.areasToImprove;
    if (data.completedAt !== undefined) payload.completed_at = data.completedAt;

    const { data: updated, error } = await supabaseServer
      .from("skill_assessments")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      console.error("Error updating assessment:", error);
      throw error;
    }
    return updated;
  }

  async getAssessmentQuestions(_specialization: string): Promise<any[]> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer
      .from("assessment_questions")
      .select("*")
      .eq("specialization", _specialization);
    if (error) {
      console.error("Error getting assessment questions:", error);
      throw error;
    }
    return data || [];
  }

  // ============================================
  // COMPANIES
  // ============================================

  async getCompanies(): Promise<any[]> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error getting companies:", error);
      throw error;
    }
    return data || [];
  }

  async getCompanyById(id: number): Promise<any | undefined> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer
      .from("companies")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error && error.code !== "PGRST116") {
      console.error("Error getting company by id:", error);
      throw error;
    }
    return data || undefined;
  }

  async getCompanyBySlug(slug: string): Promise<any | undefined> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data, error } = await supabaseServer
      .from("companies")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error && error.code !== "PGRST116") {
      console.error("Error getting company by slug:", error);
      throw error;
    }
    return data || undefined;
  }

  async createCompany(company: any): Promise<any> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const payload = {
      name: company.name,
      slug: company.slug,
      email: company.email,
      password: company.password ?? null,
      website: company.website ?? null,
      description: company.description ?? null,
      industry: company.industry ?? null,
      size: company.size ?? null,
      logo_url: company.logoUrl ?? null,
    };
    const { data, error } = await supabaseServer
      .from("companies")
      .insert(payload)
      .select("*")
      .single();
    if (error) {
      console.error("Error creating company:", error);
      throw error;
    }
    return data;
  }

  async updateCompany(id: number, data: any): Promise<any> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const payload: Record<string, any> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.slug !== undefined) payload.slug = data.slug;
    if (data.email !== undefined) payload.email = data.email;
    if (data.password !== undefined) payload.password = data.password;
    if (data.website !== undefined) payload.website = data.website;
    if (data.description !== undefined) payload.description = data.description;
    if (data.industry !== undefined) payload.industry = data.industry;
    if (data.size !== undefined) payload.size = data.size;
    if (data.logoUrl !== undefined) payload.logo_url = data.logoUrl;

    const { data: updated, error } = await supabaseServer
      .from("companies")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      console.error("Error updating company:", error);
      throw error;
    }
    return updated;
  }

  async deleteCompany(id: number): Promise<void> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { error } = await supabaseServer.from("companies").delete().eq("id", id);
    if (error) {
      console.error("Error deleting company:", error);
      throw error;
    }
  }

  // ============================================
  // ADMIN: ASSESSMENT QUESTIONS
  // ============================================

  async createAssessmentQuestion(data: any): Promise<any> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data: created, error } = await supabaseServer
      .from("assessment_questions")
      .insert(data)
      .select("*")
      .single();
    if (error) {
      console.error("Error creating assessment question:", error);
      throw error;
    }
    return created;
  }

  async updateAssessmentQuestion(id: number, data: any): Promise<any> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { data: updated, error } = await supabaseServer
      .from("assessment_questions")
      .update(data)
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      console.error("Error updating assessment question:", error);
      throw error;
    }
    return updated;
  }

  async deleteAssessmentQuestion(id: number): Promise<void> {
    if (!supabaseServer) {
      throw new Error("Supabase not configured");
    }
    const { error } = await supabaseServer.from("assessment_questions").delete().eq("id", id);
    if (error) {
      console.error("Error deleting assessment question:", error);
      throw error;
    }
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
