import { supabase } from "@/lib/supabase";

export function mapProfileRow(data: any) {
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
  };
}

export function mapTaskRow(data: any) {
  return {
    ...data,
    authorId: data.author_id ?? null,
    createdAt: data.created_at,
    solutionsCount: data.solutions_count ?? 0,
  };
}

export function mapTaskDraftRow(data: any) {
  return {
    ...data,
    profileId: data.profile_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export function mapBattleRow(data: any) {
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

export async function getUserIdByAuthUid(authUid: string, email?: string | null): Promise<number | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("auth_uid", authUid)
    .maybeSingle();

  if (error) {
    console.error("Failed to get users.id:", error);
    return null;
  }

  if (data?.id) {
    return data.id;
  }

  const fallbackEmail = email || (await supabase.auth.getUser()).data.user?.email || "";
  const { data: created, error: createError } = await supabase
    .from("users")
    .insert({ auth_uid: authUid, email: fallbackEmail })
    .select("id")
    .single();

  if (createError) {
    console.error("Failed to create users row:", createError);
    return null;
  }

  return created?.id ?? null;
}

export async function getProfileIdByAuthUid(authUid: string, email?: string | null): Promise<number | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_uid", authUid)
    .maybeSingle();

  if (error) {
    console.error("Failed to get profiles.id:", error);
    return null;
  }

  if (data?.id) {
    return data.id;
  }

  const fallbackEmail = email || (await supabase.auth.getUser()).data.user?.email || "";
  const { data: created, error: createError } = await supabase
    .from("profiles")
    .insert({ auth_uid: authUid, email: fallbackEmail })
    .select("id")
    .single();

  if (createError) {
    console.error("Failed to create profiles row:", createError);
    return null;
  }

  return created?.id ?? null;
}
