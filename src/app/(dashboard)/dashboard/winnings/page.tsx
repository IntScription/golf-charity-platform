import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { uploadWinnerProof } from "@/app/actions/winner";

type ClaimMap = Record<
  string,
  {
    id: string;
    review_status: "pending" | "approved" | "rejected";
    payment_status: "pending" | "paid";
    proof_file_path: string | null;
    notes: string | null;
  }
>;

export default async function WinningsPage({
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

  const [{ data: entries }, { data: claims }] = await Promise.all([
    supabase
      .from("draw_entries")
      .select("*")
      .eq("user_id", user.id)
      .neq("result_tier", "none")
      .order("created_at", { ascending: false }),
    supabase
      .from("winner_claims")
      .select("id, draw_entry_id, review_status, payment_status, proof_file_path, notes")
      .eq("user_id", user.id),
  ]);

  const claimsByEntryId: ClaimMap = Object.fromEntries(
    (claims ?? []).map((claim) => [
      claim.draw_entry_id,
      {
        id: claim.id,
        review_status: claim.review_status,
        payment_status: claim.payment_status,
        proof_file_path: claim.proof_file_path,
        notes: claim.notes,
      },
    ]),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold">Winnings</h1>
        <p className="mt-3 text-white/70">
          Upload proof for winning entries and track review and payout status.
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {success === "proof-uploaded" ? "Proof uploaded successfully." : "Success."}
        </div>
      ) : null}

      <div className="grid gap-4">
        {entries && entries.length > 0 ? (
          entries.map((entry) => {
            const claim = claimsByEntryId[entry.id];

            return (
              <div
                key={entry.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm text-white/50">{entry.result_tier}</p>
                    <h2 className="mt-2 text-3xl font-semibold">
                      ${Number(entry.prize_amount).toFixed(2)}
                    </h2>
                    <p className="mt-2 text-white/65">
                      Matched {entry.matched_count} numbers
                    </p>

                    <div className="mt-4 text-sm text-white/60">
                      <p>
                        Review status:{" "}
                        <span className="capitalize text-white">
                          {claim?.review_status ?? "not submitted"}
                        </span>
                      </p>
                      <p>
                        Payment status:{" "}
                        <span className="capitalize text-white">
                          {claim?.payment_status ?? "pending"}
                        </span>
                      </p>
                      {claim?.notes ? (
                        <p className="mt-2 text-red-300">Admin note: {claim.notes}</p>
                      ) : null}
                    </div>
                  </div>

                  <form
                    action={uploadWinnerProof}
                    className="w-full max-w-md rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <input type="hidden" name="draw_entry_id" value={entry.id} />

                    <label className="mb-3 block text-sm text-white/70">
                      Upload score proof
                    </label>

                    <input
                      name="proof"
                      type="file"
                      accept="image/*,.pdf"
                      className="w-full rounded-xl bg-black/40 p-3 text-sm"
                      required={!claim?.proof_file_path}
                    />

                    <button className="mt-4 rounded-full bg-emerald-500 px-5 py-3 font-medium text-black hover:bg-emerald-400">
                      {claim?.proof_file_path ? "Replace Proof" : "Submit Proof"}
                    </button>
                  </form>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/65">
            No winnings yet.
          </div>
        )}
      </div>
    </div>
  );
}
