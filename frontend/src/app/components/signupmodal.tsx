"use client";

import { useEffect } from "react";
import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function SignupModal({ isOpen, onClose, children, }: ModalProps) {
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
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg relative w-96">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <div className="flex flex-col items-center space-y-4">{children}</div>
      </div>
    </div>
  );
}
