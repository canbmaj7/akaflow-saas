"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, Send } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { inputClass } from "@/components/ui/field";
import { api } from "@/lib/api/client";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function AssistantPage() {
  const { accessToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Merhaba! Öğrenci, ödeme ve devamsızlık verileriniz hakkında sorular sorabilirsiniz.",
    },
  ]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !question.trim() || loading) return;

    const userQuestion = question.trim();
    setQuestion("");
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
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="inline-flex items-center gap-2 text-2xl font-semibold">
          <Bot className="h-7 w-7" />
          AI Asistan
        </h1>
        <p className="text-sm text-zinc-500">
          Akademi verileriniz üzerinde doğal dil sorguları
        </p>
      </div>

      <Card className="flex min-h-[480px] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-1">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                message.role === "user"
                  ? "ml-auto bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-800"
              }`}
            >
              {message.content}
            </div>
          ))}
          {loading && (
            <p className="text-sm text-zinc-500">Düşünüyor... (10–30 sn sürebilir)</p>
          )}
          <div ref={bottomRef} />
        </div>

        {error && <p className="text-sm text-rose-700">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-4 flex gap-2 border-t pt-4">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Örn: Geciken ödemesi olan öğrenciler kimler?"
            className={`flex-1 ${inputClass}`}
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !question.trim()}>
            <Send className="h-4 w-4" />
            Gönder
          </Button>
        </form>
      </Card>
    </div>
  );
}
