import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

/**
 * Validates an Admin Key and sets a secure httpOnly cookie for persistence.
 */
export async function POST(req: NextRequest) {
  try {
    const { adminKey } = await req.json()

    if (!adminKey) {
      return NextResponse.json({ error: "Admin Key is required" }, { status: 400 })
    }

    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: "Invalid Admin Key" }, { status: 401 })
    }

    // Set secure cookie
    const cookieStore = await cookies()
    cookieStore.set("sf_admin_token", adminKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return NextResponse.json({ success: true, message: "Admin access granted" })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

/**
 * Allows clearing admin access
 */
export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete("sf_admin_token")
  return NextResponse.json({ success: true, message: "Admin access cleared" })
}
