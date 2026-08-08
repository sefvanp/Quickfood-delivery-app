import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2023-10-16",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Sanity-യിലേക്ക് ഓർഡർ സേവ് ചെയ്യുന്നു
    const orderDoc = {
      _type: "order",
      customerName: body.customerName || "Guest",
      customerEmail: body.customerEmail || "",
      items: body.items,
      totalAmount: body.totalAmount,
      status: "Paid",
      createdAt: new Date().toISOString(),
    };

    const result = await client.create(orderDoc);
    return NextResponse.json({ success: true, orderId: result._id });
  } catch (err: any) {
    console.error("Sanity Order Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
