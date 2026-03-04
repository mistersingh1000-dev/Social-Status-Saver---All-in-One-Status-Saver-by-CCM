import React from "react";
import { StyleSheet, View, Text, Pressable, Dimensions } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/useTheme";
import type { SavedMedia } from "@/lib/storage";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = (SCREEN_WIDTH - 48 - 12) / 2;

interface MediaCardProps {
  item: SavedMedia;
  onPress: () => void;
  onDelete: () => void;
}

export function MediaCard({ item, onPress, onDelete }: MediaCardProps) {
  const theme = useTheme();

  const platformColors: Record<string, string> = {
    whatsapp: theme.whatsapp,
    instagram: theme.instagram,
    facebook: theme.facebook,
    snapchat: theme.snapchatDark,
  };

  const platformIcons: Record<string, string> = {
    whatsapp: "logo-whatsapp",
    instagram: "logo-instagram",
    facebook: "logo-facebook",
    snapchat: "logo-snapchat",
  };

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.surface }]}
      testID={`media-card-${item.id}`}
    >
      <View style={styles.imageContainer}>
        {item.uri ? (
          <Image source={{ uri: item.uri }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: theme.surfaceSecondary }]}>
            <Ionicons
              name={item.type === "video" ? "videocam" : "image"}
              size={32}
              color={theme.textSecondary}
            />
          </View>
        )}
        {item.type === "video" && (
          <View style={styles.videoOverlay}>
            <Ionicons name="play-circle" size={32} color="#fff" />
          </View>
        )}
        <View style={styles.platformBadge}>
          <View
            style={[
              styles.badgeInner,
              { backgroundColor: platformColors[item.platform] || theme.tint },
            ]}
          >
            <Ionicons
              name={(platformIcons[item.platform] || "download") as any}
              size={12}
              color="#fff"
            />
          </View>
        </View>
      </View>
      <View style={styles.info}>
        <Text
          style={[styles.filename, { color: theme.text }]}
          numberOfLines={1}
        >
          {item.filename}
        </Text>
        <View style={styles.actions}>
          <Text style={[styles.date, { color: theme.textSecondary }]}>
            {new Date(item.timestamp).toLocaleDateString()}
          </Text>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            hitSlop={8}
          >
            <Ionicons name="trash-outline" size={16} color={theme.danger} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 14,
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: CARD_WIDTH,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  platformBadge: {
    position: "absolute",
    top: 8,
    left: 8,
  },
  badgeInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    padding: 10,
    gap: 4,
  },
  filename: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
});
