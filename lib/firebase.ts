import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth as firebaseGetAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Safe singleton initialization — prevents re-init on hot reload
function getFirebaseApp(): FirebaseApp {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

let authInstance: Auth | undefined;
let firestoreInstance: Firestore | undefined;

export function getAuthInstance(): Auth {
  if (!authInstance) {
    authInstance = firebaseGetAuth(getFirebaseApp());
  }
  return authInstance;
}

export function getFirestoreInstance(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(getFirebaseApp());
  }
  return firestoreInstance;
}

export const googleProvider = new GoogleAuthProvider();

