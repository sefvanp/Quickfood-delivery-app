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
  try {
    const { items, userEmail, userName } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in the cart" }, { status: 400 });
    }

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/order-success`,
      cancel_url: `${origin}/`,
    });

    // Sanity-യിലേക്ക് ഓർഡർ സേവ് ചെയ്യുന്നു
    const totalAmount = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
    
    await client.create({
      _type: "order",
      customerName: userName || "Customer",
      customerEmail: userEmail || "",
      totalAmount: totalAmount,
      status: "Preparing",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
