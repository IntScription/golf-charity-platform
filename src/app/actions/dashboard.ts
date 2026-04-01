"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function parseContributionPercent(value: FormDataEntryValue | null): number {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return 10;
  return parsed;
}

async function requireActiveSubscription(userId: string) {
  const supabase = await createClient();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub || (sub.status !== "active" && sub.status !== "past_due")) {
    redirect("/dashboard?error=An active subscription is required");
  }
}

export async function saveCharityPreference(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await requireActiveSubscription(user.id);

  const charityId = String(formData.get("charity_id") ?? "");
  const contributionPercent = parseContributionPercent(
    formData.get("contribution_percent"),
  );

  if (!charityId) {
    redirect("/dashboard?error=Please select a charity");
  }

  if (contributionPercent < 10 || contributionPercent > 100) {
    redirect("/dashboard?error=Contribution must be between 10 and 100");
  }

  const { error } = await supabase.from("user_charity_preferences").upsert(
    {
      user_id: user.id,
      charity_id: charityId,
      contribution_percent: contributionPercent,
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard?success=charity-saved");
}

export async function addGolfScoreAction(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await requireActiveSubscription(user.id);

  const score = Number(formData.get("score"));
  const playedAt = String(formData.get("played_at") ?? "");

  if (Number.isNaN(score) || score < 1 || score > 45) {
    redirect("/dashboard?error=Score must be between 1 and 45");
  }

  if (!playedAt) {
    redirect("/dashboard?error=Please select a date");
  }

  const { error } = await supabase.rpc("add_golf_score", {
    p_user_id: user.id,
    p_score: score,
    p_played_at: playedAt,
  });

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard?success=score-added");
}
