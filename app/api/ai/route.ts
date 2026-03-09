import { NextRequest, NextResponse } from "next/server";
import {
  summarizeNote,
  extractActionItems,
  improveWriting,
  generateTags,
  askAboutNotes,
} from "@/lib/gemini";
import { Note } from "@/types";

export type AIAction = "summarize" | "action-items" | "improve" | "tags" | "ask-notes";

interface AIRequest {
  action: AIAction;
  content?: string;
  noteId?: string;
  // For ask-notes
  question?: string;
  notes?: Note[];
}

interface AIResponse {
  success: boolean;
  action: AIAction;
  result?: string | string[];
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<AIResponse>> {
  let action: AIAction = "summarize";

  try {
    const body: AIRequest = await request.json();
    action = body.action;

    // --- ask-notes: special path for AIChat ---
    if (action === "ask-notes") {
      const { question, notes } = body;

      if (!question?.trim()) {
        return NextResponse.json(
          { success: false, action, error: "Question is required" },
          { status: 400 }
        );
      }

      const notesContext =
        notes && notes.length > 0
          ? notes
              .map((n) => `Title: ${n.title}\nContent: ${n.content}`)
              .join("\n\n---\n\n")
          : "No notes available.";

      const result = await askAboutNotes(question, notesContext);
      return NextResponse.json({ success: true, action, result });
    }

    // --- Standard AI actions ---
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, action, error: "Note content is required" },
        { status: 400 }
      );
    }

    if (content.trim().length < 20) {
      return NextResponse.json(
        { success: false, action, error: "Note is too short for AI processing" },
        { status: 400 }
      );
    }

    let result: string | string[];

    switch (action) {
      case "summarize":
        result = await summarizeNote(content);
        break;
      case "action-items":
        result = await extractActionItems(content);
        break;
      case "improve":
        result = await improveWriting(content);
        break;
      case "tags":
        result = await generateTags(content);
        break;
      default:
        return NextResponse.json(
          { success: false, action, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, action, result });
  } catch (error) {
    console.error(`[AI Route] Error for action "${action}":`, error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const clientMessage =
      process.env.NODE_ENV === "development"
        ? message
        : "AI processing failed. Please try again.";

    return NextResponse.json(
      { success: false, action, error: clientMessage },
      { status: 500 }
    );
  }
}