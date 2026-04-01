import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  createDraftDraw,
  simulateDraw,
  publishDraw,
} from "@/app/actions/admin";

export default async function AdminPage({
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
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const [
    { count: userCount },
    { count: charityCount },
    { count: drawCount },
    { data: draws },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("charities").select("*", { count: "exact", head: true }),
    supabase.from("draws").select("*", { count: "exact", head: true }),
    supabase
      .from("draws")
      .select("*")
      .order("year", { ascending: false })
      .order("month", { ascending: false }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold">Admin Dashboard</h1>
        <p className="mt-3 text-white/70">
          Manage users, charities, draws, winners, and reporting.
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {success === "draw-created"
            ? "Draft draw created."
            : success === "draw-simulated"
              ? "Draw simulated."
              : success === "draw-published"
                ? "Draw published."
                : "Success."}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Total Users</p>
          <h2 className="mt-2 text-3xl font-semibold">{userCount ?? 0}</h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Active Charities</p>
          <h2 className="mt-2 text-3xl font-semibold">{charityCount ?? 0}</h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/50">Draw Records</p>
          <h2 className="mt-2 text-3xl font-semibold">{drawCount ?? 0}</h2>
        </div>
      </div>

      <form
        action={createDraftDraw}
        className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6"
      >
        <h2 className="text-2xl font-semibold">Create Draft Draw</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <input
            name="month"
            type="number"
            min={1}
            max={12}
            placeholder="Month"
            className="rounded-xl bg-black/40 p-3"
            required
          />
          <input
            name="year"
            type="number"
            min={2025}
            placeholder="Year"
            className="rounded-xl bg-black/40 p-3"
            required
          />
          <select
            name="draw_type"
            className="rounded-xl bg-black/40 p-3"
            defaultValue="random"
          >
            <option value="random">Random</option>
            <option value="algorithmic">Algorithmic</option>
          </select>
        </div>

        <button className="mt-4 rounded-full bg-emerald-500 px-5 py-3 font-medium text-black hover:bg-emerald-400">
          Create Draft Draw
        </button>
      </form>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">Existing Draws</h2>

        <div className="mt-6 space-y-4">
          {draws && draws.length > 0 ? (
            draws.map((draw) => (
              <div
                key={draw.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm text-white/50">
                      {draw.month}/{draw.year}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold capitalize">
                      {draw.status} · {draw.draw_type}
                    </h3>
                    <p className="mt-2 text-sm text-white/65">
                      Numbers: {Array.isArray(draw.numbers) ? draw.numbers.join(", ") : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {draw.status === "draft" ? (
                      <form action={simulateDraw}>
                        <input type="hidden" name="draw_id" value={draw.id} />
                        <button className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/85 hover:text-white">
                          Simulate
                        </button>
                      </form>
                    ) : null}

                    {(draw.status === "draft" || draw.status === "simulated") ? (
                      <form action={publishDraw}>
                        <input type="hidden" name="draw_id" value={draw.id} />
                        <button className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400">
                          Publish
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white/65">No draws yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
