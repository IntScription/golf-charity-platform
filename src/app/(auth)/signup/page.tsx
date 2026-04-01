import { signUp } from "@/app/actions/auth";
import { SubmitButton } from "@/components/shared/submit-button";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

  return (
    <form
      action={signUp}
      className="mx-auto flex min-h-[80vh] max-w-md items-center px-4"
    >
      <div className="w-full space-y-4 rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-semibold">Sign Up</h1>

        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <input
          name="full_name"
          placeholder="Full Name"
          className="w-full rounded-lg bg-black/40 p-3"
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full rounded-lg bg-black/40 p-3"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full rounded-lg bg-black/40 p-3"
          required
        />

        <SubmitButton>Create Account</SubmitButton>
      </div>
    </form>
  );
}
