import { Timestamp } from "firebase/firestore";

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  summary?: string | null;
  actionItems?: string[] | null;
  tags?: string[];
  category?: string;
  pinned?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
}