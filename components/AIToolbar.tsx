"use client";

import { useState } from "react";

interface Props {
  noteContent: string;
  onSummary: (summary: string) => void;
  onActionItems: (items: string) => void;
  onImprove: (improved: string) => void;
  onTags?: (tags: string[]) => void;
  disabled?: boolean;
}

type AIAction = "summarize" | "action-items" | "improve" | "tags";

export default function AIToolbar({
  noteContent,
  onSummary,
  onActionItems,
  onImprove,
  onTags,
  disabled,
}: Props) {
  const [loading, setLoading] = useState<AIAction | null>(null);

  const handleAIAction = async (action: AIAction) => {
    if (!noteContent.trim()) return;

    setLoading(action);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, content: noteContent }),
      });

      const data = await res.json();

      if (!data.success || data.result == null) {
        console.error("AI error:", data.error);
        return;
      }

      if (action === "summarize") onSummary(data.result as string);
      if (action === "action-items") onActionItems(
        Array.isArray(data.result) ? data.result.join("\n") : data.result
      );
      if (action === "improve") onImprove(data.result as string);
      if (action === "tags" && onTags) onTags(data.result as string[]);
    } catch (err) {
      console.error("AI request error:", err);
    } finally {
      setLoading(null);
    }
  };

  const isDisabled = disabled || !noteContent.trim() || loading !== null;

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <span className="text-xs font-medium text-gray-600 dark:text-gray-300 self-center">
        AI Actions:
      </span>

      {(
        [
          { action: "summarize" as AIAction, emoji: "✨", label: "Summarize", color: "bg-purple-500 hover:bg-purple-600" },
          { action: "action-items" as AIAction, emoji: "📋", label: "Action Items", color: "bg-green-500 hover:bg-green-600" },
          { action: "tags" as AIAction, emoji: "🏷️", label: "Generate Tags", color: "bg-indigo-500 hover:bg-indigo-600" },
          { action: "improve" as AIAction, emoji: "✍️", label: "Improve", color: "bg-blue-500 hover:bg-blue-600" },
        ] as const
      ).map(({ action, emoji, label, color }) => (
        <button
          key={action}
          onClick={() => handleAIAction(action)}
          disabled={isDisabled}
          className={`px-3 py-1.5 text-sm text-white rounded-lg disabled:opacity-50 transition-colors ${color}`}
        >
          {loading === action ? "⏳" : emoji} {label}
        </button>
      ))}
    </div>
  );
}