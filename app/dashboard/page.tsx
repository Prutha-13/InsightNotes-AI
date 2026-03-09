"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { getAuthInstance } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useNotes } from "@/hooks/useNotes";
import { Note } from "@/types";
import AuthButton from "@/components/AuthButton";
import NotesList from "@/components/NotesList";
import NoteEditor from "@/components/NoteEditor";
import AIChat from "@/components/AIChat";
import ThemeToggle from "@/components/ThemeToggle";
import StatsPanel from "@/components/StatsPanel";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  const router = useRouter();
  const { notes, loading, addNote, updateNote, deleteNote, togglePin } = useNotes(user?.uid);

  useEffect(() => {
    const auth = getAuthInstance();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (!u) router.push("/");
    });
    return () => unsub();
  }, [router]);

  const handleCreateNote = () => { setSelectedNote(null); setIsEditing(true); };
  const handleSelectNote = (note: Note) => { setSelectedNote(note); setIsEditing(true); };
  const handleCancel = () => { setIsEditing(false); setSelectedNote(null); };

  const handleSave = async (title: string, content: string, category?: string) => {
    if (selectedNote) {
      await updateNote(selectedNote.id, { title, content, ...(category !== undefined && { category }) });
    } else {
      await addNote(title, content, category);
    }
  };

  const handleDelete = async (noteId: string) => {
    await deleteNote(noteId);
    if (selectedNote?.id === noteId) { setSelectedNote(null); setIsEditing(false); }
  };

  const handleUpdate = async (noteId: string, updates: Partial<Pick<Note, "title" | "content" | "summary" | "actionItems" | "category">>) => {
    await updateNote(noteId, updates);
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "" || note.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">🧠</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">InsightNotes AI</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <AuthButton user={user} />
          </div>
        </div>
      </header>

      {/* Keyboard shortcut hint bar */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 px-4 py-1.5 text-center">
        <p className="text-xs text-blue-600 dark:text-blue-400">
          ⌨️ Shortcuts: <kbd className="bg-blue-100 dark:bg-blue-800 px-1 rounded">Ctrl+S</kbd> Save &nbsp;·&nbsp;
          <kbd className="bg-blue-100 dark:bg-blue-800 px-1 rounded">Esc</kbd> Close editor &nbsp;·&nbsp;
          📌 Pin notes to keep them at the top
        </p>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Notes
                  <span className="ml-2 text-sm font-normal text-gray-400">({notes.length})</span>
                </h2>
                <button onClick={handleCreateNote}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New
                </button>
              </div>

              <StatsPanel notes={notes} />
              <AIChat notes={notes} />

              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full mb-4 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
              />

              <NotesList
                notes={filteredNotes}
                selectedNote={selectedNote}
                onSelect={handleSelectNote}
                onDelete={handleDelete}
                onTogglePin={togglePin}
                loading={loading}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>
          </div>

          {/* Editor */}
          <div className="lg:col-span-2">
            {isEditing ? (
              <NoteEditor
                note={selectedNote}
                onSave={handleSave}
                onCancel={handleCancel}
                onUpdate={handleUpdate}
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">✨</div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Welcome to InsightNotes AI</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Select a note to edit, or create a new one.</p>
                <button onClick={handleCreateNote}
                  className="inline-flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Your First Note
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}