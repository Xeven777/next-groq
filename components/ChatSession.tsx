"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import groqpic from "@/assets/groq.jpg";
import sparkles from "@/assets/Sparkle.svg";
import send from "@/assets/send.svg";
import robo from "@/assets/Robo.svg";
import copy from "@/assets/copy.svg";
import { ImageUpload, UploadedImage } from "./ImageUpload";
import { getModelByValue } from "@/lib/model";

export function ChatSession({
  model,
  userIp,
  input,
  setInput,
  modelControls,
}: {
  model: string;
  userIp: string;
  input: string;
  setInput: (v: string) => void;
  modelControls?: React.ReactNode;
}) {
  const [responseTimes, setResponseTimes] = useState<Record<string, number>>(
    {}
  );
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const startTimeRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentModel = getModelByValue(model);
  const supportsVision = currentModel?.supportsVision || false;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { selectedModel: model },
      }),
    [model]
  );

  const { messages, status, error, sendMessage } = useChat({
    transport,
    onFinish: ({ message }) => {
      const duration = (Date.now() - startTimeRef.current) / 1000;
      setResponseTimes((prev) => ({ ...prev, [message.id]: duration }));
    },
  });

  const isLoading = status === "streaming";

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!input.trim() && images.length === 0) return;

      startTimeRef.current = Date.now();

      // Create message parts
      const parts: any[] = [];

      // Add text part if there's input
      if (input.trim()) {
        parts.push({ type: "text", text: input.trim() });
      }

      // Add image parts if there are images and model supports vision
      if (images.length > 0 && supportsVision) {
        images.forEach((image) => {
          parts.push({
            type: "file",
            mediaType: image.file.type,
            url: image.base64,
          });
        });
      }

      sendMessage({ parts });
      setInput("");
      setImages([]);
    },
    [input, images, sendMessage, setInput, supportsVision]
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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
    <>
      <div className="flex-1 overflow-y-auto rounded-xl bg-neutral-200 p-4 text-sm leading-6 text-neutral-900 dark:bg-neutral-800/60 dark:text-neutral-300 sm:text-base sm:leading-7 border border-orange-600/20 h-full">
        {messages.length > 0 ? (
          messages.map((m) => (
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
                  <div className="flex max-w-3xl flex-col space-y-2">
                    {/* Text content */}
                    {m.parts.some((part) => part.type === "text") && (
                      <p>
                        {m.parts.map((part, index) =>
                          part.type === "text" ? (
                            <span key={index}>{part.text}</span>
                          ) : null
                        )}
                      </p>
                    )}

                    {/* Image content */}
                    {m.parts.some(
                      (part) =>
                        part.type === "file" &&
                        part.mediaType?.startsWith("image/")
                    ) && (
                      <div className="grid grid-cols-4 gap-2 w-full">
                        {m.parts.map((part, index) =>
                          part.type === "file" &&
                          part.mediaType?.startsWith("image/") ? (
                            <Image
                              key={index}
                              src={part.url}
                              alt="User uploaded image"
                              width={200}
                              height={200}
                              className="rounded-lg object-cover shadow max-w-40 aspect-square"
                            />
                          ) : null
                        )}
                      </div>
                    )}
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
                    {m.parts.map((part) => {
                      if (part.type === "reasoning") {
                        return (
                          <div
                            key={`${m.id}-reasoning`}
                            className="text-sm mb-3 p-3 border rounded-lg bg-stone-100 text-stone-600 dark:bg-stone-900 dark:text-stone-400 border-none"
                          >
                            <p className="text-orange-500 animate-pulse p-1">
                              Thinking...
                            </p>
                            <Markdown
                              remarkPlugins={[
                                remarkGfm,
                                remarkMath,
                                remarkBreaks,
                              ]}
                              rehypePlugins={[rehypeKatex, rehypeHighlight]}
                              components={{
                                table: ({ children }) => (
                                  <div className="overflow-x-auto my-4">
                                    <table className="min-w-full">
                                      {children}
                                    </table>
                                  </div>
                                ),
                              }}
                            >
                              {part.text}
                            </Markdown>
                          </div>
                        );
                      }
                      if (part.type === "text") {
                        const parsed = parseThinkingContent(part.text);
                        return (
                          <div key={`${m.id}-text`}>
                            {parsed.hasReasoning &&
                              parsed.reasoning.map((reasoningText, index) => (
                                <div
                                  key={`${m.id}-parsed-reasoning-${index}`}
                                  className="text-sm mb-3 p-3 border rounded-lg bg-stone-100 text-stone-600 dark:bg-stone-900 dark:text-stone-400 border-none"
                                >
                                  <p className="text-orange-500 animate-pulse p-1">
                                    Thinking...
                                  </p>
                                  <Markdown
                                    remarkPlugins={[
                                      remarkGfm,
                                      remarkMath,
                                      remarkBreaks,
                                    ]}
                                    rehypePlugins={[
                                      rehypeKatex,
                                      rehypeHighlight,
                                    ]}
                                    components={{
                                      table: ({ children }) => (
                                        <div className="overflow-x-auto my-4">
                                          <table className="min-w-full">
                                            {children}
                                          </table>
                                        </div>
                                      ),
                                    }}
                                  >
                                    {reasoningText}
                                  </Markdown>
                                </div>
                              ))}
                            {parsed.cleanText && (
                              <Markdown
                                remarkPlugins={[
                                  remarkGfm,
                                  remarkMath,
                                  remarkBreaks,
                                ]}
                                rehypePlugins={[rehypeKatex, rehypeHighlight]}
                                components={{
                                  table: ({ children }) => (
                                    <div className="overflow-x-auto my-4">
                                      <table className="min-w-full">
                                        {children}
                                      </table>
                                    </div>
                                  ),
                                }}
                              >
                                {parsed.cleanText}
                              </Markdown>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })}
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
                      const textContent = m.parts
                        .filter((part) => part.type === "text")
                        .map((part) => {
                          const parsed = parseThinkingContent(part.text);
                          return parsed.cleanText || part.text;
                        })
                        .join("");
                      navigator.clipboard.writeText(textContent);
                      alert("Copied to clipboard");
                    }}
                  >
                    <Image src={copy} alt="copy" width={19} />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-xl md:text-2xl px-2 font-semibold text-center mx-auto text-stone-500 dark:text-stone-400 tracking-wide">
              Start Chatting with
              <br />
              <span className="text-orange-500 text-2xl md:text-4xl">
                Groq
              </span>{" "}
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

      {modelControls && <div className="mt-2">{modelControls}</div>}

      {/* Input */}
      <form className="mt-2 space-y-3" onSubmit={handleSubmit}>
        {/* Image Upload - only show for vision-capable models */}
        {supportsVision && (
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            disabled={isLoading}
            isOpen={isImageUploadOpen}
            onToggle={() => setIsImageUploadOpen(!isImageUploadOpen)}
          />
        )}

        <div className="relative">
          {/* Image Toggle Icon - only show for vision models */}
          {supportsVision && (
            <button
              type="button"
              onClick={() => setIsImageUploadOpen(!isImageUploadOpen)}
              className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-lg transition-all duration-200 ${
                isImageUploadOpen
                  ? "text-orange-600 bg-orange-100 dark:bg-orange-900/30"
                  : "text-neutral-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              }`}
              title={isImageUploadOpen ? "Close image upload" : "Add images"}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-200"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </button>
          )}
          <textarea
            id="chat-input"
            className={`block caret-orange-600 w-full rounded-xl border-none bg-neutral-200 p-4 pr-20 text-sm text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500 dark:bg-neutral-800 dark:text-neutral-200 sm:text-base resize-y ${
              supportsVision ? "pl-14" : "pl-4"
            }`}
            placeholder={
              supportsVision
                ? "Enter your prompt / add images"
                : "Enter your prompt"
            }
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && images.length === 0)}
            className="absolute bottom-2 right-2.5 rounded-lg px-4 py-2 text-sm font-medium text-neutral-200 bg-orange-600 hover:bg-orange-700 dark:focus:ring-orange-800 sm:text-base flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
    </>
  );
}

function getAvatarUrl(ip: string): string {
  const encodedIp = encodeURIComponent(ip);
  return `https://xvatar.vercel.app/api/avatar/${encodedIp}?rounded=120&size=240&userLogo=true`;
}

export function parseThinkingContent(text: string) {
  const thinkingRegex = /<think>([\s\S]*?)<\/think>/gi;
  const matches = [];
  let match;
  let cleanedText = text;

  while ((match = thinkingRegex.exec(text)) !== null) {
    matches.push({
      type: "reasoning" as const,
      text: match[1].trim(),
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  cleanedText = text.replace(thinkingRegex, "").trim();

  return {
    reasoning: matches.map((m) => m.text),
    cleanText: cleanedText,
    hasReasoning: matches.length > 0,
  };
}
