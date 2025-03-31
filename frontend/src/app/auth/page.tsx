"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { authOptions } from "@/app/lib/auth";
import { LogoutButton } from "@/app/components/logoutbutton";

export default function Dashboard() {
  const { data: session } = useSession();
  console.log("Session Data:", session); 

  useEffect(() => {
    if (session?.idToken) {
      fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.idToken}`,
        },
        body: JSON.stringify({
          name: session.user?.name,
          email: session.user?.email,
          image: session.user?.image,
        }),
      });
    }
  }, [session]);

  if (!session) {
    return <p>ログインが必要です。</p>;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl">Dashboard</h1>
      <p>ようこそ, {session.user?.name}!</p>
      <LogoutButton />
    </main>
  );
}
