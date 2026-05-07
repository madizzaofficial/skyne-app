import { doc, getDoc, setDoc } from "firebase/firestore";
import { RoutineItem, ScanHistoryItem } from "@/types/appTypes";
import { db } from "@/lib/firebase";

export interface UserFirestoreData {
  favorites: string[];
  routine: RoutineItem[];
  scanHistory: ScanHistoryItem[];
}

export async function loadUserData(uid: string): Promise<UserFirestoreData | null> {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) return snap.data() as UserFirestoreData;
    return null;
  } catch {
    return null;
  }
}

export async function saveUserFavorites(uid: string, favorites: string[]): Promise<void> {
  try {
    await setDoc(doc(db, "users", uid), { favorites }, { merge: true });
  } catch {}
}

export async function saveUserRoutine(uid: string, routine: RoutineItem[]): Promise<void> {
  try {
    await setDoc(doc(db, "users", uid), { routine }, { merge: true });
  } catch {}
}

export async function saveUserHistory(
  uid: string,
  scanHistory: ScanHistoryItem[]
): Promise<void> {
  try {
    await setDoc(doc(db, "users", uid), { scanHistory }, { merge: true });
  } catch {}
}
