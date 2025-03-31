import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth"; // ✅ 正しい import パスに修正！

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  console.log("Received user data:", body); // 確認用ログ

  return NextResponse.json({ message: "User data received", data: body });
}
