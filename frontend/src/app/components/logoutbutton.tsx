"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/" })} className="p-2 bg-red-500 text-white rounded">
      ログアウト
    </button>
  );
}
