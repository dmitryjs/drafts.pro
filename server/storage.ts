import { db } from "./db";
import {
  users, profiles, tasks, taskSolutions, taskDrafts, taskVotes, taskFavorites, battles, battleEntries, battleVotes,
  battleComments, battleCommentVotes,
  skillAssessments, assessmentQuestions, mentors, mentorSlots, mentorBookings, mentorReviews, notifications, companies,
  type User, type InsertUser,
  type Profile, type InsertProfile,
  type Task, type InsertTask,
  type TaskSolution, type InsertTaskSolution,
  type TaskDraft, type InsertTaskDraft,
  type TaskVote, type InsertTaskVote,
  type TaskFavorite, type InsertTaskFavorite,
  type Battle, type InsertBattle,
  type BattleEntry, type InsertBattleEntry,
  type BattleVote, type InsertBattleVote,
  type BattleComment, type InsertBattleComment,
  type BattleCommentVote, type InsertBattleCommentVote,
  type SkillAssessment, type InsertSkillAssessment,
  type Mentor, type InsertMentor,
  type MentorSlot, type InsertMentorSlot,
  type MentorBooking, type InsertMentorBooking,
  type MentorReview, type InsertMentorReview,
  type Notification, type InsertNotification,
  type Company, type InsertCompany,
} from "@shared/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Profiles
  getProfileByAuthUid(authUid: string): Promise<Profile | undefined>;
  getProfileById(id: number): Promise<Profile | undefined>;
  upsertProfile(authUid: string, email: string): Promise<Profile>;
  updateProfile(id: number, data: Partial<InsertProfile>): Promise<Profile>;

  // Tasks
  getTasks(filters?: { category?: string; level?: string; status?: string }): Promise<Task[]>;
  getTasksByAuthor(authorId: number): Promise<Task[]>;
  getTaskBySlug(slug: string): Promise<Task | undefined>;
  getTaskById(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, data: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;

  // Task Solutions
  getTaskSolutions(taskId: number): Promise<TaskSolution[]>;
  getUserSolutions(userId: number): Promise<TaskSolution[]>;
  createTaskSolution(solution: InsertTaskSolution): Promise<TaskSolution>;
  updateTaskSolution(id: number, data: Partial<InsertTaskSolution>): Promise<TaskSolution>;

  // Battles
  getBattles(filters?: { status?: string; category?: string }): Promise<Battle[]>;
  getBattlesByProfile(profileId: number): Promise<Battle[]>;
  getBattleBySlug(slug: string): Promise<Battle | undefined>;
  createBattle(battle: InsertBattle): Promise<Battle>;

  // Battle Entries
  getBattleEntries(battleId: number): Promise<BattleEntry[]>;
  getBattleEntriesByUser(userId: number): Promise<BattleEntry[]>;
  createBattleEntry(entry: InsertBattleEntry): Promise<BattleEntry>;
  createBattleVote(vote: InsertBattleVote): Promise<BattleVote>;
  getBattleVote(battleId: number, voterId: number): Promise<BattleVote | undefined>;
  markBattleVoteXpAwarded(voteId: number): Promise<void>;

  // Battle Comments
  getBattleComments(battleId: number): Promise<BattleComment[]>;
  createBattleComment(comment: InsertBattleComment): Promise<BattleComment>;
  getBattleCommentVote(commentId: number, profileId: number): Promise<BattleCommentVote | undefined>;
  upsertBattleCommentVote(commentId: number, profileId: number, value: number): Promise<BattleCommentVote>;
  updateBattleCommentCounts(commentId: number): Promise<void>;

  // Skill Assessments
  getAssessment(userId: number): Promise<SkillAssessment | undefined>;
  createAssessment(assessment: InsertSkillAssessment): Promise<SkillAssessment>;
  updateAssessment(id: number, data: Partial<InsertSkillAssessment>): Promise<SkillAssessment>;
  getAssessmentQuestions(specialization: string): Promise<any[]>;

  // Mentors
  getMentors(filters?: { specialization?: string; isAvailable?: boolean }): Promise<Mentor[]>;
  getMentorBySlug(slug: string): Promise<Mentor | undefined>;
  getMentorById(id: number): Promise<Mentor | undefined>;
  createMentor(mentor: InsertMentor): Promise<Mentor>;

  // Mentor Slots
  getMentorSlots(mentorId: number): Promise<MentorSlot[]>;
  createMentorSlot(slot: InsertMentorSlot): Promise<MentorSlot>;

  // Bookings
  getUserBookings(userId: number): Promise<MentorBooking[]>;
  createBooking(booking: InsertMentorBooking): Promise<MentorBooking>;
  updateBooking(id: number, data: Partial<InsertMentorBooking>): Promise<MentorBooking>;

  // Reviews
  getMentorReviews(mentorId: number): Promise<MentorReview[]>;
  createReview(review: InsertMentorReview): Promise<MentorReview>;

  // Task Drafts
  getTaskDrafts(profileId: number): Promise<TaskDraft[]>;
  getTaskDraft(id: number): Promise<TaskDraft | undefined>;
  createTaskDraft(draft: InsertTaskDraft): Promise<TaskDraft>;
  updateTaskDraft(id: number, data: Partial<InsertTaskDraft>): Promise<TaskDraft>;
  deleteTaskDraft(id: number): Promise<void>;

  // Task Votes
  getTaskVote(taskId: number, userId: number): Promise<TaskVote | undefined>;
  getTaskVoteCounts(taskId: number): Promise<{ likes: number; dislikes: number }>;
  upsertTaskVote(taskId: number, userId: number, value: number): Promise<TaskVote>;
  deleteTaskVote(taskId: number, userId: number): Promise<void>;

  // Task Favorites
  getTaskFavorite(taskId: number, userId: number): Promise<TaskFavorite | undefined>;
  getUserFavorites(userId: number): Promise<TaskFavorite[]>;
  addTaskFavorite(taskId: number, userId: number): Promise<TaskFavorite>;
  removeTaskFavorite(taskId: number, userId: number): Promise<void>;

  // Admin: Battles
  updateBattle(id: number, data: Partial<InsertBattle>): Promise<Battle>;
  deleteBattle(id: number): Promise<void>;

  // Admin: Assessment Questions
  createAssessmentQuestion(data: any): Promise<any>;
  updateAssessmentQuestion(id: number, data: any): Promise<any>;
  deleteAssessmentQuestion(id: number): Promise<void>;

  // Notifications
  getUserNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;
  markAllNotificationsRead(userId: number): Promise<void>;
  getUnreadNotificationsCount(userId: number): Promise<number>;

  // Companies
  getCompanies(): Promise<Company[]>;
  getCompanyById(id: number): Promise<Company | undefined>;
  getCompanyBySlug(slug: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, data: Partial<InsertCompany>): Promise<Company>;
  deleteCompany(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Profiles
  async getProfileByAuthUid(authUid: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.authUid, authUid));
    return profile;
  }

  async getProfileById(id: number): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }

  async upsertProfile(authUid: string, email: string): Promise<Profile> {
    const existing = await this.getProfileByAuthUid(authUid);
    if (existing) {
      // Ensure existing profile has a linked user
      if (!existing.userId) {
        // Create a backing user record
        const [user] = await db.insert(users).values({ email, authUid }).returning();
        const [updated] = await db.update(profiles)
          .set({ userId: user.id })
          .where(eq(profiles.id, existing.id))
          .returning();
        return updated;
      }
      return existing;
    }
    // Create user first, then profile with userId link
    const [user] = await db.insert(users).values({ email, authUid }).returning();
    const [newProfile] = await db.insert(profiles).values({
      authUid,
      email,
      userId: user.id,
    }).returning();
    return newProfile;
  }

  async updateProfile(id: number, data: Partial<InsertProfile>): Promise<Profile> {
    const [updated] = await db.update(profiles).set(data).where(eq(profiles.id, id)).returning();
    return updated;
  }

  // Tasks
  async getTasks(filters?: { category?: string; level?: string; status?: string }): Promise<Task[]> {
    let result = await db.select().from(tasks);
    
    if (filters?.category) {
      result = result.filter(t => t.category === filters.category);
    }
    if (filters?.level) {
      result = result.filter(t => t.level === filters.level);
    }
    if (filters?.status) {
      result = result.filter(t => t.status === filters.status);
    }
    
    return result;
  }

  async getTasksByAuthor(authorId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.authorId, authorId));
  }

  async getTaskBySlug(slug: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.slug, slug));
    return task;
  }

  async getTaskById(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, data: Partial<InsertTask>): Promise<Task> {
    const [updated] = await db.update(tasks).set(data).where(eq(tasks.id, id)).returning();
    return updated;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Task Solutions
  async getTaskSolutions(taskId: number): Promise<TaskSolution[]> {
    return await db.select().from(taskSolutions).where(eq(taskSolutions.taskId, taskId));
  }

  async getUserSolutions(userId: number): Promise<TaskSolution[]> {
    return await db.select().from(taskSolutions).where(eq(taskSolutions.userId, userId));
  }

  async createTaskSolution(solution: InsertTaskSolution): Promise<TaskSolution> {
    const [newSolution] = await db.insert(taskSolutions).values(solution).returning();
    return newSolution;
  }

  async updateTaskSolution(id: number, data: Partial<InsertTaskSolution>): Promise<TaskSolution> {
    const [updated] = await db.update(taskSolutions).set(data).where(eq(taskSolutions.id, id)).returning();
    return updated;
  }

  // Battles
  async getBattles(filters?: { status?: string; category?: string }): Promise<Battle[]> {
    let result = await db.select().from(battles);
    
    if (filters?.status) {
      result = result.filter(b => b.status === filters.status);
    }
    if (filters?.category) {
      result = result.filter(b => b.category === filters.category);
    }
    
    return result;
  }

  async getBattlesByProfile(profileId: number): Promise<Battle[]> {
    return await db.select().from(battles).where(eq(battles.createdBy, profileId));
  }

  async getBattleBySlug(slug: string): Promise<Battle | undefined> {
    const [battle] = await db.select().from(battles).where(eq(battles.slug, slug));
    return battle;
  }

  async createBattle(battle: InsertBattle): Promise<Battle> {
    const [newBattle] = await db.insert(battles).values(battle).returning();
    return newBattle;
  }

  // Battle Entries
  async getBattleEntries(battleId: number): Promise<BattleEntry[]> {
    return await db.select().from(battleEntries).where(eq(battleEntries.battleId, battleId));
  }

  async getBattleEntriesByUser(userId: number): Promise<BattleEntry[]> {
    return await db.select().from(battleEntries).where(eq(battleEntries.userId, userId));
  }

  async createBattleEntry(entry: InsertBattleEntry): Promise<BattleEntry> {
    const [newEntry] = await db.insert(battleEntries).values(entry).returning();
    return newEntry;
  }

  async createBattleVote(vote: InsertBattleVote): Promise<BattleVote> {
    const [newVote] = await db.insert(battleVotes).values(vote).returning();
    return newVote;
  }

  async getBattleVote(battleId: number, voterId: number): Promise<BattleVote | undefined> {
    const [vote] = await db.select().from(battleVotes)
      .where(and(eq(battleVotes.battleId, battleId), eq(battleVotes.voterId, voterId)));
    return vote;
  }

  async markBattleVoteXpAwarded(voteId: number): Promise<void> {
    await db.update(battleVotes).set({ xpAwarded: true }).where(eq(battleVotes.id, voteId));
  }

  // Battle Comments
  async getBattleComments(battleId: number): Promise<BattleComment[]> {
    return await db.select().from(battleComments)
      .where(eq(battleComments.battleId, battleId))
      .orderBy(desc(battleComments.createdAt));
  }

  async createBattleComment(comment: InsertBattleComment): Promise<BattleComment> {
    const [newComment] = await db.insert(battleComments).values(comment).returning();
    return newComment;
  }

  async getBattleCommentVote(commentId: number, profileId: number): Promise<BattleCommentVote | undefined> {
    const [vote] = await db.select().from(battleCommentVotes)
      .where(and(eq(battleCommentVotes.commentId, commentId), eq(battleCommentVotes.profileId, profileId)));
    return vote;
  }

  async upsertBattleCommentVote(commentId: number, profileId: number, value: number): Promise<BattleCommentVote> {
    const existing = await this.getBattleCommentVote(commentId, profileId);
    if (existing) {
      const [updated] = await db.update(battleCommentVotes)
        .set({ value })
        .where(eq(battleCommentVotes.id, existing.id))
        .returning();
      return updated;
    }
    const [vote] = await db.insert(battleCommentVotes).values({ commentId, profileId, value }).returning();
    return vote;
  }

  async updateBattleCommentCounts(commentId: number): Promise<void> {
    const votes = await db.select().from(battleCommentVotes).where(eq(battleCommentVotes.commentId, commentId));
    const likes = votes.filter(v => v.value === 1).length;
    const dislikes = votes.filter(v => v.value === -1).length;
    await db.update(battleComments).set({ likes, dislikes }).where(eq(battleComments.id, commentId));
  }

  // Skill Assessments
  async getAssessment(userId: number): Promise<SkillAssessment | undefined> {
    const [assessment] = await db.select().from(skillAssessments).where(eq(skillAssessments.userId, userId));
    return assessment;
  }

  async createAssessment(assessment: InsertSkillAssessment): Promise<SkillAssessment> {
    const [newAssessment] = await db.insert(skillAssessments).values(assessment).returning();
    return newAssessment;
  }

  async updateAssessment(id: number, data: Partial<InsertSkillAssessment>): Promise<SkillAssessment> {
    const [updated] = await db.update(skillAssessments).set(data).where(eq(skillAssessments.id, id)).returning();
    return updated;
  }

  async getAssessmentQuestions(specialization: string): Promise<any[]> {
    return await db.select().from(assessmentQuestions).where(eq(assessmentQuestions.specialization, specialization));
  }

  // Mentors
  async getMentors(filters?: { specialization?: string; isAvailable?: boolean }): Promise<Mentor[]> {
    let result = await db.select().from(mentors);
    
    if (filters?.isAvailable !== undefined) {
      result = result.filter(m => m.isAvailable === filters.isAvailable);
    }
    // For specialization, would need to check array contains
    
    return result;
  }

  async getMentorBySlug(slug: string): Promise<Mentor | undefined> {
    const [mentor] = await db.select().from(mentors).where(eq(mentors.slug, slug));
    return mentor;
  }

  async getMentorById(id: number): Promise<Mentor | undefined> {
    const [mentor] = await db.select().from(mentors).where(eq(mentors.id, id));
    return mentor;
  }

  async createMentor(mentor: InsertMentor): Promise<Mentor> {
    const [newMentor] = await db.insert(mentors).values(mentor).returning();
    return newMentor;
  }

  // Mentor Slots
  async getMentorSlots(mentorId: number): Promise<MentorSlot[]> {
    return await db.select().from(mentorSlots).where(eq(mentorSlots.mentorId, mentorId));
  }

  async createMentorSlot(slot: InsertMentorSlot): Promise<MentorSlot> {
    const [newSlot] = await db.insert(mentorSlots).values(slot).returning();
    return newSlot;
  }

  // Bookings
  async getUserBookings(userId: number): Promise<MentorBooking[]> {
    return await db.select().from(mentorBookings).where(eq(mentorBookings.userId, userId));
  }

  async createBooking(booking: InsertMentorBooking): Promise<MentorBooking> {
    const [newBooking] = await db.insert(mentorBookings).values(booking).returning();
    return newBooking;
  }

  async updateBooking(id: number, data: Partial<InsertMentorBooking>): Promise<MentorBooking> {
    const [updated] = await db.update(mentorBookings).set(data).where(eq(mentorBookings.id, id)).returning();
    return updated;
  }

  // Reviews
  async getMentorReviews(mentorId: number): Promise<MentorReview[]> {
    return await db.select().from(mentorReviews).where(eq(mentorReviews.mentorId, mentorId));
  }

  async createReview(review: InsertMentorReview): Promise<MentorReview> {
    const [newReview] = await db.insert(mentorReviews).values(review).returning();
    return newReview;
  }

  // Task Drafts
  async getTaskDrafts(profileId: number): Promise<TaskDraft[]> {
    return await db.select().from(taskDrafts).where(eq(taskDrafts.profileId, profileId));
  }

  async getTaskDraft(id: number): Promise<TaskDraft | undefined> {
    const [draft] = await db.select().from(taskDrafts).where(eq(taskDrafts.id, id));
    return draft;
  }

  async createTaskDraft(draft: InsertTaskDraft): Promise<TaskDraft> {
    const [newDraft] = await db.insert(taskDrafts).values(draft).returning();
    return newDraft;
  }

  async updateTaskDraft(id: number, data: Partial<InsertTaskDraft>): Promise<TaskDraft> {
    const [updated] = await db.update(taskDrafts).set(data).where(eq(taskDrafts.id, id)).returning();
    return updated;
  }

  async deleteTaskDraft(id: number): Promise<void> {
    await db.delete(taskDrafts).where(eq(taskDrafts.id, id));
  }

  // Task Votes
  async getTaskVote(taskId: number, userId: number): Promise<TaskVote | undefined> {
    const [vote] = await db.select().from(taskVotes)
      .where(and(eq(taskVotes.taskId, taskId), eq(taskVotes.userId, userId)));
    return vote;
  }

  async getTaskVoteCounts(taskId: number): Promise<{ likes: number; dislikes: number }> {
    const votes = await db.select().from(taskVotes).where(eq(taskVotes.taskId, taskId));
    const likes = votes.filter(v => v.value === 1).length;
    const dislikes = votes.filter(v => v.value === -1).length;
    return { likes, dislikes };
  }

  async upsertTaskVote(taskId: number, userId: number, value: number): Promise<TaskVote> {
    const existing = await this.getTaskVote(taskId, userId);
    if (existing) {
      const [updated] = await db.update(taskVotes)
        .set({ value })
        .where(eq(taskVotes.id, existing.id))
        .returning();
      return updated;
    }
    const [vote] = await db.insert(taskVotes).values({ taskId, userId, value }).returning();
    return vote;
  }

  async deleteTaskVote(taskId: number, userId: number): Promise<void> {
    await db.delete(taskVotes)
      .where(and(eq(taskVotes.taskId, taskId), eq(taskVotes.userId, userId)));
  }

  // Task Favorites
  async getTaskFavorite(taskId: number, userId: number): Promise<TaskFavorite | undefined> {
    const [fav] = await db.select().from(taskFavorites)
      .where(and(eq(taskFavorites.taskId, taskId), eq(taskFavorites.userId, userId)));
    return fav;
  }

  async getUserFavorites(userId: number): Promise<TaskFavorite[]> {
    return await db.select().from(taskFavorites).where(eq(taskFavorites.userId, userId));
  }

  async addTaskFavorite(taskId: number, userId: number): Promise<TaskFavorite> {
    const existing = await this.getTaskFavorite(taskId, userId);
    if (existing) return existing;
    const [fav] = await db.insert(taskFavorites).values({ taskId, userId }).returning();
    return fav;
  }

  async removeTaskFavorite(taskId: number, userId: number): Promise<void> {
    await db.delete(taskFavorites)
      .where(and(eq(taskFavorites.taskId, taskId), eq(taskFavorites.userId, userId)));
  }

  // Admin: Battles
  async updateBattle(id: number, data: Partial<InsertBattle>): Promise<Battle> {
    const [updated] = await db.update(battles).set(data).where(eq(battles.id, id)).returning();
    return updated;
  }

  async deleteBattle(id: number): Promise<void> {
    await db.delete(battles).where(eq(battles.id, id));
  }

  // Admin: Assessment Questions
  async createAssessmentQuestion(data: any): Promise<any> {
    const [question] = await db.insert(assessmentQuestions).values(data).returning();
    return question;
  }

  async updateAssessmentQuestion(id: number, data: any): Promise<any> {
    const [updated] = await db.update(assessmentQuestions).set(data).where(eq(assessmentQuestions.id, id)).returning();
    return updated;
  }

  async deleteAssessmentQuestion(id: number): Promise<void> {
    await db.delete(assessmentQuestions).where(eq(assessmentQuestions.id, id));
  }

  // Notifications
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async markNotificationRead(id: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  async markAllNotificationsRead(userId: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
  }

  async getUnreadNotificationsCount(userId: number): Promise<number> {
    const result = await db.select().from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result.length;
  }

  // Companies
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies).orderBy(desc(companies.createdAt));
  }

  async getCompanyById(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async getCompanyBySlug(slug: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.slug, slug));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [created] = await db.insert(companies).values(company).returning();
    return created;
  }

  async updateCompany(id: number, data: Partial<InsertCompany>): Promise<Company> {
    const [updated] = await db.update(companies).set(data).where(eq(companies.id, id)).returning();
    return updated;
  }

  async deleteCompany(id: number): Promise<void> {
    await db.delete(companies).where(eq(companies.id, id));
  }
}

// Используем Supabase API вместо прямого подключения к Postgres
import { SupabaseStorage } from "./storage_supabase";

// Для MVP используем Supabase API
// Если нужны все функции - можно переключить обратно на DatabaseStorage
export const storage = new SupabaseStorage();
