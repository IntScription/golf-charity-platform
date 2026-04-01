import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Hero } from "@/components/shared/hero";
import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name, role").eq("id", user.id).single()
    : { data: null };

  return (
    <>
      <Hero />

      {user ? (
        <Section className="pt-0">
          <PageContainer>
            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
              <h2 className="text-2xl font-semibold">
                Welcome back, {profile?.full_name || "Golfer"}
              </h2>
              <p className="mt-3 text-white/75">
                Continue to your dashboard, update your latest 5 scores, manage your charity,
                and track your subscription.
              </p>

              <div className="mt-5 flex flex-wrap gap-4">
                <Link
                  href="/dashboard"
                  className="rounded-full bg-emerald-500 px-5 py-3 font-medium text-black hover:bg-emerald-400"
                >
                  Go to Dashboard
                </Link>

                {profile?.role === "admin" ? (
                  <Link
                    href="/admin"
                    className="rounded-full border border-white/15 px-5 py-3 text-white/85 hover:text-white"
                  >
                    Open Admin
                  </Link>
                ) : null}
              </div>
            </div>
          </PageContainer>
        </Section>
      ) : null}

      <Section>
        <PageContainer>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Subscribe",
                description:
                  "Join with a monthly or yearly plan and unlock the platform.",
              },
              {
                title: "Track 5 Latest Scores",
                description:
                  "Enter your latest Stableford scores with dates and stay eligible.",
              },
              {
                title: "Support Charity + Win",
                description:
                  "A portion of every subscription supports charity and funds the draw pool.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </PageContainer>
      </Section>
    </>
  );
}
