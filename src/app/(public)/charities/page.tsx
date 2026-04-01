import { createClient } from "@/lib/supabase/server";

export default async function CharitiesPage() {
  const supabase = await createClient();

  const { data: charities } = await supabase
    .from("charities")
    .select("id, name, slug, description, is_featured")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("name");

  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <div className="mb-10">
        <h1 className="text-4xl font-semibold">Charities</h1>
        <p className="mt-4 max-w-2xl text-white/70">
          Explore active charities and see where your contribution can go.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {charities?.map((charity) => (
          <div
            key={charity.id}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            {charity.is_featured ? (
              <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                Featured
              </span>
            ) : null}

            <h2 className="mt-4 text-2xl font-semibold">{charity.name}</h2>
            <p className="mt-3 text-sm leading-6 text-white/65">
              {charity.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
