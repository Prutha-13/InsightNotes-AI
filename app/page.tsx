"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { getAuthInstance } from "@/lib/firebase";
import AuthButton from "@/components/AuthButton";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuthInstance();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) router.push("/dashboard");
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">

          {/* Hero */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <span className="text-4xl">🧠</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              InsightNotes AI
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              An intelligent note-taking workspace powered by AI.
              Organize ideas, summarize notes, extract tasks, and search your knowledge instantly.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { emoji: "✨", title: "AI Summarization", desc: "Automatically summarize long notes into concise insights using Gemini AI." },
              { emoji: "🏷️", title: "Smart Tags", desc: "Organize notes with AI-generated tags for better knowledge management." },
              { emoji: "🔎", title: "Instant Search", desc: "Quickly find any note by searching titles or content." },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <div className="text-3xl mb-3">{emoji}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>

          {/* Tech Stack */}
          <div className="mb-12">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Built With</p>
            <div className="flex items-center justify-center gap-8">
              {[["⚡", "Next.js"], ["🔥", "Firebase"], ["💎", "Gemini AI"]].map(([icon, name]) => (
                <div key={name} className="flex items-center gap-2">
                  <span className="text-2xl">{icon}</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sign In */}
          <div className="flex justify-center">
            <AuthButton user={user} />
          </div>

          <div className="mt-16 text-sm text-gray-400 dark:text-gray-500">
            InsightNotes AI • Intelligent Knowledge Workspace
          </div>
        </div>
      </div>
    </main>
  );
}