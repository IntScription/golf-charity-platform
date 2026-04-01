import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-semibold">404</h1>
      <p className="mt-4 text-white/65">Page not found.</p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-emerald-500 px-5 py-3 font-medium text-black"
      >
        Go Home
      </Link>
    </div>
  );
}
