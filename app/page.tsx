"use client";

import Chatbox from "@/components/Chatbox";
import { useChat } from "ai/react";
import Markdown from "react-markdown";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat();
  return (
    <>
      {/* <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch border">
        {messages.length > 0
          ? messages.map((m) => (
              <div key={m.id} className="whitespace-pre-wrap">
                {m.role === "user" ? "User: " : "AI: "}
                <Markdown>{m.content}</Markdown>
              </div>
            ))
          : null}

        <form onSubmit={handleSubmit}>
          <input
            className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
        </form>
      </div> */}
      <Chatbox/>
    </>
  );
}
