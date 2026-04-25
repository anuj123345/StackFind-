import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    RAZORPAY_KEY_ID: {
      exists: !!process.env.RAZORPAY_KEY_ID,
      prefix: process.env.RAZORPAY_KEY_ID?.substring(0, 9),
      length: process.env.RAZORPAY_KEY_ID?.length,
    },
    RAZORPAY_KEY_SECRET: {
      exists: !!process.env.RAZORPAY_KEY_SECRET,
      length: process.env.RAZORPAY_KEY_SECRET?.length,
    },
    NEXT_PUBLIC_RAZORPAY_KEY_ID: {
      exists: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      prefix: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.substring(0, 9),
    },
    NODE_ENV: process.env.NODE_ENV,
  });
}
