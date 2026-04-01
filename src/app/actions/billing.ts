"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function createCheckoutSession(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const planId = String(formData.get("plan_id") ?? "");

  const { data: plan } = await supabase
    .from("subscription_plans")
    .select("id, name, stripe_price_id")
    .eq("id", planId)
    .single();

  if (!plan?.stripe_price_id) {
    redirect("/pricing?error=Plan is not configured for Stripe");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    line_items: [
      {
        price: plan.stripe_price_id,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=subscription-started`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?error=checkout-cancelled`,
    metadata: {
      user_id: user.id,
      plan_id: plan.id,
    },
  });

  if (!session.url) {
    redirect("/pricing?error=Unable to create checkout session");
  }

  redirect(session.url);
}
