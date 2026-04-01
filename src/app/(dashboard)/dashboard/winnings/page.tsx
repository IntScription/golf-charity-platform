import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function WinningsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: entries } = await supabase
    .from("draw_entries")
    .select("*")
    .eq("user_id", user.id)
    .neq("result_tier", "none")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-semibold">Winnings</h1>
      <div className="mt-8 grid gap-4">
        {entries?.map((entry) => (
          <div key={entry.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/50">{entry.result_tier}</p>
            <p className="mt-2 text-2xl font-semibold">${entry.prize_amount}</p>
            <p className="mt-2 text-white/65">Matched {entry.matched_count} numbers</p>
          </div>
        ))}
      </div>
    </div>
  );
}
