"use client";

import { Note } from "@/types";

interface StatsPanelProps {
  notes: Note[];
}

const CATEGORY_LABELS: Record<string, string> = {
  personal: "👤 Personal",
  work: "💼 Work",
  learning: "📚 Learning",
  ideas: "💡 Ideas",
  meetings: "🗓️ Meetings",
  other: "📌 Other",
};

export default function StatsPanel({ notes }: StatsPanelProps) {
  const totalWords = notes.reduce((acc, note) => {
    const words = note.content.trim() === "" ? 0 : note.content.trim().split(/\s+/).length;
    return acc + words;
  }, 0);

  const totalActionItems = notes.reduce((acc, note) => acc + (note.actionItems?.length ?? 0), 0);
  const pinnedCount = notes.filter((n) => n.pinned).length;

  const categoryCounts: Record<string, number> = {};
  notes.forEach((note) => {
    if (note.category) categoryCounts[note.category] = (categoryCounts[note.category] ?? 0) + 1;
  });
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeek = notes.filter((note) => {
    if (!note.createdAt) return false;
    const date = typeof note.createdAt.toDate === "function" ? note.createdAt.toDate() : new Date(note.createdAt as unknown as string);
    return date >= oneWeekAgo;
  }).length;

  const stats = [
    { label: "Total Notes", value: notes.length, icon: "📝", color: "text-blue-600 dark:text-blue-400" },
    { label: "Words Written", value: totalWords.toLocaleString(), icon: "✍️", color: "text-purple-600 dark:text-purple-400" },
    { label: "Action Items", value: totalActionItems, icon: "✅", color: "text-green-600 dark:text-green-400" },
    { label: "This Week", value: thisWeek, icon: "📅", color: "text-orange-600 dark:text-orange-400" },
    { label: "Pinned", value: pinnedCount, icon: "📌", color: "text-yellow-600 dark:text-yellow-400" },
    { label: "Top Category", value: topCategory ? CATEGORY_LABELS[topCategory[0]] ?? topCategory[0] : "—", icon: "🏆", color: "text-pink-600 dark:text-pink-400" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-4">
      <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Your Stats</h2>
      <div className="grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
            <div className="text-lg mb-0.5">{stat.icon}</div>
            <div className={`text-base font-bold ${stat.color} leading-tight`}>{stat.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}