"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api/client";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Merhaba! Öğrenci, ödeme ve devamsızlık verileriniz hakkında sorular sorabilirsiniz.",
  },
];

function storageKey(userId: string) {
  return `akaflow-assistant-chat-${userId}`;
}

type AssistantContextValue = {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (question: string) => Promise<void>;
  resetChat: () => void;
};

const AssistantContext = createContext<AssistantContextValue | null>(null);

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, session } = useAuth();
  const userId = session?.user?.id ?? null;
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!userId) {
      setMessages(INITIAL_MESSAGES);
      setHydrated(true);
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey(userId));
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // Bozuk kayıt — varsayılan mesajla devam et
    }
    setHydrated(true);
  }, [userId]);

  useEffect(() => {
    if (!hydrated || !userId) return;
    localStorage.setItem(storageKey(userId), JSON.stringify(messages));
  }, [messages, hydrated, userId]);

  const resetChat = useCallback(() => {
    setMessages(INITIAL_MESSAGES);
    setError(null);
    if (userId) {
      localStorage.removeItem(storageKey(userId));
    }
  }, [userId]);

  const sendMessage = useCallback(
    async (question: string) => {
      if (!accessToken || !question.trim() || loading) return;

      const userQuestion = question.trim();
      setError(null);
      setMessages((prev) => [...prev, { role: "user", content: userQuestion }]);
      setLoading(true);

      try {
        const response = await api.askAgent(accessToken, userQuestion);
        setMessages((prev) => [...prev, { role: "assistant", content: response.answer }]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Yanıt alınamadı");
      } finally {
        setLoading(false);
      }
    },
    [accessToken, loading],
  );

  const value = useMemo(
    () => ({ messages, loading, error, sendMessage, resetChat }),
    [messages, loading, error, sendMessage, resetChat],
  );

  return (
    <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>
  );
}

export function useAssistant() {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error("useAssistant yalnızca AssistantProvider içinde kullanılabilir");
  }
  return context;
}
