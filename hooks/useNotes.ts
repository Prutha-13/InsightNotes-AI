"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirestoreInstance } from "@/lib/firebase";
import { Note } from "@/types";

export function useNotes(userId: string | undefined) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    const db = getFirestoreInstance();
    const q = query(
      collection(db, "notes"),
      where("userId", "==", userId),
      orderBy("pinned", "desc"),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedNotes: Note[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Note, "id">),
        }));
        setNotes(fetchedNotes);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore listener error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const addNote = async (title: string, content: string, category?: string): Promise<string> => {
    if (!userId) throw new Error("User not authenticated");
    const db = getFirestoreInstance();
    const docRef = await addDoc(collection(db, "notes"), {
      userId,
      title: title || "Untitled Note",
      content,
      summary: null,
      actionItems: null,
      tags: [],
      category: category || "",
      pinned: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  };

  const updateNote = async (
    noteId: string,
    updates: Partial<Pick<Note, "title" | "content" | "summary" | "actionItems" | "tags" | "category" | "pinned">>
  ): Promise<void> => {
    const db = getFirestoreInstance();
    await updateDoc(doc(db, "notes", noteId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteNote = async (noteId: string): Promise<void> => {
    const db = getFirestoreInstance();
    await deleteDoc(doc(db, "notes", noteId));
  };

  const togglePin = async (noteId: string, currentPinned: boolean): Promise<void> => {
    const db = getFirestoreInstance();
    await updateDoc(doc(db, "notes", noteId), {
      pinned: !currentPinned,
      updatedAt: serverTimestamp(),
    });
  };

  return { notes, loading, addNote, updateNote, deleteNote, togglePin };
}