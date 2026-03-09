"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAI } from "@/hooks/useAI";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { Note } from "@/types";

const CATEGORIES = [
  { value: "personal", label: "👤 Personal", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  { value: "work", label: "💼 Work", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  { value: "learning", label: "📚 Learning", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  { value: "ideas", label: "💡 Ideas", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  { value: "meetings", label: "🗓️ Meetings", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  { value: "other", label: "📌 Other", color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" },
];

interface NoteEditorProps {
  note: Note | null;
  onSave: (title: string, content: string, category?: string) => Promise<void>;
  onCancel: () => void;
  onUpdate: (noteId: string, updates: Partial<Pick<Note, "title" | "content" | "summary" | "actionItems" | "category">>) => Promise<void>;
}

export default function NoteEditor({ note, onSave, onCancel, onUpdate }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [category, setCategory] = useState(note?.category ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const ai = useAI();
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const wordCount = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;
  const charCount = content.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Voice recording — appends transcript to content
  const { isRecording, isSupported: voiceSupported, startRecording, stopRecording } = useVoiceRecording(
    useCallback((text: string) => {
      setContent((prev) => {
        const trimmed = prev.trimEnd();
        return trimmed ? trimmed + " " + text : text;
      });
    }, [])
  );

  useEffect(() => {
    setTitle(note?.title ?? "");
    setContent(note?.content ?? "");
    setCategory(note?.category ?? "");
    setShareUrl(null);
    ai.clearResults();
    setSaveError(null);
    setSaveSuccess(false);
    setAutoSaveStatus("idle");
    isFirstRender.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.id]);

  // Auto-save
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (!note?.id) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setAutoSaveStatus("saving");
    autoSaveTimer.current = setTimeout(async () => {
      try {
        await onSave(title, content, category);
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 2000);
      } catch { setAutoSaveStatus("idle"); }
    }, 2000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, category]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); handleSave(); }
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, category]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await onSave(title, content, category);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch { setSaveError("Failed to save. Please try again."); }
    finally { setIsSaving(false); }
  }, [title, content, category, onSave]);

  const handleCategoryChange = async (val: string) => {
    setCategory(val);
    if (note?.id) await onUpdate(note.id, { category: val });
  };

  const handleSummarize = async () => {
    const result = await ai.summarize(content, note?.id);
    if (result && note?.id) await onUpdate(note.id, { summary: result as string });
  };
  const handleActionItems = async () => {
    const result = await ai.extractActionItems(content, note?.id);
    if (Array.isArray(result) && note?.id) await onUpdate(note.id, { actionItems: result });
  };
  const handleImprove = async () => {
    const improved = await ai.improveWriting(content, note?.id);
    if (improved && typeof improved === "string") {
      setContent(improved);
      if (note?.id) await onUpdate(note.id, { content: improved });
    }
  };
  const handleTags = () => ai.generateTags(content, note?.id);

  // Share note
  const handleShare = () => {
    if (!note?.id) return;
    const url = `${window.location.origin}/note/${note.id}`;
    setShareUrl(url);
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

  // Export PDF using browser print
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const categoryLabel = CATEGORIES.find(c => c.value === category)?.label ?? "";
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title || "Note"}</title>
          <style>
            body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; }
            h1 { font-size: 28px; margin-bottom: 8px; }
            .meta { color: #666; font-size: 13px; margin-bottom: 24px; border-bottom: 1px solid #eee; padding-bottom: 16px; }
            .content { font-size: 15px; line-height: 1.8; white-space: pre-wrap; }
            .section { margin-top: 28px; padding: 16px; border-radius: 8px; }
            .summary { background: #f5f0ff; border: 1px solid #ddd6fe; }
            .actions { background: #f0fdf4; border: 1px solid #bbf7d0; }
            .section h2 { font-size: 14px; font-weight: 600; margin: 0 0 10px 0; }
            .tags { margin-top: 20px; }
            .tag { display: inline-block; background: #dbeafe; color: #1d4ed8; padding: 2px 10px; border-radius: 999px; font-size: 12px; margin: 2px; }
            .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 16px; }
          </style>
        </head>
        <body>
          <h1>${title || "Untitled Note"}</h1>
          <div class="meta">
            ${categoryLabel ? `Category: ${categoryLabel} &nbsp;·&nbsp; ` : ""}
            ${wordCount} words &nbsp;·&nbsp; ${readingTime} min read &nbsp;·&nbsp;
            Exported ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </div>
          <div class="content">${content}</div>
          ${ai.summary ? `<div class="section summary"><h2>✨ AI Summary</h2><p>${ai.summary}</p></div>` : ""}
          ${ai.actionItems && ai.actionItems.length > 0 ? `<div class="section actions"><h2>✅ Action Items</h2><ul>${ai.actionItems.map(i => `<li>${i}</li>`).join("")}</ul></div>` : ""}
          ${ai.tags && ai.tags.length > 0 ? `<div class="tags">${ai.tags.map(t => `<span class="tag">#${t}</span>`).join("")}</div>` : ""}
          <div class="footer">Created with InsightNotes AI</div>
        </body>
        </html>
      `;
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(printContent);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); }, 500);
      }
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title..."
          className="text-xl font-bold bg-transparent border-none outline-none w-full text-gray-900 dark:text-white placeholder-gray-400" />
        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
          {autoSaveStatus === "saving" && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <span className="animate-spin inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full" />
              Auto-saving…
            </span>
          )}
          {autoSaveStatus === "saved" && <span className="text-xs text-green-500 font-medium">✓ Auto-saved</span>}
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm transition-colors">✕ Close</button>
        </div>
      </div>

      {/* Category */}
      <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Category:</span>
        <button onClick={() => handleCategoryChange("")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${category === "" ? "bg-gray-800 text-white border-gray-800 dark:bg-white dark:text-gray-800" : "bg-transparent text-gray-500 border-gray-300 hover:border-gray-500 dark:text-gray-400 dark:border-gray-600"}`}>
          None
        </button>
        {CATEGORIES.map((cat) => (
          <button key={cat.value} onClick={() => handleCategoryChange(cat.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${category === cat.value ? cat.color + " ring-2 ring-offset-1 ring-current" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"}`}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Toolbar: AI + Voice + Export + Share */}
      <div className="flex gap-2 flex-wrap px-6 py-3 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700 items-center">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-1">AI:</span>
        {[
          { action: "summarize", label: "✨ Summarize", fn: handleSummarize },
          { action: "action-items", label: "✅ Action Items", fn: handleActionItems },
          { action: "improve", label: "✍️ Improve", fn: handleImprove },
          { action: "tags", label: "🏷️ Tags", fn: handleTags },
        ].map(({ action, label, fn }) => (
          <button key={action} onClick={fn} disabled={ai.isLoading}
            className="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/40 dark:hover:bg-purple-900/60 disabled:opacity-50 text-purple-800 dark:text-purple-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5">
            {ai.isLoading && ai.currentAction === action
              ? <><span className="animate-spin w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full inline-block" />Processing…</>
              : label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          {/* Voice button */}
          {voiceSupported && (
            <button onClick={isRecording ? stopRecording : startRecording}
              title={isRecording ? "Stop recording" : "Start voice recording"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isRecording
                  ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 animate-pulse"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              }`}>
              {isRecording ? (
                <><span className="w-2 h-2 bg-red-500 rounded-full inline-block" />Stop</>
              ) : (
                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
                </svg>Voice</>
              )}
            </button>
          )}

          {/* Export PDF */}
          <button onClick={handleExportPdf} disabled={isExportingPdf} title="Export as PDF"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50">
            {isExportingPdf ? "…" : <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>PDF</>}
          </button>

          {/* Share */}
          {note?.id && (
            <button onClick={handleShare} title="Copy shareable link"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {shareCopied ? "Copied!" : "Share"}
            </button>
          )}
        </div>
      </div>

      {/* Share URL banner */}
      {shareUrl && (
        <div className="mx-6 mt-3 flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg px-4 py-2">
          <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span className="text-xs text-blue-700 dark:text-blue-300 flex-1 truncate">{shareUrl}</span>
          <button onClick={() => setShareUrl(null)} className="text-blue-400 hover:text-blue-600 text-xs">✕</button>
        </div>
      )}

      {/* Voice recording indicator */}
      {isRecording && (
        <div className="mx-6 mt-3 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-4 py-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping inline-block" />
          <span className="text-xs text-red-700 dark:text-red-300 font-medium">Recording… speak now. Click Stop when done.</span>
        </div>
      )}

      {/* AI Error */}
      {ai.error && (
        <div className="mx-6 mt-3 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex justify-between">
          <span>{ai.error}</span>
          <button onClick={ai.clearError} className="font-bold hover:text-red-900">×</button>
        </div>
      )}

      {/* AI Results */}
      <div className="px-6 space-y-2 mt-3">
        {ai.summary && (
          <AICard title="✨ Summary" onDismiss={ai.clearResults}>
            <p className="text-sm text-gray-700 dark:text-gray-300">{ai.summary}</p>
          </AICard>
        )}
        {ai.actionItems && ai.actionItems.length > 0 && (
          <AICard title="✅ Action Items" onDismiss={ai.clearResults}>
            <ul className="list-disc list-inside space-y-1">
              {ai.actionItems.map((item, i) => <li key={i} className="text-sm text-gray-700 dark:text-gray-300">{item}</li>)}
            </ul>
          </AICard>
        )}
        {ai.tags && ai.tags.length > 0 && (
          <AICard title="🏷️ Tags" onDismiss={ai.clearResults}>
            <div className="flex flex-wrap gap-2">
              {ai.tags.map((tag) => (
                <span key={tag} className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium">#{tag}</span>
              ))}
            </div>
          </AICard>
        )}
      </div>

      {/* Textarea */}
      <div className="flex-1 px-6 py-4">
        <textarea value={content} onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing… or click 🎤 Voice to dictate. (Ctrl+S save · Esc close)"
          className="w-full h-full resize-none bg-transparent outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 text-base leading-relaxed min-h-[280px]" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={isSaving}
            className={`px-6 py-2 rounded-lg font-medium transition-colors text-white disabled:opacity-60 ${saveSuccess ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"}`}>
            {isSaving ? "Saving…" : saveSuccess ? "✓ Saved!" : note ? "Save Changes" : "Create Note"}
          </button>
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Cancel</button>
          {saveError && <span className="text-red-500 text-sm">{saveError}</span>}
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
          <span>{wordCount} words · {charCount} chars · {readingTime} min read</span>
          <span className="hidden sm:block opacity-60">Ctrl+S · Esc</span>
        </div>
      </div>
    </div>
  );
}

function AICard({ title, children, onDismiss }: { title: string; children: React.ReactNode; onDismiss: () => void }) {
  return (
    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-semibold text-purple-800 dark:text-purple-300">{title}</h3>
        <button onClick={onDismiss} className="text-purple-400 hover:text-purple-700 text-xs">Dismiss</button>
      </div>
      {children}
    </div>
  );
}