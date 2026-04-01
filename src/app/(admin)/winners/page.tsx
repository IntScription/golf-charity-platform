import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  approveWinnerClaim,
  rejectWinnerClaim,
  markWinnerPaid,
} from "@/app/actions/winner";

export default async function AdminWinnersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;
  const success = params.success;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: claims } = await supabase
    .from("winner_claims")
    .select(
      `
      id,
      draw_entry_id,
      user_id,
      proof_file_path,
      review_status,
      payment_status,
      reviewed_at,
      notes,
      created_at
    `,
    )
    .order("created_at", { ascending: false });

  const userIds = [...new Set((claims ?? []).map((claim) => claim.user_id))];
  const entryIds = [...new Set((claims ?? []).map((claim) => claim.draw_entry_id))];

  const [{ data: profiles }, { data: entries }] = await Promise.all([
    userIds.length > 0
      ? supabase.from("profiles").select("id, full_name").in("id", userIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
    entryIds.length > 0
      ? supabase
        .from("draw_entries")
        .select("id, matched_count, prize_amount, result_tier")
        .in("id", entryIds)
      : Promise.resolve({
        data: [] as {
          id: string;
          matched_count: number;
          prize_amount: number;
          result_tier: string;
        }[],
      }),
  ]);

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
  const entryMap = Object.fromEntries((entries ?? []).map((e) => [e.id, e]));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold">Winner Claims</h1>
        <p className="mt-3 text-white/70">
          Review proof submissions, approve or reject claims, and mark payouts as paid.
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {success === "claim-approved"
            ? "Claim approved."
            : success === "claim-rejected"
              ? "Claim rejected."
              : success === "claim-paid"
                ? "Claim marked as paid."
                : "Success."}
        </div>
      ) : null}

      <div className="grid gap-4">
        {claims && claims.length > 0 ? (
          claims.map((claim) => {
            const profile = profileMap[claim.user_id];
            const entry = entryMap[claim.draw_entry_id];

            return (
              <div
                key={claim.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-white/50">
                      {profile?.full_name || claim.user_id}
                    </p>
                    <h2 className="text-2xl font-semibold">
                      {entry?.result_tier ?? "Winner"} · $
                      {Number(entry?.prize_amount ?? 0).toFixed(2)}
                    </h2>
                    <p className="text-white/65">
                      Matched {entry?.matched_count ?? 0} numbers
                    </p>
                    <p className="text-sm text-white/60">
                      Review: <span className="capitalize text-white">{claim.review_status}</span>
                    </p>
                    <p className="text-sm text-white/60">
                      Payment: <span className="capitalize text-white">{claim.payment_status}</span>
                    </p>
                    {claim.proof_file_path ? (
                      <p className="text-sm text-white/60 break-all">
                        Proof path: {claim.proof_file_path}
                      </p>
                    ) : null}
                    {claim.notes ? (
                      <p className="text-sm text-red-300">Notes: {claim.notes}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-3">
                    {claim.review_status !== "approved" ? (
                      <form action={approveWinnerClaim}>
                        <input type="hidden" name="claim_id" value={claim.id} />
                        <button className="rounded-full bg-emerald-500 px-5 py-3 font-medium text-black hover:bg-emerald-400">
                          Approve
                        </button>
                      </form>
                    ) : null}

                    <form action={rejectWinnerClaim} className="space-y-3">
                      <input type="hidden" name="claim_id" value={claim.id} />
                      <textarea
                        name="notes"
                        placeholder="Reason for rejection (optional)"
                        className="min-h-25 w-full rounded-2xl bg-black/30 p-3 text-sm"
                      />
                      <button className="rounded-full border border-red-500/30 px-5 py-3 text-red-300 hover:bg-red-500/10">
                        Reject
                      </button>
                    </form>

                    {claim.review_status === "approved" &&
                      claim.payment_status !== "paid" ? (
                      <form action={markWinnerPaid}>
                        <input type="hidden" name="claim_id" value={claim.id} />
                        <button className="rounded-full border border-white/15 px-5 py-3 text-white hover:bg-white/5">
                          Mark Paid
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/65">
            No winner claims yet.
          </div>
        )}
      </div>
    </div>
  );
}
