"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, RotateCcw, Send } from "lucide-react";
import { useAssistant } from "@/components/assistant-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { inputClass } from "@/components/ui/field";

export default function AssistantPage() {
  const { messages, loading, error, sendMessage, resetChat } = useAssistant();
  const [question, setQuestion] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!question.trim() || loading) return;

    const userQuestion = question.trim();
    setQuestion("");
    await sendMessage(userQuestion);
  }

  function handleReset() {
    if (
      messages.length <= 1 ||
      window.confirm("Sohbet geçmişi silinsin mi?")
    ) {
      resetChat();
      setQuestion("");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="inline-flex items-center gap-2 text-2xl font-semibold">
            <Bot className="h-7 w-7" />
            AI Asistan
          </h1>
          <p className="text-sm text-zinc-500">
            Akademi verileriniz üzerinde doğal dil sorguları
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="shrink-0"
          onClick={handleReset}
          disabled={loading}
        >
          <RotateCcw className="h-4 w-4" />
          Sohbeti sıfırla
        </Button>
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
