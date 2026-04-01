import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";

export function Hero() {
  return (
    <Section className="pt-24">
      <PageContainer>
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
              Golf. Impact. Monthly Rewards.
            </span>

            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Play with purpose. Win monthly. Give back automatically.
            </h1>

            <p className="max-w-xl text-base text-white/70 md:text-lg">
              Enter your latest golf scores, support a charity you care about,
              and take part in monthly draw-based prize pools.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-emerald-500 px-5 py-3 font-medium text-black hover:bg-emerald-400"
              >
                Get Started
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-full border border-white/15 px-5 py-3 text-white/80 hover:text-white"
              >
                How It Works
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
            <div className="space-y-4">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-sm text-white/60">Latest Score</p>
                <p className="mt-2 text-4xl font-semibold">38</p>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {[38, 34, 31, 29, 36].map((score) => (
                  <div
                    key={score}
                    className="rounded-2xl border border-white/10 bg-black/30 p-4 text-center"
                  >
                    <p className="text-xs text-white/50">Stableford</p>
                    <p className="mt-2 text-lg font-semibold">{score}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                <p className="text-sm text-emerald-200">
                  Part of your subscription goes directly to your chosen charity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </Section>
  );
}
