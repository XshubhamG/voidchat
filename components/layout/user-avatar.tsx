"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, getAvatarColor, getContrastColor } from "@/lib/avatar";

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  avatarColor?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

export function UserAvatar({
  name,
  avatarUrl,
  avatarColor,
  size = "md",
  className,
}: UserAvatarProps) {
  const color = avatarColor ?? getAvatarColor(name);
  const contrast = getContrastColor(color);
  const initials = getInitials(name);

  return (
    <Avatar className={`${sizeClasses[size]} ${className ?? ""}`}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
      <AvatarFallback
        style={{ backgroundColor: color, color: contrast }}
        className="font-semibold"
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
