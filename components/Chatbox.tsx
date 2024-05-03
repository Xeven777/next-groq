"use client";
import { useChat } from "ai/react";
import Image from "next/image";
import sparkles from "@/assets/Sparkle.svg";
import send from "@/assets/send.svg";
import robo from "@/assets/Robo.svg";
import copy from "@/assets/copy.svg";
import userPic from "@/assets/userPic.jpg";
import groqpic from "@/assets/groq.jpg";
import Markdown from "react-markdown";
import { useEffect, useRef } from "react";

const Chatbox = () => {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleSuggestionClick = (suggestion: string) => {
    const event = {
      target: {
        value: suggestion,
      },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    handleInputChange(event);
  };
  return (
    <div className="flex pb-0.5 h-svh w-full flex-col max-w-5xl mx-auto">
      <div className="flex-1 overflow-y-auto rounded-xl bg-neutral-200 p-4 text-sm leading-6 text-neutral-900 dark:bg-neutral-800/60 dark:text-neutral-300 sm:text-base sm:leading-7 border border-orange-600/20 h-full">
        {messages.length > 0 ? (
          messages.map((m) => (
            <div key={m.id} className="whitespace-pre-wrap">
              {m.role === "user" ? (
                <div className="flex flex-row px-2 py-4 sm:px-4">
                  <Image
                    alt="user"
                    placeholder="blur"
                    className="mr-2 flex size-6 md:size-8 rounded-full sm:mr-4"
                    src={userPic}
                    width={32}
                    height={32}
                  />

                  <div className="flex max-w-3xl items-center">
                    <p>{m.content}</p>
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
                    <Markdown>{m.content}</Markdown>
                  </div>
                  <button
                    type="button"
                    title="copy"
                    className="absolute top-2 right-2 p-1 rounded-full bg-orange-500 dark:bg-neutral-800 transition-all active:scale-95 opacity-50 hover:opacity-75"
                    onClick={() => {
                      navigator.clipboard.writeText(m.content);
                      alert("Copied to clipboard");
                    }}
                  >
                    <Image src={copy} alt="copy" width={19} className="" />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-xl md:text-2xl py-20 px-2 font-semibold text-center m-auto text-stone-500 dark:text-stone-400 tracking-wide">
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
              className="hover:scale-110 transition-all duration-500 active:scale-95"
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
            <span>Generating...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Prompt suggestions */}
      <div className="mt-2 flex w-full gap-x-2 overflow-x-auto whitespace-nowrap text-xs text-neutral-600 dark:text-neutral-300 sm:text-sm scrollbar-hide">
        <button
          title="btn"
          onClick={() => handleSuggestionClick("Make it Shorter and simpler.")}
          className="rounded-lg bg-neutral-200 p-2 hover:bg-orange-600 hover:text-neutral-200 dark:bg-neutral-800 dark:hover:bg-orange-600 dark:hover:text-neutral-50 transition-all active:scale-105"
        >
          Make Shorter
        </button>

        <button
          title="btn"
          onClick={() =>
            handleSuggestionClick("Make it longer. explain it nicely")
          }
          className="rounded-lg bg-neutral-200 p-2 hover:bg-orange-600 hover:text-neutral-200 dark:bg-neutral-800 dark:hover:bg-orange-600 dark:hover:text-neutral-50 transition-all active:scale-105"
        >
          Make longer
        </button>
        <button
          title="btn"
          onClick={() =>
            handleSuggestionClick("Write it in a more professional tone.")
          }
          className="rounded-lg bg-neutral-200 p-2 hover:bg-orange-600 hover:text-neutral-200 dark:bg-neutral-800 dark:hover:bg-orange-600 dark:hover:text-neutral-50 transition-all active:scale-105"
        >
          More professional
        </button>
        <button
          title="btn"
          onClick={() =>
            handleSuggestionClick("Write it in a more casual and light tone.")
          }
          className="rounded-lg bg-neutral-200 p-2 hover:bg-orange-600 hover:text-neutral-200 dark:bg-neutral-800 dark:hover:bg-orange-600 dark:hover:text-neutral-50 transition-all active:scale-105"
        >
          More casual
        </button>
        <button
          title="btn"
          onClick={() => handleSuggestionClick("Paraphrase it")}
          className="rounded-lg bg-neutral-200 p-2 hover:bg-orange-600 hover:text-neutral-200 dark:bg-neutral-800 dark:hover:bg-orange-600 dark:hover:text-neutral-50 transition-all active:scale-105"
        >
          Paraphrase
        </button>
      </div>

      <form className="mt-2" onSubmit={handleSubmit}>
        <label htmlFor="chat-input" className="sr-only">
          Enter your prompt
        </label>
        <div className="relative">
          <textarea
            id="chat-input"
            className="block caret-orange-600 w-full resize-none rounded-xl border-none bg-neutral-200 p-4 pl-12 pr-20 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-neutral-800 dark:text-neutral-200 dark:placeholder-neutral-400 dark:focus:ring-orange-500 sm:text-base"
            placeholder="Enter your prompt"
            rows={1}
            value={input}
            required
            onChange={handleInputChange}
          ></textarea>
          <button
            title="submit"
            type="submit"
            disabled={isLoading}
            className="absolute bottom-2 right-2.5 rounded-lg  px-4 py-2 text-sm font-medium text-neutral-200 focus:outline-none focus:ring-4 focus:ring-orange-300 bg-orange-600 hover:bg-orange-700 dark:focus:ring-orange-800 sm:text-base flex items-center gap-2 active:scale-95 transition-all"
          >
            {isLoading ? (
              <>
                Generating
                <Image
                  src={sparkles}
                  alt="#"
                  width={22}
                  className="animate-pulse"
                />
              </>
            ) : (
              <>
                Send <Image src={send} alt="" width={20} />
              </>
            )}
            <span className="sr-only">Send message</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chatbox;
