import { doc, getDoc } from "firebase/firestore";
import { getFirestoreInstance } from "@/lib/firebase";
import { Note } from "@/types";

interface PageProps {
  params: { id: string };
}

const CATEGORY_LABELS: Record<string, string> = {
  personal: "👤 Personal",
  work: "💼 Work",
  learning: "📚 Learning",
  ideas: "💡 Ideas",
  meetings: "🗓️ Meetings",
  other: "📌 Other",
};

export default async function SharedNotePage({ params }: PageProps) {
  let note: Note | null = null;
  let error = false;

  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, "notes", params.id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      note = { id: snap.id, ...(snap.data() as Omit<Note, "id">) };
    } else {
      error = true;
    }
  } catch {
    error = true;
  }

  if (error || !note) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Note not found</h1>
          <p className="text-gray-500">This note may have been deleted or the link is invalid.</p>
        </div>
      </div>
    );
  }

  const formatDate = (ts: Note["createdAt"]) => {
    if (!ts) return "";
    const date = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts as unknown as string);
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-sm">🧠</span>
          </div>
          <span className="font-bold text-gray-900">InsightNotes AI</span>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Shared Note · Read Only</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 pt-8 pb-4 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-gray-900">{note.title || "Untitled Note"}</h1>
              {note.category && (
                <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full flex-shrink-0">
                  {CATEGORY_LABELS[note.category] ?? note.category}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-2">Shared on {formatDate(note.createdAt)}</p>
          </div>

          <div className="px-8 py-6">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">{note.content}</div>
          </div>

          {(note.summary || (note.actionItems && note.actionItems.length > 0) || (note.tags && note.tags.length > 0)) && (
            <div className="px-8 pb-8 space-y-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">AI Insights</h2>
              {note.summary && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-purple-700 mb-2">✨ Summary</h3>
                  <p className="text-sm text-gray-700">{note.summary}</p>
                </div>
              )}
              {note.actionItems && note.actionItems.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-green-700 mb-2">✅ Action Items</h3>
                  <ul className="space-y-1">
                    {note.actionItems.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">Created with <span className="font-medium">InsightNotes AI</span></p>
      </main>
    </div>
  );
}