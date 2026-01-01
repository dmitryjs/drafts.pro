import { authUsers, type AuthUser, type UpsertAuthUser } from "@shared/models/auth";
import { profiles } from "@shared/schema";
import { db } from "../../db";
import { eq, and, isNull } from "drizzle-orm";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<AuthUser | undefined>;
  upsertUser(user: UpsertAuthUser): Promise<AuthUser>;
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
}

export const authStorage = new AuthStorage();
