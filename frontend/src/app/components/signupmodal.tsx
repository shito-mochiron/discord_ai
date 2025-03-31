"use client";

import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function SignupModal({ isOpen, onClose, children }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose(); // ESCキーで閉じる
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null; // モーダルが開いていないときは何も表示しない

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      {/* モーダル本体 */}
      <div className="items-center bg-white w-[450px] h-[632px] rounded-2xl shadow-lg relative flex flex-col items-center justify-center text-center">
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          ✕
        </button>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
