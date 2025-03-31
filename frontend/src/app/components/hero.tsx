"use client";

import { useState } from "react";

export function Hero() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<string[]>([]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (input.trim() === "") return;
        setInput("");
    };

    return (
        <div
          className="h-screen w-3/5 bg-[#ffffff] rounded-md item-center">
          <h1 className="font-black">何でも聞いてください</h1>
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="メッセージを入力..."
              className="flex-1 p-2 bg-[#d9d9d9] rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
             >
               送信
            </button>
          </form>
        </div>
    );
};