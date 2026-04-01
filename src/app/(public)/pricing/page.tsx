import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/app/actions/billing";

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

  const supabase = await createClient();

  const { data: plans } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("price");

  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <div className="mb-10">
        <h1 className="text-4xl font-semibold">Pricing</h1>
        <p className="mt-4 text-white/70">
          Choose a monthly or yearly subscription to unlock score tracking,
          charity contributions, and monthly draws.
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {plans?.map((plan) => (
          <form
            key={plan.id}
            action={createCheckoutSession}
            className="rounded-3xl border border-white/10 bg-white/5 p-8"
          >
            <input type="hidden" name="plan_id" value={plan.id} />

            <h2 className="text-3xl font-semibold">{plan.name}</h2>
            <p className="mt-3 text-white/65">
              Billed every {plan.billing_interval}.
            </p>
            <p className="mt-6 text-5xl font-semibold">${plan.price}</p>

            <button className="mt-8 rounded-full bg-emerald-500 px-5 py-3 font-medium text-black hover:bg-emerald-400">
              Choose Plan
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
