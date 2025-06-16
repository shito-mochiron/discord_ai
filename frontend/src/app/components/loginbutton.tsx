"use client";

import { signIn } from "next-auth/react";

type LoginButtonProps = {
  mode: "signup" | "login";
};

export function LoginButton({ mode }: LoginButtonProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={() => {
          // ✅ クッキーにmodeを保存
          document.cookie = `auth_mode=${mode}; path=/`;
          signIn("google", {
            callbackUrl: "/auth",
          });
        }}
        className="bg-white text-black px-12 py-2 border-2 border-gray-200 rounded-full"
      >
        Google {mode === "signup" ? "Signup" : "Login"}
      </button>
    </div>
  );
}