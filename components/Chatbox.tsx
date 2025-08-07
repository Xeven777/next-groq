"use client";
import { useChat } from "@ai-sdk/react";
import Image from "next/image";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import sparkles from "@/assets/Sparkle.svg";
import send from "@/assets/send.svg";
import robo from "@/assets/Robo.svg";
import copy from "@/assets/copy.svg";
import groqpic from "@/assets/groq.jpg";
import { models } from "@/lib/model";
import { DefaultChatTransport } from "ai";

const Chatbox = memo(({ userIp }: { userIp: string }) => {
  const [selectedModel, setSelectedModel] = useState("llama-3.3-70b-versatile");
  const [input, setInput] = useState("");
  const [responseTimes, setResponseTimes] = useState<Record<string, number>>(
    {}
  );
  const startTimeRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, status, error, sendMessage, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        selectedModel,
      },
    }),
    onFinish: ({ message }) => {
      const duration = (Date.now() - startTimeRef.current) / 1000;
      setResponseTimes((prev) => ({ ...prev, [message.id]: duration }));
    },
  });

  const isLoading = status === "streaming";

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!input.trim()) return;

      startTimeRef.current = Date.now();
      sendMessage({ text: input.trim() });
      setInput("");
    },
    [input, sendMessage]
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion);
  }, []);

  const handleModelChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedModel(event.target.value);
    },
    [setMessages]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="flex pb-0.5 h-svh w-full flex-col max-w-5xl mx-auto">
      <div className="flex-1 overflow-y-auto rounded-xl bg-neutral-200 p-4 text-sm leading-6 text-neutral-900 dark:bg-neutral-800/60 dark:text-neutral-300 sm:text-base sm:leading-7 border border-orange-600/20 h-full">
        {messages.length > 0 ? (
          messages.map((m) => {
            return (
              <div key={m.id} className="whitespace-pre-wrap">
                {m.role === "user" ? (
                  <div className="flex flex-row px-2 py-4 sm:px-4">
                    <img
                      alt="user"
                      className="mr-2 flex size-6 md:size-8 rounded-full sm:mr-4"
                      src={getAvatarUrl(userIp)}
                      width={32}
                      height={32}
                    />
                    <div className="flex max-w-3xl items-center">
                      <p>
                        {m.parts[0].type === "text" ? m.parts[0].text : null}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 flex rounded-xl bg-neutral-50 px-2 py-6 dark:bg-neutral-900 sm:px-4 relative">
                    <Image
                      alt="groq"
                      className="mr-2 flex size-6 md:size-8 rounded-full sm:mr-4"
                      src={groqpic}
                      placeholder="blur"
                      width={32}
                      height={32}
                    />
                    <div className="max-w-3xl rounded-xl markdown-body w-full overflow-x-auto">
                      {m.parts[0]?.type === "reasoning" && (
                        <div className="text-sm mb-3 p-3 border rounded-lg bg-stone-100 text-stone-600 dark:bg-stone-900 dark:text-stone-400 border-none">
                          <p className="text-orange-500 animate-pulse p-1">
                            Thinking...
                          </p>
                          <Markdown>{m.parts[0].text}</Markdown>
                        </div>
                      )}
                      <Markdown>
                        {m.parts[0]?.type === "text" ? m.parts[0]?.text : null}
                      </Markdown>
                      {responseTimes[m.id] && (
                        <div className="text-xs text-neutral-500 mt-2">
                          Response time: {responseTimes[m.id].toFixed(3)}s
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      title="copy"
                      className="absolute top-2 right-2 p-1 rounded-full bg-orange-500 dark:bg-neutral-800 transition-all active:scale-95 opacity-50 hover:opacity-75"
                      onClick={() => {
                        navigator.clipboard.writeText(m.parts[0].type || "");
                        alert("Copied to clipboard");
                      }}
                    >
                      <Image src={copy} alt="copy" width={19} className="" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-xl md:text-2xl px-2 font-semibold text-center mx-auto text-stone-500 dark:text-stone-400 tracking-wide">
              Start Chatting with
              <br />
              <span className="text-orange-500 text-2xl md:text-4xl">Groq</span>
              .AI Now!
            </p>
            <Image
              src={robo}
              id="pic"
              alt="ROBO"
              width={300}
              className="hover:scale-110 mt-6 transition-all duration-500 active:scale-95"
            />
          </div>
        )}
        {isLoading && (
          <div className="flex items-center gap-2 px-10">
            <Image
              src={sparkles}
              alt="Loading"
              width={22}
              className="animate-pulse"
            />
            <span className="text-orange-500 animate-pulse">Generating...</span>
          </div>
        )}
        {error && (
          <p className="text-red-500">Something went wrong! Try Again</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions & Input */}
      <div className="mt-2 flex w-full gap-x-2 overflow-x-auto whitespace-nowrap text-xs text-neutral-600 dark:text-neutral-300 sm:text-sm scrollbar-hide shrink-0">
        <select
          name="model"
          title="Select Model"
          id="model-select"
          className="block w-full min-w-44 rounded-xl border-none bg-neutral-200 p-4 text-sm text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500 dark:bg-neutral-800 dark:text-neutral-200 dark:focus:ring-orange-500 sm:text-base"
          value={selectedModel}
          onChange={handleModelChange}
        >
          {models.map((model) => (
            <option key={model.value} value={model.value}>
              {model.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => window.open("https://img-gen7.netlify.app/", "_blank")}
          className="rounded-lg hover:bg-linear-to-br from-orange-600 to-rose-600 p-2 hover:text-white transition-all active:scale-105 border border-orange-600 font-semibold"
        >
          Generate Image ✨
        </button>
        <button
          onClick={() => handleSuggestionClick("Make it Shorter and simpler.")}
          className="rounded-lg bg-neutral-200 p-2 hover:bg-orange-600 hover:text-neutral-200 dark:bg-neutral-800 dark:hover:bg-orange-600 dark:hover:text-neutral-50 transition-all active:scale-105"
        >
          Make Shorter
        </button>
        <button
          onClick={() =>
            handleSuggestionClick("Make it longer. explain it nicely")
          }
          className="rounded-lg bg-neutral-200 p-2 hover:bg-orange-600 hover:text-neutral-200 dark:bg-neutral-800 dark:hover:bg-orange-600 dark:hover:text-neutral-50 transition-all active:scale-105"
        >
          Make Longer
        </button>
        <button
          onClick={() =>
            handleSuggestionClick("Write it in a more professional tone.")
          }
          className="rounded-lg bg-neutral-200 p-2 hover:bg-orange-600 hover:text-neutral-200 dark:bg-neutral-800 dark:hover:bg-orange-600 dark:hover:text-neutral-50 transition-all active:scale-105"
        >
          More Professional
        </button>
        <button
          onClick={() =>
            handleSuggestionClick("Write it in a more casual and light tone.")
          }
          className="rounded-lg bg-neutral-200 p-2 hover:bg-orange-600 hover:text-neutral-200 dark:bg-neutral-800 dark:hover:bg-orange-600 dark:hover:text-neutral-50 transition-all active:scale-105"
        >
          More Casual
        </button>
        <button
          onClick={() => handleSuggestionClick("Paraphrase it")}
          className="rounded-lg bg-neutral-200 p-2 hover:bg-orange-600 hover:text-neutral-200 dark:bg-neutral-800 dark:hover:bg-orange-600 dark:hover:text-neutral-50 transition-all active:scale-105"
        >
          Paraphrase
        </button>
      </div>

      <form className="mt-2" onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            id="chat-input"
            className="block caret-orange-600 w-full rounded-xl border-none bg-neutral-200 p-4 pl-2 pr-20 text-sm text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500 dark:bg-neutral-800 dark:text-neutral-200 sm:text-base resize-y"
            placeholder="Enter your prompt"
            rows={1}
            value={input}
            required
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute bottom-2 right-2.5 rounded-lg px-4 py-2 text-sm font-medium text-neutral-200 bg-orange-600 hover:bg-orange-700 dark:focus:ring-orange-800 sm:text-base flex items-center gap-2 active:scale-95 transition-all"
          >
            {isLoading ? (
              <>
                Generating
                <Image
                  src={sparkles}
                  alt="loading"
                  width={22}
                  className="animate-pulse"
                />
              </>
            ) : (
              <>
                Send <Image src={send} alt="" width={20} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
});

function getAvatarUrl(ip: string): string {
  const encodedIp = encodeURIComponent(ip);
  return `https://xvatar.vercel.app/api/avatar/${encodedIp}?rounded=120&size=240&userLogo=true`;
}

export default Chatbox;
