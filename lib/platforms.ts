export type Platform = "whatsapp" | "instagram" | "facebook" | "snapchat";

export function detectPlatform(url: string): Platform | null {
  const lower = url.toLowerCase();
  if (
    lower.includes("instagram.com") ||
    lower.includes("instagr.am")
  ) {
    return "instagram";
  }
  if (
    lower.includes("facebook.com") ||
    lower.includes("fb.watch") ||
    lower.includes("fb.com")
  ) {
    return "facebook";
  }
  if (
    lower.includes("snapchat.com") ||
    lower.includes("snap.com")
  ) {
    return "snapchat";
  }
  if (lower.includes("whatsapp.com")) {
    return "whatsapp";
  }
  return null;
}

export const platformConfig: Record<
  Platform,
  { label: string; icon: string; colorKey: string }
> = {
  whatsapp: { label: "WhatsApp", icon: "logo-whatsapp", colorKey: "whatsapp" },
  instagram: {
    label: "Instagram",
    icon: "logo-instagram",
    colorKey: "instagram",
  },
  facebook: { label: "Facebook", icon: "logo-facebook", colorKey: "facebook" },
  snapchat: { label: "logo-snapchat", icon: "logo-snapchat", colorKey: "snapchatDark" },
};
