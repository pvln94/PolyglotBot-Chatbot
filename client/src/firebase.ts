// src/firebase.ts
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  getFirestore,
  addDoc,
  doc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  serverTimestamp,
  orderBy,
  query,
  getDoc,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Sign in with Google
export function signInWithGoogle() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

// Sign out
export function signOutFirebase() {
  return firebaseSignOut(auth);
}

// Auth state change helper
export function onAuthStateChangedHelper(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, async (user) => {
    callback(user);
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(
          userRef,
          {
            user_id: user.uid,
            email: user.email,
          },
          { merge: true }
        );
      } catch (error) {
        console.error('Error storing user information in Firestore:', error);
      }
    }
  });
}

// Define chat and message types
interface Chat {
  id: string;
  chatName: string;
  messages: Message[];
}

interface Message {
  id: string;
  role: string;
  content: string;
  translated?: string;
  addedAt?: any;
}

// Get user chats and messages
export async function getUserChatsandMessages(user: User): Promise<Record<string, Chat> | null> {
  try {
    const chatsRef = collection(db, `users/${user.uid}/chats`);
    const chatSnapshot = await getDocs(query(chatsRef, orderBy('createdAt', 'asc')));

    const chats: Record<string, Chat> = {};
    await Promise.all(
      chatSnapshot.docs.map(async (chatDoc) => {
        const messagesRef = collection(db, `users/${user.uid}/chats/${chatDoc.id}/messages`);
        const messageSnapshot = await getDocs(query(messagesRef, orderBy('addedAt', 'asc')));

        const messages: Message[] = messageSnapshot.docs.map((messageDoc) => ({
          id: messageDoc.id,
          ...messageDoc.data(),
        } as Message));

        chats[chatDoc.id] = {
          id: chatDoc.id,
          chatName: chatDoc.data().chatName,
          messages,
        };
      })
    );
    return chats;
  } catch (error) {
    console.error('Error fetching chats:', error);
    return null;
  }
}

// Get messages for a specific chat
export async function getMessages(user: User, chatId: string): Promise<Message[] | null> {
  try {
    const messagesRef = collection(db, `users/${user.uid}/chats/${chatId}/messages`);
    const messagesSnapshot = await getDocs(query(messagesRef, orderBy('addedAt', 'asc')));
    return messagesSnapshot.docs.map((messageDoc) => ({
      role: messageDoc.data().role,
      content: messageDoc.data().content,
    } as Message));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return null;
  }
}

// Get chosen chat languages
export async function getChosenChatLanguages(user: User, chatId: string): Promise<string[] | null> {
  try {
    const chatRef = doc(db, `users/${user.uid}/chats`, chatId);
    const docSnap = await getDoc(chatRef);
    if (!docSnap.exists()) return null;
    return [docSnap.data()?.Language, docSnap.data()?.TranslatedLanguage];
  } catch (error) {
    console.error('Error fetching languages:', error);
    return null;
  }
}

// Add a new chat
export async function addChat(
  user: User,
  chatName: string,
  language: string,
  translatedLang: string
): Promise<string | null> {
  try {
    const userChatsRef = collection(db, `users/${user.uid}/chats`);
    const chatSnapshot = await addDoc(userChatsRef, {
      createdAt: serverTimestamp(),
      chatName, // Consistent naming
      Language: language,
      TranslatedLanguage: translatedLang,
    });
    return chatSnapshot.id;
  } catch (error) {
    console.error('Error adding chat:', error);
    return null;
  }
}

// Delete a chat
export async function deleteChat(user: User, chatId: string): Promise<boolean | null> {
  try {
    const messagesRef = collection(db, `users/${user.uid}/chats/${chatId}/messages`);
    const messagesSnapshot = await getDocs(messagesRef);
    await Promise.all(messagesSnapshot.docs.map((messageDoc) => deleteDoc(messageDoc.ref)));

    const chatRef = doc(db, `users/${user.uid}/chats/${chatId}`);
    await deleteDoc(chatRef);
    return true;
  } catch (error) {
    console.error('Error deleting chat:', error);
    return null;
  }
}

// Add messages to a chat
export async function addMessages(
  user: User,
  chatId: string,
  id: string,
  sender: string,
  text: string,
  translated: string
): Promise<void | null> {
  try {
    const messageRef = collection(db, `users/${user.uid}/chats/${chatId}/messages`);
    await addDoc(messageRef, {
      id,
      role: sender,
      content: text,
      translated,
      addedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding message:', error);
    return null;
  }
}

// Export Firestore instance
export { db };