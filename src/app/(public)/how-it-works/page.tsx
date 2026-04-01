import Link from "next/link";

const steps = [
  {
    title: "1. Subscribe",
    description:
      "Choose a monthly or yearly plan to unlock score tracking, charity participation, and monthly draw eligibility.",
  },
  {
    title: "2. Pick a Charity",
    description:
      "Select a charity you want to support and choose what percentage of your subscription goes toward charitable contribution.",
  },
  {
    title: "3. Add Your Latest 5 Scores",
    description:
      "Enter your golf scores in Stableford format with dates. Only your latest 5 scores are stored, and the oldest score is automatically replaced when a new one is added.",
  },
  {
    title: "4. Enter the Monthly Draw",
    description:
      "Eligible subscribers are included in the monthly draw cycle. Your latest 5 stored scores are used as your draw snapshot for that month.",
  },
  {
    title: "5. Prize Tiers Are Calculated",
    description:
      "The monthly prize pool is split across 3-match, 4-match, and 5-match tiers. Multiple winners in the same tier split that pool equally.",
  },
  {
    title: "6. Winners Verify Results",
    description:
      "If you win, you can upload proof of your golf scores for admin review. Once verified, your payout moves from pending to paid.",
  },
];

const faqs = [
  {
    question: "Do I need an active subscription to participate?",
    answer:
      "Yes. An active subscription is required to access score entry, charity participation, and draw eligibility features.",
  },
  {
    question: "How many scores can I store?",
    answer:
      "Only your latest 5 scores are retained at any time, shown in reverse chronological order.",
  },
  {
    question: "Can I change my charity later?",
    answer:
      "Yes. You can update your selected charity and contribution percentage from your dashboard.",
  },
  {
    question: "What happens if nobody wins the top tier?",
    answer:
      "If there is no 5-match winner, the jackpot amount rolls forward to the next draw cycle.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <div className="max-w-3xl">
        <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
          Simple, clear, transparent
        </span>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
          How It Works
        </h1>

        <p className="mt-4 text-base leading-7 text-white/70 md:text-lg">
          This platform combines golf score tracking, monthly rewards, and
          charitable giving into one subscription experience.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {steps.map((step) => (
          <div
            key={step.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <h2 className="text-2xl font-semibold">{step.title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/65">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-8">
        <h2 className="text-3xl font-semibold">Why it feels different</h2>
        <p className="mt-4 max-w-3xl text-white/75">
          This is not just a golf platform. It is built around participation,
          impact, and excitement — giving players a reason to stay engaged while
          supporting a meaningful cause.
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/pricing"
            className="rounded-full bg-emerald-500 px-5 py-3 font-medium text-black hover:bg-emerald-400"
          >
            View Pricing
          </Link>
          <Link
            href="/charities"
            className="rounded-full border border-white/15 px-5 py-3 text-white/85 hover:text-white"
          >
            Explore Charities
          </Link>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-semibold">Frequently Asked Questions</h2>

        <div className="mt-8 grid gap-4">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <h3 className="text-lg font-semibold">{faq.question}</h3>
              <p className="mt-2 text-sm leading-6 text-white/65">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
