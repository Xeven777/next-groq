"use client";
import { memo, useCallback, useState, useEffect } from "react";
import { UIMessage } from "ai";
import { models, type Model } from "@/lib/model";
import { ChatSession } from "./ChatSession";
import { useChatHistory } from "@/hooks/useChatHistory";
import { SavedChat } from "@/lib/chat-history";

const Chatbox = memo(({ userIp }: { userIp: string }) => {
  const [selectedModel, setSelectedModel] = useState<Model["value"]>(
    "meta-llama/llama-4-scout-17b-16e-instruct"
  );
  const [input, setInput] = useState("");
  const [currentMessages, setCurrentMessages] = useState<UIMessage[]>([]);
  const [chatSessionKey, setChatSessionKey] = useState(0);

  // Chat history hook
  const {
    chats,
    currentChatId,
    saveCurrentChat,
    loadChat,
    deleteChat,
    setCurrentChatId,
    enableAutoSave,
    disableAutoSave,
  } = useChatHistory();

  const handleModelChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      // Save current chat before changing model
      if (currentMessages.length > 0) {
        saveCurrentChat(currentMessages, selectedModel);
      }
      setSelectedModel(event.target.value);
      setCurrentChatId(null); // Reset to new chat
      setChatSessionKey((prev) => prev + 1); // Force re-render
    },
    [currentMessages, selectedModel, saveCurrentChat, setCurrentChatId]
  );

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion);
  }, []);

  // Handle messages change from ChatSession
  const handleMessagesChange = useCallback(
    (messages: UIMessage[]) => {
      setCurrentMessages(messages);
      // Enable auto-save for current chat
      enableAutoSave(messages, selectedModel);
    },
    [enableAutoSave, selectedModel]
  );

  // Chat history handlers
  const handleOpenChat = useCallback(
    (chat: SavedChat) => {
      // Save current chat if it has messages
      if (currentMessages.length > 0 && !currentChatId) {
        saveCurrentChat(currentMessages, selectedModel);
      }

      // Load the selected chat
      const loadedChat = loadChat(chat.id);
      if (loadedChat) {
        setSelectedModel(loadedChat.model);
        setCurrentMessages(loadedChat.messages);
        setChatSessionKey((prev) => prev + 1); // Force re-render with new messages
      }
    },
    [currentMessages, currentChatId, selectedModel, saveCurrentChat, loadChat]
  );

  const handleContinueChat = useCallback(
    (chat: SavedChat) => {
      // Save current chat if it has messages
      if (currentMessages.length > 0 && !currentChatId) {
        saveCurrentChat(currentMessages, selectedModel);
      }

      // Load the selected chat for continuation
      const loadedChat = loadChat(chat.id);
      if (loadedChat) {
        setSelectedModel(loadedChat.model);
        setCurrentMessages(loadedChat.messages);
        setChatSessionKey((prev) => prev + 1); // Force re-render with new messages
      }
    },
    [currentMessages, currentChatId, selectedModel, saveCurrentChat, loadChat]
  );

  const handleDeleteChat = useCallback(
    (chatId: string) => {
      deleteChat(chatId);
    },
    [deleteChat]
  );

  const handleNewChat = useCallback(() => {
    // Save current chat if it has messages
    if (currentMessages.length > 0) {
      saveCurrentChat(currentMessages, selectedModel);
    }

    // Reset to new chat
    setCurrentChatId(null);
    setCurrentMessages([]);
    setInput("");
    disableAutoSave();
    setChatSessionKey((prev) => prev + 1); // Force re-render
  }, [
    currentMessages,
    selectedModel,
    saveCurrentChat,
    setCurrentChatId,
    disableAutoSave,
  ]);

  return (
    <div className="flex pb-0.5 h-svh w-full flex-col max-w-5xl mx-auto">
      {/* Chat Session */}
      <ChatSession
        key={`${selectedModel}-${chatSessionKey}`}
        model={selectedModel}
        userIp={userIp}
        input={input}
        setInput={setInput}
        initialMessages={currentMessages}
        onMessagesChange={handleMessagesChange}
        modelControls={
          <div className="flex w-full gap-x-2 overflow-x-auto whitespace-nowrap text-xs text-neutral-600 dark:text-neutral-300 sm:text-sm scrollbar-hide shrink-0">
            <select
              name="model"
              title="Select Model"
              id="model-select"
              className="block w-32 min-w-44 rounded-xl border-none bg-neutral-200 p-4 text-sm text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500 dark:bg-neutral-800 dark:text-neutral-200 dark:focus:ring-orange-500 sm:text-base"
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
              onClick={() =>
                window.open("https://img-gen7.netlify.app/", "_blank")
              }
              className="rounded-lg hover:bg-linear-to-br from-orange-600 to-rose-600 p-2 hover:text-white transition-all active:scale-105 border border-orange-600 font-semibold"
            >
              Generate Image ✨
            </button>
            {[
              { label: "Make Shorter", value: "Make it Shorter and simpler." },
              {
                label: "Make Longer",
                value: "Make it longer. explain it nicely",
              },
              {
                label: "More Professional",
                value: "Write it in a more professional tone.",
              },
              {
                label: "More Casual",
                value: "Write it in a more casual and light tone.",
              },
              { label: "Paraphrase", value: "Paraphrase it" },
            ].map((suggestion) => (
              <button
                key={suggestion.label}
                onClick={() => handleSuggestionClick(suggestion.value)}
                className="rounded-lg bg-neutral-200 p-2 hover:bg-orange-600 hover:text-neutral-200 dark:bg-neutral-800 dark:hover:bg-orange-600 dark:hover:text-neutral-50 transition-all active:scale-105"
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        }
      />
    </div>
  );
});

export default Chatbox;
