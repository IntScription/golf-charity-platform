import Stripe from "stripe";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

function mapStripeStatus(
  status: string,
): "active" | "inactive" | "canceled" | "past_due" | "lapsed" {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due" || status === "unpaid") return "past_due";
  if (status === "canceled") return "canceled";
  return "inactive";
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.user_id;
    const planId = session.metadata?.plan_id;
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

    if (userId && planId && subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const item = subscription.items.data[0];

      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          plan_id: planId,
          stripe_customer_id:
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id,
          stripe_subscription_id: subscription.id,
          status: mapStripeStatus(subscription.status),
          current_period_start: new Date(
            item.current_period_start * 1000,
          ).toISOString(),
          current_period_end: new Date(
            item.current_period_end * 1000,
          ).toISOString(),
          renewal_date: new Date(item.current_period_end * 1000).toISOString(),
        },
        {
          onConflict: "stripe_subscription_id",
        },
      );
    }
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const item = subscription.items.data[0];

    await supabase
      .from("subscriptions")
      .update({
        status: mapStripeStatus(subscription.status),
        current_period_start: new Date(
          item.current_period_start * 1000,
        ).toISOString(),
        current_period_end: new Date(
          item.current_period_end * 1000,
        ).toISOString(),
        renewal_date: new Date(item.current_period_end * 1000).toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id);
  }

  return new Response("ok", { status: 200 });
}
