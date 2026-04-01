"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Role = "subscriber" | "admin" | null;

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>(null);

  useEffect(() => {
    const supabase = createClient();

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoggedIn(false);
        setRole(null);
        return;
      }

      setIsLoggedIn(true);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole((profile?.role as Role) ?? "subscriber");
    };

    void load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void load();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Golf Charity Platform
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm text-white/70 hover:text-white">
            Home
          </Link>
          <Link href="/charities" className="text-sm text-white/70 hover:text-white">
            Charities
          </Link>
          <Link href="/pricing" className="text-sm text-white/70 hover:text-white">
            Pricing
          </Link>
          <Link href="/how-it-works" className="text-sm text-white/70 hover:text-white">
            How It Works
          </Link>

          {isLoggedIn ? (
            <Link href="/dashboard" className="text-sm text-white/70 hover:text-white">
              Dashboard
            </Link>
          ) : null}

          {role === "admin" ? (
            <Link href="/admin" className="text-sm text-white/70 hover:text-white">
              Admin
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <form action="/auth/signout" method="post">
              <button className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 hover:text-white">
                Logout
              </button>
            </form>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 hover:text-white"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400"
              >
                Subscribe
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
