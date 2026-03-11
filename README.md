What is InsightNotes AI?
InsightNotes AI is a full-stack note-taking application that goes beyond writing. Using Groq's Llama 3 models, it automatically summarizes your notes, extracts action items, generates tags, and lets you query your entire note history through an AI assistant — all in real time.
You write. The AI does the rest.

✨ Features
FeatureDescription🔐 Google AuthenticationSign in instantly with Google via Firebase Auth⚡ Real-time SyncNotes saved and synced live with Firestore🤖 AI SummariesGroq + Llama 3 condenses your notes in 1–2 seconds✅ Action Item ExtractionAI automatically pulls tasks from your notes🏷️ Auto TaggingSmart tags generated for every note💬 AI AssistantQuery your entire note history in natural language🎤 Voice-to-TextDictate notes hands-free with voice input🔍 Smart SearchSearch across all notes with category filters📊 Word Count & Reading TimeInstant stats on every note🌗 Dark / Light ModeSystem-aware theme switching

🛠️ Tech Stack
Frontend

Next.js — React framework with SSR
React — Component-based UI
TypeScript — Type safety across the entire codebase
TailwindCSS — Utility-first styling

Backend / Infrastructure

Firebase Authentication — Google OAuth, zero backend needed
Firestore — Real-time NoSQL database
Vercel — Serverless deployment with global CDN

AI

Groq API — LLM inference engine (~1–2 second response times)
Llama 3 Models — Powers summaries, extraction, and the AI assistant


🚀 Getting Started
Prerequisites

Node.js 18+
A Firebase project (create one here)
A Groq API key (get one here)

1. Clone the repository
bashgit clone https://github.com/Prutha-13/InsightNotes-AI.git
cd InsightNotes-AI
npm install
2. Configure environment variables
Create a .env.local file in the root directory:
env# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Groq AI
GROQ_API_KEY=your_groq_api_key
3. Set up Firebase

Go to Firebase Console
Enable Google Authentication under Authentication → Sign-in methods
Create a Firestore Database in production mode
Add your domain to the authorized domains list

4. Run the development server
bashnpm run dev
Open http://localhost:3000 in your browser.

📁 Project Structure
InsightNotes-AI/
├── app/                    # Next.js app directory
│   ├── api/                # API routes (Groq AI endpoints)
│   ├── dashboard/          # Main notes dashboard
│   └── layout.tsx          # Root layout
├── components/             # Reusable React components
│   ├── NoteEditor.tsx      # Note creation & editing
│   ├── AIAssistant.tsx     # AI chat interface
│   ├── NoteCard.tsx        # Individual note display
│   └── Sidebar.tsx         # Navigation & filters
├── lib/
│   ├── firebase.ts         # Firebase configuration
│   └── groq.ts             # Groq AI client
├── hooks/                  # Custom React hooks
└── types/                  # TypeScript type definitions

🤖 AI Pipeline
InsightNotes AI runs 3 separate Groq API pipelines:
User saves a note
        │
        ├──▶ Pipeline 1: Summarization
        │    └── Condenses note into 2–3 sentences
        │
        ├──▶ Pipeline 2: Extraction
        │    ├── Action items (tasks to do)
        │    └── Auto-generated tags
        │
        └──▶ Pipeline 3: AI Assistant (on demand)
             └── Natural language queries across all notes
All pipelines use Groq's Llama 3 for sub-2-second inference.

🌐 Deployment
The app is deployed on Vercel with automatic deployments on every push to main.
Live: insight-notes-ai.vercel.app
To deploy your own instance:
bashnpm run build       # Verify build passes locally first
vercel              # Deploy via Vercel CLI
Set all .env.local variables as environment variables in your Vercel project settings.

👩‍💻 Author
Prutha Thakur

GitHub: @Prutha-13
LinkedIn: linkedin.com/in/prutha-thakur
Live Project: insight-notes-ai.vercel.app


<div align="center">
⭐ If you found this project useful, consider giving it a star!
</div>
