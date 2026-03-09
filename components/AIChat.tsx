"use client";

import { useState } from "react";
import { Note } from "@/types";

interface Props {
  notes: Note[];
}

export default function AIChat({ notes }: Props) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ask-notes",
          question,
          notes,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error ?? "Failed to get answer");
      }

      setAnswer(data.result ?? "No answer returned.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAsk();
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-1.5">
        <span>💬</span> Ask about your notes
      </h3>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="e.g. What tasks are pending?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400 outline-none"
        />
        <button
          onClick={handleAsk}
          disabled={loading || !question.trim()}
          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? (
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            "Ask"
          )}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}

      {answer && (
        <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}