"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserAvatar } from "@/components/layout/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime, formatDate } from "@/lib/utils";

interface ConversationItemProps {
  conversationId: string;
  type: string;
  otherProfiles: Array<{
    displayName: string;
    avatarUrl?: string | null;
    avatarColor: string;
    userId: string;
  }>;
  lastMessagePreview?: string;
  lastMessageAt?: number;
  unreadCount: number;
}

export function ConversationItem({
  conversationId,
  type,
  otherProfiles,
  lastMessagePreview,
  lastMessageAt,
  unreadCount,
}: ConversationItemProps) {
  const pathname = usePathname();
  const isActive = pathname === `/chat/${conversationId}`;

  const displayName =
    type === "ai"
      ? "AI Assistant"
      : otherProfiles[0]?.displayName ?? "Unknown User";

  const timeStr = lastMessageAt
    ? formatTime(lastMessageAt)
    : "";

  return (
    <Link
      href={`/chat/${conversationId}`}
      className={cn(
        "flex items-center gap-3 rounded-lg p-3 transition-colors",
        isActive
          ? "bg-accent"
          : "hover:bg-accent/50",
      )}
    >
      {type === "ai" ? (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500">
          <Bot className="h-5 w-5 text-white" />
        </div>
      ) : (
        <UserAvatar
          name={displayName}
          avatarUrl={otherProfiles[0]?.avatarUrl}
          avatarColor={otherProfiles[0]?.avatarColor}
          size="md"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="truncate text-sm font-medium">{displayName}</p>
          {timeStr && (
            <span className="ml-2 shrink-0 text-xs text-muted-foreground">
              {timeStr}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="truncate text-xs text-muted-foreground">
            {lastMessagePreview ?? "No messages yet"}
          </p>
          {unreadCount > 0 && (
            <Badge
              variant="default"
              className="ml-2 h-5 min-w-5 shrink-0 justify-center rounded-full px-1.5 text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
