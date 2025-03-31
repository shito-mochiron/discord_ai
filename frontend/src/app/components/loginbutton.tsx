"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function LoginButton() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col items-center space-y-4">
            <button
              onClick={() => signIn("google", { callbackUrl: "/auth" })}
              className="bg-white text-black px-12 py-2 border border-gray-100 rounded-full"
            >
              Google
            </button>
    </div>
  );
}