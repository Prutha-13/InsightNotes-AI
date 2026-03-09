"use client";

import { useState, useCallback } from "react";

export type AIAction = "summarize" | "action-items" | "improve" | "tags";

interface AIState {
  isLoading: boolean;
  currentAction: AIAction | null;
  error: string | null;
}

interface AIResults {
  summary: string | null;
  actionItems: string[] | null;
  improvedContent: string | null;
  tags: string[] | null;
}

export function useAI() {
  const [state, setState] = useState<AIState>({
    isLoading: false,
    currentAction: null,
    error: null,
  });

  const [results, setResults] = useState<AIResults>({
    summary: null,
    actionItems: null,
    improvedContent: null,
    tags: null,
  });

  const runAIAction = useCallback(
    async (action: AIAction, content: string, noteId?: string) => {
      if (!content.trim()) {
        setState((prev) => ({ ...prev, error: "Write something in your note first!" }));
        return null;
      }

      setState({ isLoading: true, currentAction: action, error: null });

      try {
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, content, noteId }),
        });

        const data = await response.json();

        if (!data.success || data.result == null) {
          throw new Error(data.error ?? "AI returned no result");
        }

        setResults((prev) => {
          switch (action) {
            case "summarize":
              return { ...prev, summary: data.result as string };
            case "action-items":
              return { ...prev, actionItems: data.result as string[] };
            case "improve":
              return { ...prev, improvedContent: data.result as string };
            case "tags":
              return { ...prev, tags: data.result as string[] };
            default:
              return prev;
          }
        });

        setState({ isLoading: false, currentAction: null, error: null });
        return data.result;
      } catch (error) {
        const message = error instanceof Error ? error.message : "AI action failed";
        setState({ isLoading: false, currentAction: null, error: message });
        return null;
      }
    },
    []
  );

  const clearResults = useCallback(() => {
    setResults({ summary: null, actionItems: null, improvedContent: null, tags: null });
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    isLoading: state.isLoading,
    currentAction: state.currentAction,
    error: state.error,
    ...results,
    summarize: (content: string, noteId?: string) => runAIAction("summarize", content, noteId),
    extractActionItems: (content: string, noteId?: string) => runAIAction("action-items", content, noteId),
    improveWriting: (content: string, noteId?: string) => runAIAction("improve", content, noteId),
    generateTags: (content: string, noteId?: string) => runAIAction("tags", content, noteId),
    clearResults,
    clearError,
  };
}