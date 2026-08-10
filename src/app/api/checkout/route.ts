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
    const { items, userEmail, userName, discountCode } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in the cart" }, { status: 400 });
    }

    let discountPercentage = 0;
    if (discountCode === "QUICK50") {
      discountPercentage = 50; // 50% discount
    } else if (discountCode === "WELCOME10" || discountCode === "QUICKFREE") {
      discountPercentage = 10; // 10% discount
    }

    const lineItems = items.map((item: any) => {
      let finalPrice = item.price;
      if (discountPercentage > 0) {
        finalPrice = item.price * (1 - discountPercentage / 100);
      }

      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(finalPrice * 100), // Stripe takes amount in paisa
        },
        quantity: item.quantity,
      };
    });

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?canceled=true`,
    });

    const subtotal = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
    const discountAmount = (subtotal * discountPercentage) / 100;
    const totalAmount = subtotal - discountAmount;
    
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