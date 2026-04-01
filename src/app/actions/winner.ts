"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

async function requireAdmin() {
  const { supabase, user } = await requireUser();

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

export async function uploadWinnerProof(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();

  const drawEntryId = String(formData.get("draw_entry_id") ?? "");
  const file = formData.get("proof") as File | null;

  if (!drawEntryId) {
    redirect("/dashboard/winnings?error=Missing winning entry");
  }

  if (!file || file.size === 0) {
    redirect("/dashboard/winnings?error=Please choose a proof file");
  }

  const { data: entry } = await supabase
    .from("draw_entries")
    .select("id, user_id, result_tier")
    .eq("id", drawEntryId)
    .eq("user_id", user.id)
    .single();

  if (!entry || entry.result_tier === "none") {
    redirect("/dashboard/winnings?error=Invalid winning entry");
  }

  const fileExt = file.name.split(".").pop() || "png";
  const filePath = `${user.id}/${drawEntryId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("winner-proofs")
    .upload(filePath, file, {
      upsert: true,
    });

  if (uploadError) {
    redirect(
      `/dashboard/winnings?error=${encodeURIComponent(uploadError.message)}`,
    );
  }

  const { error: claimError } = await supabase
    .from("winner_claims")
    .upsert(
      {
        draw_entry_id: drawEntryId,
        user_id: user.id,
        proof_file_path: filePath,
        review_status: "pending",
        payment_status: "pending",
      },
      {
        onConflict: "draw_entry_id",
      },
    );

  if (claimError) {
    redirect(
      `/dashboard/winnings?error=${encodeURIComponent(claimError.message)}`,
    );
  }

  redirect("/dashboard/winnings?success=proof-uploaded");
}

export async function approveWinnerClaim(formData: FormData): Promise<void> {
  const { supabase, user } = await requireAdmin();

  const claimId = String(formData.get("claim_id") ?? "");

  if (!claimId) {
    redirect("/admin/winners?error=Missing claim id");
  }

  const { error } = await supabase
    .from("winner_claims")
    .update({
      review_status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", claimId);

  if (error) {
    redirect(`/admin/winners?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/winners?success=claim-approved");
}

export async function rejectWinnerClaim(formData: FormData): Promise<void> {
  const { supabase, user } = await requireAdmin();

  const claimId = String(formData.get("claim_id") ?? "");
  const notes = String(formData.get("notes") ?? "");

  if (!claimId) {
    redirect("/admin/winners?error=Missing claim id");
  }

  const { error } = await supabase
    .from("winner_claims")
    .update({
      review_status: "rejected",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      notes,
    })
    .eq("id", claimId);

  if (error) {
    redirect(`/admin/winners?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/winners?success=claim-rejected");
}

export async function markWinnerPaid(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const claimId = String(formData.get("claim_id") ?? "");

  if (!claimId) {
    redirect("/admin/winners?error=Missing claim id");
  }

  const { error } = await supabase
    .from("winner_claims")
    .update({
      payment_status: "paid",
    })
    .eq("id", claimId)
    .eq("review_status", "approved");

  if (error) {
    redirect(`/admin/winners?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/winners?success=claim-paid");
}
