"use client";

import { memo, useCallback, useState, useEffect } from "react";
import { UIMessage } from "ai";
import { models, type Model } from "@/lib/model";
import { ChatSession } from "./ChatSession";
import { ChatHistorySidebar } from "./ChatHistory";
import { useChatHistory } from "@/hooks/useChatHistory";
import { SavedChat } from "@/lib/chat-history";
import { useNotifications } from "./Notification";

const ChatContainer = memo(({ userIp }: { userIp: string }) => {
  const [selectedModel, setSelectedModel] = useState<Model["value"]>(
    "meta-llama/llama-4-scout-17b-16e-instruct"
  );
  const [input, setInput] = useState("");
  const [currentMessages, setCurrentMessages] = useState<UIMessage[]>([]);
  const [chatSessionKey, setChatSessionKey] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Notifications
  const { addNotification, NotificationContainer } = useNotifications();

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
    error,
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

  const handleContinueChat = useCallback(
    (chat: SavedChat) => {
      try {
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
          addNotification("Continuing chat", "success", 3000);
        } else {
          addNotification("Failed to continue chat", "error");
        }
      } catch (err) {
        console.error("Error continuing chat:", err);
        addNotification("Failed to continue chat", "error");
      }
    },
    [
      currentMessages,
      currentChatId,
      selectedModel,
      saveCurrentChat,
      loadChat,
      addNotification,
    ]
  );

  const handleDeleteChat = useCallback(
    async (chatId: string) => {
      try {
        const success = await deleteChat(chatId);
        if (success) {
          addNotification("Chat deleted successfully", "success", 3000);
        } else {
          addNotification("Failed to delete chat", "error");
        }
      } catch (err) {
        console.error("Error deleting chat:", err);
        addNotification("Failed to delete chat", "error");
      }
    },
    [deleteChat, addNotification]
  );

  const handleNewChat = useCallback(() => {
    try {
      // Save current chat if it has messages
      if (currentMessages.length > 0) {
        saveCurrentChat(currentMessages, selectedModel);
        addNotification("Previous chat saved", "info", 3000);
      }

      // Reset to new chat
      setCurrentChatId(null);
      setCurrentMessages([]);
      setInput("");
      disableAutoSave();
      setChatSessionKey((prev) => prev + 1); // Force re-render
      addNotification("Started new chat", "success", 3000);
    } catch (err) {
      console.error("Error starting new chat:", err);
      addNotification("Failed to start new chat", "error");
    }
  }, [
    currentMessages,
    selectedModel,
    saveCurrentChat,
    setCurrentChatId,
    disableAutoSave,
    addNotification,
  ]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // Show error notifications from chat history hook
  useEffect(() => {
    if (error) {
      addNotification(error, "error");
    }
  }, [error]); // Remove addNotification from dependencies to prevent re-renders

  return (
    <>
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
                className="block min-w-44 rounded-xl border-none bg-neutral-200 p-4 text-sm text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500 dark:bg-neutral-800 dark:text-neutral-200 dark:focus:ring-orange-500 sm:text-base"
                value={selectedModel}
                onChange={handleModelChange}
              >
                {models.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>

              <div className="flex gap-2 text-xs text-neutral-600 dark:text-neutral-300 sm:text-sm w-full items justify-between">
                <button
                  type="button"
                  onClick={() =>
                    window.open("https://img-gen7.netlify.app/", "_blank")
                  }
                  className="rounded-lg hover:bg-linear-to-br from-orange-600 to-rose-600 p-2 hover:text-white transition-all active:scale-105 border border-orange-600 font-semibold flex-1"
                >
                  🎨 Image Gen
                </button>{" "}
                {[
                  {
                    label: "Make Shorter",
                    value: "Make it Shorter and simpler.",
                  },
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
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion.value)}
                    className="rounded-lg bg-neutral-200 p-2 hover:bg-orange-600 hover:text-neutral-200 dark:bg-neutral-800 dark:hover:bg-orange-600 dark:hover:text-neutral-50 transition-all active:scale-95 flex-1"
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            </div>
          }
        />
      </div>

      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        chats={chats}
        currentChatId={currentChatId}
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        onContinueChat={handleContinueChat}
        onDeleteChat={handleDeleteChat}
        onNewChat={handleNewChat}
      />

      {/* Notifications */}
      <NotificationContainer />
    </>
  );
});

ChatContainer.displayName = "ChatContainer";

export default ChatContainer;
