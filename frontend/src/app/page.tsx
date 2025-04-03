"use client";

import { useState } from "react";
import { Sidebar}  from "../app/components/sidebar"
import { Hero } from "../app/components/hero"
import { LoginButton } from "./components/loginbutton"
import { SignupModal } from "../app/components/signupmodal"

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-white">
      <h2 className="text-2xl font-medium p-8 text-center">サインアップ/ログインをして<br />会話を始めましょう</h2>
      <div className="flex space-x-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-18 py-2 bg-gray-300 border border-gray-300 text-black rounded-full font-semibold"
        >
          Signup
        </button>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-18 py-2 bg-white border border-gray-300 text-black rounded-full"
        >
          Login
        </button>
      </div>

      {/* ✅ 必須の props を渡す */}
      <SignupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-xl font-bold">Login</h2>
        <LoginButton />
        <p className="mt-4">or</p>
      </SignupModal>
    </main>
  );
}
