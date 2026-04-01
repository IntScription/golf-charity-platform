"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function randomFiveScores(): number[] {
  return Array.from({ length: 5 }, () => Math.floor(Math.random() * 45) + 1);
}

function countMatches(userScores: number[], drawNumbers: number[]) {
  const drawSet = new Set(drawNumbers);
  return userScores.filter((score) => drawSet.has(score)).length;
}

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return { supabase, user };
}

export async function createDraftDraw(formData: FormData): Promise<void> {
  const { supabase, user } = await requireAdmin();

  const month = Number(formData.get("month"));
  const year = Number(formData.get("year"));
  const drawType = String(formData.get("draw_type") ?? "random");

  if (Number.isNaN(month) || month < 1 || month > 12) {
    redirect("/admin?error=Month must be between 1 and 12");
  }

  if (Number.isNaN(year) || year < 2025) {
    redirect("/admin?error=Year is invalid");
  }

  if (drawType !== "random" && drawType !== "algorithmic") {
    redirect("/admin?error=Invalid draw type");
  }

  const { error } = await supabase.from("draws").insert({
    month,
    year,
    draw_type: drawType,
    status: "draft",
    numbers: randomFiveScores(),
    created_by: user.id,
  });

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin?success=draw-created");
}

export async function simulateDraw(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const drawId = String(formData.get("draw_id") ?? "");

  const { data: draw } = await supabase
    .from("draws")
    .select("*")
    .eq("id", drawId)
    .single();

  if (!draw) {
    redirect("/admin?error=Draw not found");
  }

  const { data: activeSubs } = await supabase
    .from("subscriptions")
    .select("user_id")
    .in("status", ["active", "past_due"]);

  const uniqueUserIds = [...new Set((activeSubs ?? []).map((s) => s.user_id))];

  let match3 = 0;
  let match4 = 0;
  let match5 = 0;

  for (const userId of uniqueUserIds) {
    const { data: scores } = await supabase
      .from("golf_scores")
      .select("score")
      .eq("user_id", userId)
      .order("played_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5);

    const snapshot = (scores ?? []).map((s) => s.score);

    if (snapshot.length !== 5) continue;

    const matches = countMatches(snapshot, draw.numbers);

    if (matches === 3) match3++;
    if (matches === 4) match4++;
    if (matches === 5) match5++;
  }

  await supabase.from("draw_simulations").insert({
    draw_id: draw.id,
    simulated_numbers: draw.numbers,
    meta: {
      active_users: uniqueUserIds.length,
      match_3: match3,
      match_4: match4,
      match_5: match5,
    },
  });

  await supabase.from("draws").update({ status: "simulated" }).eq("id", draw.id);

  redirect("/admin?success=draw-simulated");
}

export async function publishDraw(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const drawId = String(formData.get("draw_id") ?? "");

  const { data: draw } = await supabase
    .from("draws")
    .select("*")
    .eq("id", drawId)
    .single();

  if (!draw) {
    redirect("/admin?error=Draw not found");
  }

  const { data: activeSubs } = await supabase
    .from("subscriptions")
    .select("user_id")
    .in("status", ["active", "past_due"]);

  const uniqueUserIds = [...new Set((activeSubs ?? []).map((s) => s.user_id))];

  const totalPool = uniqueUserIds.length * 10;
  const pool5 = totalPool * 0.4;
  const pool4 = totalPool * 0.35;
  const pool3 = totalPool * 0.25;

  let winners3 = 0;
  let winners4 = 0;
  let winners5 = 0;

  const entries: {
    draw_id: string;
    user_id: string;
    scores_snapshot: number[];
    matched_count: number;
    prize_amount: number;
    result_tier: "none" | "match_3" | "match_4" | "match_5";
  }[] = [];

  for (const userId of uniqueUserIds) {
    const { data: scores } = await supabase
      .from("golf_scores")
      .select("score")
      .eq("user_id", userId)
      .order("played_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5);

    const snapshot = (scores ?? []).map((s) => s.score);

    if (snapshot.length !== 5) continue;

    const matches = countMatches(snapshot, draw.numbers);

    let resultTier: "none" | "match_3" | "match_4" | "match_5" = "none";

    if (matches === 3) {
      winners3++;
      resultTier = "match_3";
    } else if (matches === 4) {
      winners4++;
      resultTier = "match_4";
    } else if (matches === 5) {
      winners5++;
      resultTier = "match_5";
    }

    entries.push({
      draw_id: draw.id,
      user_id: userId,
      scores_snapshot: snapshot,
      matched_count: matches,
      prize_amount: 0,
      result_tier: resultTier,
    });
  }

  const finalizedEntries = entries.map((entry) => {
    if (entry.result_tier === "match_3" && winners3 > 0) {
      return { ...entry, prize_amount: pool3 / winners3 };
    }
    if (entry.result_tier === "match_4" && winners4 > 0) {
      return { ...entry, prize_amount: pool4 / winners4 };
    }
    if (entry.result_tier === "match_5" && winners5 > 0) {
      return { ...entry, prize_amount: pool5 / winners5 };
    }
    return entry;
  });

  if (finalizedEntries.length > 0) {
    const { error: insertEntriesError } = await supabase
      .from("draw_entries")
      .insert(finalizedEntries);

    if (insertEntriesError) {
      redirect(`/admin?error=${encodeURIComponent(insertEntriesError.message)}`);
    }
  }

  const { error: poolError } = await supabase.from("prize_pools").upsert({
    draw_id: draw.id,
    subscriber_count: uniqueUserIds.length,
    total_pool_amount: totalPool,
    pool_5_amount: pool5,
    pool_4_amount: pool4,
    pool_3_amount: pool3,
    rollover_in: 0,
    rollover_out: winners5 === 0 ? pool5 : 0,
  });

  if (poolError) {
    redirect(`/admin?error=${encodeURIComponent(poolError.message)}`);
  }

  const { error: drawError } = await supabase
    .from("draws")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
    })
    .eq("id", draw.id);

  if (drawError) {
    redirect(`/admin?error=${encodeURIComponent(drawError.message)}`);
  }

  redirect("/admin?success=draw-published");
}
