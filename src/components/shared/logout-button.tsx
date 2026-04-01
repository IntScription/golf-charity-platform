import { signOut } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <form action={signOut}>
      <button className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 hover:text-white">
        Logout
      </button>
    </form>
  );
}
