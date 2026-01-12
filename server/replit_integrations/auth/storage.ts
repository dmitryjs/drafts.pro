import { authUsers, type AuthUser, type UpsertAuthUser } from "@shared/models/auth";
import { profiles } from "@shared/schema";
// db больше не используется - используем Supabase API
// Для Replit Auth это не критично, так как он отключен в локальной разработке
import { db } from "../../db";
import { eq, and, isNull, sql, count } from "drizzle-orm";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<AuthUser | undefined>;
  upsertUser(user: UpsertAuthUser): Promise<AuthUser>;
  getAllUsers(): Promise<AuthUser[]>;
  setAdmin(userId: string, isAdmin: boolean): Promise<AuthUser | undefined>;
  isAdmin(userId: string): Promise<boolean>;
  getUsersCount(): Promise<number>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<AuthUser | undefined> {
    const [user] = await db.select().from(authUsers).where(eq(authUsers.id, id));
    return user;
  }

  async upsertUser(userData: UpsertAuthUser): Promise<AuthUser> {
    const [user] = await db
      .insert(authUsers)
      .values(userData)
      .onConflictDoUpdate({
        target: authUsers.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    // Sync with profiles table for app-level user data
    if (userData.id && userData.email) {
      // First check if profile exists by authUid
      const existingByAuthUid = await db.select().from(profiles).where(eq(profiles.authUid, userData.id));
      
      if (existingByAuthUid.length > 0) {
        // Update existing profile linked to this auth user
        await db.update(profiles).set({
          avatarUrl: userData.profileImageUrl || existingByAuthUid[0].avatarUrl,
          fullName: [userData.firstName, userData.lastName].filter(Boolean).join(' ') || existingByAuthUid[0].fullName,
        }).where(eq(profiles.authUid, userData.id));
      } else {
        // Check for legacy profile by email (migrating from Supabase)
        const legacyByEmail = await db.select().from(profiles).where(
          and(eq(profiles.email, userData.email), isNull(profiles.authUid))
        );
        
        if (legacyByEmail.length > 0) {
          // Link legacy profile to new auth user
          await db.update(profiles).set({
            authUid: userData.id,
            avatarUrl: userData.profileImageUrl || legacyByEmail[0].avatarUrl,
            fullName: [userData.firstName, userData.lastName].filter(Boolean).join(' ') || legacyByEmail[0].fullName,
          }).where(eq(profiles.id, legacyByEmail[0].id));
        } else {
          // Create new profile
          await db.insert(profiles).values({
            authUid: userData.id,
            email: userData.email,
            username: userData.firstName || userData.email?.split('@')[0],
            fullName: [userData.firstName, userData.lastName].filter(Boolean).join(' ') || null,
            avatarUrl: userData.profileImageUrl,
          });
        }
      }
    }
    
    return user;
  }

  async getAllUsers(): Promise<AuthUser[]> {
    return await db.select().from(authUsers).orderBy(authUsers.createdAt);
  }

  async setAdmin(userId: string, isAdmin: boolean): Promise<AuthUser | undefined> {
    const [user] = await db
      .update(authUsers)
      .set({ isAdmin, updatedAt: new Date() })
      .where(eq(authUsers.id, userId))
      .returning();
    return user;
  }

  async isAdmin(userId: string): Promise<boolean> {
    const [user] = await db.select({ isAdmin: authUsers.isAdmin }).from(authUsers).where(eq(authUsers.id, userId));
    return user?.isAdmin === true;
  }

  async getUsersCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(authUsers);
    return result?.count || 0;
  }
}

export const authStorage = new AuthStorage();
