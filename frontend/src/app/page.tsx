"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // トースト通知
import { LoginButton } from "./components/loginbutton"
import { SignupModal } from "../app/components/signupmodal"

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login">("login");
  const { data: session, status } = useSession();
  const router = useRouter();

  // 成功時のみ /auth に遷移させる
  useEffect(() => {
    if (status === "authenticated" && session?.user?.appJwt) {
      router.push("/auth");
    }
  }, [status, session, router]);

  // エラーハンドリング（401, 403, その他）
  useEffect(() => {
    const error = session?.authError;

    if (status === "authenticated" && error) {
      if (error === 403) {
        setAuthMode("login");
        setIsModalOpen(true); // ログインモーダルを開く
      } else if (error === 401) {
        toast.error("Google認証に失敗しました");
      } else {
        toast.error("サインインに失敗しました。再度Singup/Loginをお試しください");
      }
    }
  }, [session, status]);

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-white">
      <h2 className="text-2xl font-medium p-8 text-center">サインアップ/ログインをして<br />会話を始めましょう</h2>
      <div className="flex space-x-6">
        <button
          onClick={() => {
            setAuthMode("signup"); // ← Signupにセット
            setIsModalOpen(true);
          }}
          className="px-18 py-2 bg-gray-300 border border-gray-300 text-black rounded-full font-semibold"
        >
          Signup
        </button>
        <button
          onClick={() => {
            setAuthMode("login"); // ← Loginにセット
            setIsModalOpen(true);
          }}
          className="px-18 py-2 bg-white border border-gray-300 text-black rounded-full"
        >
          Login
        </button>
      </div>

      <SignupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4">
        {authMode === "signup" ? "Signup" : "Login"}
        </h2>
        <LoginButton mode={authMode} />
        <p className="mt-4 text-center">or</p>
      </SignupModal>
    </main>
  );
}