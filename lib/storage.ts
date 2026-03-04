import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

export interface SavedMedia {
  id: string;
  uri: string;
  type: "image" | "video";
  platform: "whatsapp" | "instagram" | "facebook" | "snapchat";
  timestamp: number;
  filename: string;
  sourceUrl?: string;
}

const SAVED_KEY = "@saved_media";
const HISTORY_KEY = "@download_history";

export async function getSavedMedia(): Promise<SavedMedia[]> {
  try {
    const data = await AsyncStorage.getItem(SAVED_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveMedia(item: SavedMedia): Promise<void> {
  const existing = await getSavedMedia();
  const updated = [item, ...existing];
  await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(updated));
}

async function deleteFileIfExists(uri: string): Promise<void> {
  if (Platform.OS === "web" || !uri || !FileSystem.documentDirectory) return;
  try {
    if (uri.startsWith(FileSystem.documentDirectory)) {
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    }
  } catch {}
}

export async function removeMedia(id: string): Promise<void> {
  const existing = await getSavedMedia();
  const toRemove = existing.find((m) => m.id === id);
  if (toRemove) {
    await deleteFileIfExists(toRemove.uri);
  }
  const updated = existing.filter((m) => m.id !== id);
  await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(updated));
}

export async function clearAllMedia(): Promise<void> {
  const existing = await getSavedMedia();
  for (const item of existing) {
    await deleteFileIfExists(item.uri);
  }
  await AsyncStorage.setItem(SAVED_KEY, JSON.stringify([]));
}

export interface DownloadHistoryItem {
  id: string;
  url: string;
  platform: string;
  timestamp: number;
  success: boolean;
}

export async function getDownloadHistory(): Promise<DownloadHistoryItem[]> {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function addToHistory(
  item: DownloadHistoryItem,
): Promise<void> {
  const existing = await getDownloadHistory();
  const updated = [item, ...existing].slice(0, 100);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify([]));
}
