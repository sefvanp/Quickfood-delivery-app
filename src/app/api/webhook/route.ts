import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@sanity/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2023-10-16",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}`, status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      // Sanity-യിലേക്ക് ഓർഡർ സേവ് ചെയ്യുന്നു
      await client.create({
        _type: "order",
        customerName: session.customer_details?.name || "Customer",
        customerEmail: session.customer_details?.email || "",
        totalAmount: session.amount_total ? session.amount_total / 100 : 0,
        status: "Paid",
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Sanity Order Save Error:", err);
    }
  }

  return NextResponse.json({ received: true });
}
