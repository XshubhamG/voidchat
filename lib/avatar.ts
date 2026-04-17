const PASTEL_COLORS = [
  "#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF",
  "#E8BAFF", "#FFB3E6", "#B3FFE0", "#B3D4FF", "#FFD4B3",
  "#D4B3FF", "#B3FFD4", "#FFB3D4", "#B3FFB3", "#D4FFB3",
  "#FFE8B3", "#B3E8FF", "#FFB3FF", "#B3FFFF", "#FFCBA4",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getAvatarColor(identifier: string): string {
  const index = hashString(identifier) % PASTEL_COLORS.length;
  return PASTEL_COLORS[index];
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#1a1a2e" : "#ffffff";
}
