"use client";

import { memo, useState } from "react";
import { SavedChat } from "@/lib/chat-history";
import { UIMessage } from "ai";
import { getModelByValue } from "@/lib/model";

// Generate display title from messages
function getDisplayTitle(messages: UIMessage[]): string {
  const firstUserMessage = messages.find(
    (msg) =>
      msg.role === "user" && msg.parts?.some((part) => part.type === "text")
  );

  if (!firstUserMessage) {
    return "New Chat";
  }

  const textParts =
    firstUserMessage.parts?.filter((part) => part.type === "text") || [];
  const fullText = textParts
    .map((part) => part.text)
    .join(" ")
    .trim();

  if (!fullText) {
    return "New Chat";
  }

  // Use first 5 words for title
  const words = fullText.split(/\s+/).filter((word) => word.length > 0);
  const titleWords = words.slice(0, 5);
  const title = titleWords.join(" ");

  // Add ellipsis if there are more words
  return words.length > 5 ? `${title}...` : title;
}

interface ChatHistoryItemProps {
  chat: SavedChat;
  isActive?: boolean;
  onContinue: (chat: SavedChat) => void;
  onDelete: (chatId: string) => void;
}

export const ChatHistoryItem = memo(function ChatHistoryItem({
  chat,
  isActive = false,
  onContinue,
  onDelete,
}: ChatHistoryItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const model = getModelByValue(chat.model);
  const modelLabel = model?.label || chat.model;
  const displayTitle = getDisplayTitle(chat.messages);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Recently";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(chat.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div
      className={`group relative p-3 rounded-lg border transition-all duration-200 ${
        isActive
          ? "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700/50"
          : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100 dark:bg-neutral-800/50 dark:border-neutral-700 dark:hover:bg-neutral-700/50"
      }`}
    >
      {/* Chat Title */}
      <div className="mb-2">
        <h3
          className={`text-sm font-medium line-clamp-2 ${
            isActive
              ? "text-orange-900 dark:text-orange-100"
              : "text-neutral-900 dark:text-neutral-100"
          }`}
          title={displayTitle}
        >
          {displayTitle}
        </h3>
      </div>

      {/* Model Badge */}
      <div className="mb-2">
        <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] md:text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-700/50 dark:text-neutral-300">
          {modelLabel}
        </span>
      </div>

      {/* Timestamp and Message Count */}
      <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-3 text-xs">
        <span>{formatDate(chat.updatedAt)}</span>
        <span>{chat.messages.length} messages</span>
      </div>

      {/* Action Buttons */}
      {showDeleteConfirm ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDelete}
            className="flex-1 px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
            aria-label={`Confirm delete chat: ${displayTitle}`}
          >
            Confirm Delete
          </button>
          <button
            type="button"
            onClick={handleCancelDelete}
            className="flex-1 px-2 py-1 text-xs font-medium text-neutral-600 bg-neutral-200 hover:bg-neutral-300 dark:text-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-1"
            aria-label="Cancel delete"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onContinue(chat)}
            className="flex-1 px-2 py-1 text-xs font-medium text-orange-600 bg-orange-100 hover:bg-orange-200 dark:text-orange-400 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
            title="Continue chat"
            aria-label={`Continue chat: ${displayTitle}`}
          >
            Continue
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 hover:bg-red-200 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
            title="Delete chat"
            aria-label={`Delete chat: ${displayTitle}`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
});
