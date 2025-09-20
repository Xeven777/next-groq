import { UIMessage } from "ai";

// Types for chat history
export interface SavedChat {
  id: string;
  title: string;
  messages: UIMessage[];
  model: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChatHistoryStorage {
  chats: SavedChat[];
  version: number;
}

// Constants
const STORAGE_KEY = "groq-chat-history";
export const MAX_CHATS = 10;
const STORAGE_VERSION = 1;

// Utility functions
export function generateChatId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateChatTitle(messages: UIMessage[]): string {
  // Find the first user message with text content
  const firstUserMessage = messages.find(
    (msg) =>
      msg.role === "user" && msg.parts?.some((part) => part.type === "text")
  );

  if (!firstUserMessage) {
    return "New Chat";
  }

  // Extract text from the first user message
  const textParts =
    firstUserMessage.parts?.filter((part) => part.type === "text") || [];
  const fullText = textParts
    .map((part) => part.text)
    .join(" ")
    .trim();

  if (!fullText) {
    return "New Chat";
  }

  // Truncate to 50 characters and add ellipsis if needed
  return fullText.length > 50 ? `${fullText.substring(0, 50)}...` : fullText;
}

// localStorage operations with error handling
export class ChatHistoryManager {
  private static instance: ChatHistoryManager;

  static getInstance(): ChatHistoryManager {
    if (!ChatHistoryManager.instance) {
      ChatHistoryManager.instance = new ChatHistoryManager();
    }
    return ChatHistoryManager.instance;
  }

  private isLocalStorageAvailable(): boolean {
    try {
      const test = "__localStorage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private getStorageData(): ChatHistoryStorage {
    if (!this.isLocalStorageAvailable()) {
      return { chats: [], version: STORAGE_VERSION };
    }

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return { chats: [], version: STORAGE_VERSION };
      }

      const parsed = JSON.parse(data) as ChatHistoryStorage;

      // Handle version migration if needed
      if (parsed.version !== STORAGE_VERSION) {
        console.warn("Chat history version mismatch, resetting storage");
        return { chats: [], version: STORAGE_VERSION };
      }

      // Validate the data structure
      if (!Array.isArray(parsed.chats)) {
        console.warn("Invalid chat history data, resetting storage");
        return { chats: [], version: STORAGE_VERSION };
      }

      return parsed;
    } catch (error) {
      console.error("Failed to parse chat history from localStorage:", error);
      return { chats: [], version: STORAGE_VERSION };
    }
  }

  private saveStorageData(data: ChatHistoryStorage): boolean {
    if (!this.isLocalStorageAvailable()) {
      console.warn("localStorage is not available");
      return false;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Failed to save chat history to localStorage:", error);

      // Handle quota exceeded error
      if (error instanceof Error && error.name === "QuotaExceededError") {
        console.warn("localStorage quota exceeded, attempting to free space");
        this.clearOldestChats(2); // Remove 2 oldest chats and try again
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          return true;
        } catch {
          console.error("Still failed to save after clearing space");
          return false;
        }
      }

      return false;
    }
  }

  getAllChats(): SavedChat[] {
    const data = this.getStorageData();
    return data.chats.sort((a, b) => b.updatedAt - a.updatedAt); // Most recent first
  }

  getChatById(id: string): SavedChat | null {
    const chats = this.getAllChats();
    return chats.find((chat) => chat.id === id) || null;
  }

  saveChat(
    chat: Omit<SavedChat, "id" | "createdAt" | "updatedAt">
  ): SavedChat | null {
    // Don't save empty chats
    if (!chat.messages || chat.messages.length === 0) {
      return null;
    }

    const now = Date.now();
    const newChat: SavedChat = {
      ...chat,
      id: generateChatId(),
      title: chat.title || generateChatTitle(chat.messages),
      createdAt: now,
      updatedAt: now,
    };

    const data = this.getStorageData();
    data.chats.unshift(newChat); // Add to beginning

    // Keep only the most recent MAX_CHATS
    if (data.chats.length > MAX_CHATS) {
      data.chats = data.chats.slice(0, MAX_CHATS);
    }

    const success = this.saveStorageData(data);
    return success ? newChat : null;
  }

  updateChat(
    id: string,
    updates: Partial<Pick<SavedChat, "title" | "messages" | "model">>
  ): boolean {
    const data = this.getStorageData();
    const chatIndex = data.chats.findIndex((chat) => chat.id === id);

    if (chatIndex === -1) {
      return false;
    }

    data.chats[chatIndex] = {
      ...data.chats[chatIndex],
      ...updates,
      updatedAt: Date.now(),
    };

    return this.saveStorageData(data);
  }

  deleteChat(id: string): boolean {
    const data = this.getStorageData();
    const initialLength = data.chats.length;
    data.chats = data.chats.filter((chat) => chat.id !== id);

    if (data.chats.length === initialLength) {
      return false; // Chat not found
    }

    return this.saveStorageData(data);
  }

  clearAllChats(): boolean {
    const data: ChatHistoryStorage = { chats: [], version: STORAGE_VERSION };
    return this.saveStorageData(data);
  }

  private clearOldestChats(count: number): void {
    const data = this.getStorageData();
    const sortedChats = data.chats.sort((a, b) => a.updatedAt - b.updatedAt); // Oldest first
    data.chats = sortedChats.slice(count); // Remove the oldest 'count' chats
    this.saveStorageData(data);
  }

  // Get storage usage info
  getStorageInfo(): { used: number; available: boolean } {
    if (!this.isLocalStorageAvailable()) {
      return { used: 0, available: false };
    }

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const used = data ? new Blob([data]).size : 0;
      return { used, available: true };
    } catch {
      return { used: 0, available: false };
    }
  }
}

// Export singleton instance
export const chatHistoryManager = ChatHistoryManager.getInstance();
