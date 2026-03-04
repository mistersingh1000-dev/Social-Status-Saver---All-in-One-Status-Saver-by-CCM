export function redirectSystemPath({
  path,
  initial,
}: { path: string; initial: boolean }) {
  if (path && (path.includes("http://") || path.includes("https://"))) {
    return "/(tabs)/download";
  }
  return "/";
}
