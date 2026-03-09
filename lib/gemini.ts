// lib/gemini.ts - using Groq (free, fast, no credit card needed)

const GROQ_API_KEY = process.env.GROQ_API_KEY!;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

interface GroqResponse {
  choices?: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
    type: string;
  };
}

export async function callAI(prompt: string): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables");
  }

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  const data: GroqResponse = await response.json();

  if (!response.ok || data.error) {
    const errMsg = data.error?.message ?? `HTTP ${response.status}`;
    throw new Error(`Groq API error: ${errMsg}`);
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("Groq returned an empty response");
  }

  return text.trim();
}

export async function summarizeNote(content: string): Promise<string> {
  return callAI(
    `Summarize the following note in 2-3 concise sentences. Focus on the key ideas.\n\nNote:\n${content}\n\nSummary:`
  );
}

export async function extractActionItems(content: string): Promise<string[]> {
  const result = await callAI(
    `Extract all action items and tasks from the following note.
Return them as a numbered list, one per line. If there are no action items, return "No action items found."

Note:
${content}

Action Items:`
  );

  return result
    .split("\n")
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    .filter((line) => line.length > 0 && line !== "No action items found.");
}

export async function improveWriting(content: string): Promise<string> {
  return callAI(
    `Improve the writing of the following note. Make it clearer, more concise, and better structured.
Preserve all the original meaning and information. Return only the improved text, no explanations.

Original Note:
${content}

Improved Note:`
  );
}

export async function generateTags(content: string): Promise<string[]> {
  const result = await callAI(
    `Generate 3-6 relevant tags for the following note.
Return only the tags as a comma-separated list (e.g., "productivity, meetings, Q1 planning").
No hashtags, no explanations, just the comma-separated tags.

Note:
${content}

Tags:`
  );

  return result
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0);
}

export async function askAboutNotes(
  question: string,
  notesContext: string
): Promise<string> {
  return callAI(
    `You are a helpful assistant for a note-taking app. Answer the user's question based on their notes.

User's Notes:
${notesContext}

Question: ${question}

Answer:`
  );
}