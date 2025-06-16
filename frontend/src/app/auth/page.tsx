"use client";

import { useSession } from "next-auth/react";
import { LogoutButton } from "@/app/components/logoutbutton";
import { Hero } from "@/app/components/hero";
import { Sidebar } from "@/app/components/sidebar";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading"){
    return <div>Loading...</div>;
  }

  if (!session) {
    return <p>ログインが必要です。</p>;
  } 

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <Hero />
      <Sidebar />
      <LogoutButton />
    </main>
  );
}
