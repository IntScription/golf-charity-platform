import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  saveCharityPreference,
  addGolfScoreAction,
} from "@/app/actions/dashboard";

export default async function DashboardPage({
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

  const [
    { data: profile },
    { data: charities },
    { data: preference },
    { data: scores },
    { data: subscription },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("charities")
      .select("id, name, slug, description, is_featured")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("user_charity_preferences")
      .select("id, charity_id, contribution_percent")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("golf_scores")
      .select("*")
      .eq("user_id", user.id)
      .order("played_at", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("subscriptions")
      .select("status, renewal_date")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const selectedCharity =
    charities?.find((charity) => charity.id === preference?.charity_id) ?? null;

  const hasAccess =
    subscription?.status === "active" || subscription?.status === "past_due";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold">
          Welcome {profile?.full_name || "User"}
        </h1>
        <p className="mt-3 text-white/70">
          Manage your charity selection, latest golf scores, and subscription
          info.
        </p>
      </div>

      {!hasAccess ? (
        <div className="mb-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
          Your subscription is not active. Please subscribe to unlock score
          entry, charity participation, and draw eligibility.
        </div>
      ) : null}

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {success === "charity-saved"
            ? "Charity preference saved."
            : success === "score-added"
              ? "Score added successfully."
              : success === "subscription-started"
                ? "Subscription checkout completed."
                : "Success."}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Subscription Status</p>
          <h2 className="mt-2 text-2xl font-semibold capitalize">
            {subscription?.status || "inactive"}
          </h2>
          <p className="mt-2 text-sm text-white/65">
            Renewal date:{" "}
            {subscription?.renewal_date
              ? new Date(subscription.renewal_date).toLocaleDateString()
              : "Not available yet"}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Selected Charity</p>
          <h2 className="mt-2 text-2xl font-semibold">
            {selectedCharity?.name || "Not selected"}
          </h2>
          <p className="mt-2 text-sm text-white/65">
            Contribution: {preference?.contribution_percent ?? 10}%
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Latest Scores Stored</p>
          <h2 className="mt-2 text-2xl font-semibold">{scores?.length ?? 0}/5</h2>
          <p className="mt-2 text-sm text-white/65">
            Only your latest 5 scores are retained.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <form
          action={saveCharityPreference}
          className="rounded-3xl border border-white/10 bg-white/5 p-6"
        >
          <fieldset disabled={!hasAccess} className={!hasAccess ? "opacity-60" : ""}>
            <h2 className="text-2xl font-semibold">Choose Your Charity</h2>
            <p className="mt-2 text-sm text-white/65">
              Select a charity and set your contribution percentage.
            </p>

            <div className="mt-6 space-y-4">
              <select
                name="charity_id"
                defaultValue={preference?.charity_id ?? ""}
                className="w-full rounded-xl bg-black/40 p-3"
                required
              >
                <option value="" disabled>
                  Select a charity
                </option>
                {charities?.map((charity) => (
                  <option key={charity.id} value={charity.id}>
                    {charity.name}
                  </option>
                ))}
              </select>

              <input
                name="contribution_percent"
                type="number"
                min={10}
                max={100}
                defaultValue={preference?.contribution_percent ?? 10}
                className="w-full rounded-xl bg-black/40 p-3"
                required
              />

              <button className="rounded-full bg-emerald-500 px-5 py-3 font-medium text-black hover:bg-emerald-400 disabled:opacity-60">
                Save Charity Preference
              </button>
            </div>
          </fieldset>
        </form>

        <form
          action={addGolfScoreAction}
          className="rounded-3xl border border-white/10 bg-white/5 p-6"
        >
          <fieldset disabled={!hasAccess} className={!hasAccess ? "opacity-60" : ""}>
            <h2 className="text-2xl font-semibold">Add Golf Score</h2>
            <p className="mt-2 text-sm text-white/65">
              Enter a Stableford score and the played date.
            </p>

            <div className="mt-6 space-y-4">
              <input
                name="score"
                type="number"
                min={1}
                max={45}
                placeholder="Score (1–45)"
                className="w-full rounded-xl bg-black/40 p-3"
                required
              />

              <input
                name="played_at"
                type="date"
                className="w-full rounded-xl bg-black/40 p-3"
                required
              />

              <button className="rounded-full bg-emerald-500 px-5 py-3 font-medium text-black hover:bg-emerald-400 disabled:opacity-60">
                Add Score
              </button>
            </div>
          </fieldset>
        </form>
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">Latest 5 Scores</h2>
        <p className="mt-2 text-sm text-white/65">
          Scores are shown newest first.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {scores && scores.length > 0 ? (
            scores.map((score) => (
              <div
                key={score.id}
                className="rounded-2xl border border-white/10 bg-black/30 p-4"
              >
                <p className="text-xs text-white/50">Stableford</p>
                <p className="mt-2 text-2xl font-semibold">{score.score}</p>
                <p className="mt-2 text-sm text-white/60">
                  {new Date(score.played_at).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-white/65">No scores yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
