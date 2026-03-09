"use client";

import { Note } from "@/types";
import { Timestamp } from "firebase/firestore";

const CATEGORY_STYLES: Record<string, { label: string; color: string }> = {
  personal: { label: "👤 Personal", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  work: { label: "💼 Work", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  learning: { label: "📚 Learning", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  ideas: { label: "💡 Ideas", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  meetings: { label: "🗓️ Meetings", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  other: { label: "📌 Other", color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" },
};

interface NotesListProps {
  notes: Note[];
  selectedNote: Note | null;
  onSelect: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onTogglePin: (noteId: string, pinned: boolean) => void;
  loading: boolean;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function NotesList({ notes, selectedNote, onSelect, onDelete, onTogglePin, loading, activeCategory, onCategoryChange }: NotesListProps) {
  const formatDate = (value: Timestamp | Date | undefined): string => {
    if (!value) return "";
    const date = value instanceof Timestamp ? value.toDate() : value;
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div>
      {/* Category Filter */}
      <div className="flex gap-1 flex-wrap mb-4">
        {["", ...Object.keys(CATEGORY_STYLES)].map((cat) => {
          const style = cat ? CATEGORY_STYLES[cat] : null;
          const isActive = activeCategory === cat;
          return (
            <button key={cat || "all"} onClick={() => onCategoryChange(cat)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                isActive
                  ? cat ? CATEGORY_STYLES[cat].color + " ring-2 ring-offset-1 ring-current" : "bg-gray-800 text-white dark:bg-white dark:text-gray-800"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
              }`}>
              {style ? style.label : "All"}
            </button>
          );
        })}
      </div>

      {/* Notes */}
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {activeCategory ? "No notes in this category." : "No notes yet. Create your first!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const catStyle = note.category ? CATEGORY_STYLES[note.category] : null;
            const isPinned = !!note.pinned;
            return (
              <div key={note.id} onClick={() => onSelect(note)}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md relative ${
                  selectedNote?.id === note.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : isPinned
                    ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-700"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300"
                }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isPinned && <span className="text-yellow-500 text-xs flex-shrink-0">📌</span>}
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">{note.title || "Untitled Note"}</h3>
                      {catStyle && (
                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${catStyle.color}`}>{catStyle.label}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{note.content}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs text-gray-400">{formatDate(note.updatedAt)}</span>
                      {note.summary && <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 rounded-full">Summary</span>}
                      {note.actionItems && note.actionItems.length > 0 && <span className="text-xs px-2 py-0.5 bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300 rounded-full">{note.actionItems.length} Actions</span>}
                      {note.tags && note.tags.length > 0 && <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 rounded-full">{note.tags.length} Tags</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); onTogglePin(note.id, isPinned); }}
                      title={isPinned ? "Unpin" : "Pin note"}
                      className={`p-1 rounded transition-colors ${isPinned ? "text-yellow-500 hover:text-yellow-600" : "text-gray-300 hover:text-yellow-500"}`}>
                      <svg className="w-4 h-4" fill={isPinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); if (confirm("Delete this note?")) onDelete(note.id); }}
                      className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}