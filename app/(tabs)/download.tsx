import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  Platform,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/useTheme";
import { UrlInput } from "@/components/UrlInput";
import {
  saveMedia,
  addToHistory,
  getDownloadHistory,
  type SavedMedia,
  type DownloadHistoryItem,
} from "@/lib/storage";
import { detectPlatform } from "@/lib/platforms";
import { apiRequest } from "@/lib/query-client";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useFocusEffect } from "expo-router";

export default function DownloadScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);

  const loadHistory = useCallback(async () => {
    const h = await getDownloadHistory();
    setHistory(h);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory]),
  );

  const handleDownload = async () => {
    if (!url.trim()) return;

    const trimmedUrl = url.trim();
    const platform = detectPlatform(trimmedUrl);

    if (!platform) {
      setResult({
        type: "error",
        message:
          "Unsupported URL. Please paste a link from Instagram, Facebook, or Snapchat.",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await apiRequest("POST", "/api/download", {
        url: trimmedUrl,
      });
      const data = await response.json();

      if (data.success) {
        const id =
          Date.now().toString() + Math.random().toString(36).substr(2, 9);

        let localUri = "";
        const filename = data.filename || `${platform}_${Date.now()}.jpg`;

        if (data.data && FileSystem.documentDirectory) {
          const filePath = FileSystem.documentDirectory + filename;
          await FileSystem.writeAsStringAsync(filePath, data.data, {
            encoding: FileSystem.EncodingType.Base64,
          });
          localUri = filePath;

          if (Platform.OS !== "web") {
            try {
              const { status } = await MediaLibrary.requestPermissionsAsync();
              if (status === "granted") {
                await MediaLibrary.saveToLibraryAsync(filePath);
              }
            } catch {}
          }
        }

        const saved: SavedMedia = {
          id,
          uri: localUri || data.directUrl || "",
          type: data.type || "image",
          platform: (platform as SavedMedia["platform"]) || "instagram",
          timestamp: Date.now(),
          filename,
          sourceUrl: trimmedUrl,
        };

        await saveMedia(saved);
        await addToHistory({
          id,
          url: trimmedUrl,
          platform: platform || "unknown",
          timestamp: Date.now(),
          success: true,
        });

        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        setResult({
          type: "success",
          message: `${data.type === "video" ? "Video" : "Image"} saved successfully!`,
        });
        setUrl("");
        loadHistory();
      } else {
        throw new Error(data.error || "Download failed");
      }
    } catch (err: any) {
      const errorMsg =
        err?.message?.includes("422")
          ? "No downloadable media found. The content may be private or require login."
          : err?.message || "Download failed. Please try again.";

      await addToHistory({
        id:
          Date.now().toString() + Math.random().toString(36).substr(2, 9),
        url: trimmedUrl,
        platform: platform || "unknown",
        timestamp: Date.now(),
        success: false,
      });

      setResult({ type: "error", message: errorMsg });
      loadHistory();
    } finally {
      setIsLoading(false);
    }
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 16 + webTopInset,
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: theme.text }]}>Download</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Paste a public media link to save it
        </Text>

        <UrlInput
          value={url}
          onChangeText={setUrl}
          onSubmit={handleDownload}
          isLoading={isLoading}
        />

        {result && (
          <View
            style={[
              styles.resultBox,
              {
                backgroundColor:
                  result.type === "success"
                    ? theme.tintLight
                    : theme.dangerLight,
              },
            ]}
          >
            <Ionicons
              name={
                result.type === "success"
                  ? "checkmark-circle"
                  : "alert-circle"
              }
              size={20}
              color={result.type === "success" ? theme.tint : theme.danger}
            />
            <Text
              style={[
                styles.resultText,
                {
                  color:
                    result.type === "success" ? theme.tint : theme.danger,
                },
              ]}
            >
              {result.message}
            </Text>
          </View>
        )}

        <Text
          style={[styles.sectionTitle, { color: theme.text, marginTop: 28 }]}
        >
          Supported Platforms
        </Text>

        <View style={styles.platformList}>
          <PlatformInfo
            icon="logo-instagram"
            color={theme.instagram}
            name="Instagram"
            desc="Reels, posts, stories (public)"
            theme={theme}
          />
          <PlatformInfo
            icon="logo-facebook"
            color={theme.facebook}
            name="Facebook"
            desc="Videos, photos (public)"
            theme={theme}
          />
          <PlatformInfo
            icon="logo-snapchat"
            color={theme.snapchatDark}
            name="Snapchat"
            desc="Spotlight, public stories"
            theme={theme}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          How to download
        </Text>

        <View style={styles.howToList}>
          <HowToStep
            number={1}
            text="Open the social media app and find the media you want"
            theme={theme}
          />
          <HowToStep
            number={2}
            text='Tap "Share" and copy the link, or use "Share to" this app'
            theme={theme}
          />
          <HowToStep
            number={3}
            text="Paste the link above and tap the download button"
            theme={theme}
          />
        </View>

        {history.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Recent Downloads
            </Text>
            <View style={styles.historyList}>
              {history.slice(0, 5).map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.historyItem,
                    { backgroundColor: theme.surface },
                  ]}
                >
                  <Ionicons
                    name={item.success ? "checkmark-circle" : "close-circle"}
                    size={18}
                    color={item.success ? theme.tint : theme.danger}
                  />
                  <View style={styles.historyContent}>
                    <Text
                      style={[styles.historyUrl, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {item.url}
                    </Text>
                    <Text
                      style={[
                        styles.historyMeta,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {item.platform} -{" "}
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function PlatformInfo({
  icon,
  color,
  name,
  desc,
  theme,
}: {
  icon: string;
  color: string;
  name: string;
  desc: string;
  theme: any;
}) {
  return (
    <View style={[piStyles.container, { backgroundColor: theme.surface }]}>
      <View style={[piStyles.iconBox, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <View style={piStyles.text}>
        <Text style={[piStyles.name, { color: theme.text }]}>{name}</Text>
        <Text style={[piStyles.desc, { color: theme.textSecondary }]}>
          {desc}
        </Text>
      </View>
    </View>
  );
}

const piStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  desc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});

function HowToStep({
  number,
  text,
  theme,
}: {
  number: number;
  text: string;
  theme: any;
}) {
  return (
    <View style={htStyles.container}>
      <View
        style={[htStyles.badge, { backgroundColor: theme.accentLight }]}
      >
        <Text style={[htStyles.number, { color: theme.accent }]}>
          {number}
        </Text>
      </View>
      <Text style={[htStyles.text, { color: theme.textSecondary }]}>
        {text}
      </Text>
    </View>
  );
}

const htStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  number: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
  },
  resultBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginTop: 14,
  },
  resultText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  platformList: {
    gap: 8,
    marginBottom: 24,
  },
  howToList: {
    gap: 16,
    marginBottom: 24,
  },
  historyList: {
    gap: 8,
    marginBottom: 20,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  historyContent: {
    flex: 1,
    gap: 2,
  },
  historyUrl: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  historyMeta: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
