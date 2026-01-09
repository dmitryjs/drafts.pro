import { db } from "./db";
import {
  users, profiles, tasks, taskSolutions, taskDrafts, battles, battleEntries, battleVotes,
  skillAssessments, assessmentQuestions, mentors, mentorSlots, mentorBookings, mentorReviews,
  type User, type InsertUser,
  type Profile, type InsertProfile,
  type Task, type InsertTask,
  type TaskSolution, type InsertTaskSolution,
  type TaskDraft, type InsertTaskDraft,
  type Battle, type InsertBattle,
  type BattleEntry, type InsertBattleEntry,
  type BattleVote, type InsertBattleVote,
  type SkillAssessment, type InsertSkillAssessment,
  type Mentor, type InsertMentor,
  type MentorSlot, type InsertMentorSlot,
  type MentorBooking, type InsertMentorBooking,
  type MentorReview, type InsertMentorReview,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

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
  getBattleBySlug(slug: string): Promise<Battle | undefined>;
  createBattle(battle: InsertBattle): Promise<Battle>;

  // Battle Entries
  getBattleEntries(battleId: number): Promise<BattleEntry[]>;
  createBattleEntry(entry: InsertBattleEntry): Promise<BattleEntry>;
  createBattleVote(vote: InsertBattleVote): Promise<BattleVote>;

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
      return existing;
    }
    const [newProfile] = await db.insert(profiles).values({
      authUid,
      email,
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

  async createBattleEntry(entry: InsertBattleEntry): Promise<BattleEntry> {
    const [newEntry] = await db.insert(battleEntries).values(entry).returning();
    return newEntry;
  }

  async createBattleVote(vote: InsertBattleVote): Promise<BattleVote> {
    const [newVote] = await db.insert(battleVotes).values(vote).returning();
    return newVote;
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
}

export const storage = new DatabaseStorage();
