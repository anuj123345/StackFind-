import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getServerUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    console.error("Razorpay Keys missing:", { key_id: !!key_id, key_secret: !!key_secret });
    return NextResponse.json({ error: "Razorpay API keys are not configured." }, { status: 500 });
  }

  const razorpay = new Razorpay({
    key_id,
    key_secret,
  });
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, receipt, notes } = await req.json();

    if (!amount || amount < 100) {
      return NextResponse.json({ error: "Amount must be at least 100 paise (₹1)." }, { status: 400 });
    }

    const options = {
      amount: Math.round(amount), // amount in paise
      currency: "INR",
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error("Razorpay Order Creation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
