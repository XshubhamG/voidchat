"use client";

import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
import { UserAvatar } from "@/components/layout/user-avatar";
import { Bot } from "lucide-react";

interface MessageBubbleProps {
  content: string;
  senderId: string;
  senderName: string;
  senderAvatarColor?: string;
  senderAvatarUrl?: string | null;
  createdAt: number;
  type: "text" | "ai" | "system";
  isOwn: boolean;
  showAvatar: boolean;
  showName: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
}

export function MessageBubble({
  content,
  senderName,
  senderAvatarColor,
  senderAvatarUrl,
  createdAt,
  type,
  isOwn,
  showAvatar,
  showName,
  isFirstInGroup,
  isLastInGroup,
}: MessageBubbleProps) {
  if (type === "system") {
    return (
      <div className="flex justify-center py-2">
        <span className="rounded-full bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
          {content}
        </span>
      </div>
    );
  }

  const isAI = type === "ai";

  return (
    <div
      className={cn(
        "flex gap-2",
        isOwn ? "flex-row-reverse" : "flex-row",
        !isLastInGroup && "mb-0.5",
        isLastInGroup && "mb-3",
      )}
    >
      <div className="w-8 shrink-0">
        {showAvatar && !isOwn && (
          isAI ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500">
              <Bot className="h-4 w-4 text-white" />
            </div>
          ) : (
            <UserAvatar
              name={senderName}
              avatarUrl={senderAvatarUrl}
              avatarColor={senderAvatarColor}
              size="sm"
            />
          )
        )}
      </div>
      <div
        className={cn(
          "flex max-w-[75%] flex-col",
          isOwn ? "items-end" : "items-start",
        )}
      >
        {showName && !isOwn && (
          <span className="mb-1 px-1 text-xs font-medium text-muted-foreground">
            {isAI ? "AI Assistant" : senderName}
          </span>
        )}
        <div
          className={cn(
            "relative px-3 py-2 text-sm leading-relaxed",
            isOwn
              ? "bg-primary text-primary-foreground"
              : isAI
                ? "bg-violet-500/10 text-foreground"
                : "bg-muted text-foreground",
            isFirstInGroup && isLastInGroup && "rounded-2xl",
            isFirstInGroup &&
              !isLastInGroup &&
              (isOwn
                ? "rounded-2xl rounded-br-md"
                : "rounded-2xl rounded-bl-md"),
            !isFirstInGroup &&
              !isLastInGroup &&
              (isOwn
                ? "rounded-2xl rounded-r-md"
                : "rounded-2xl rounded-l-md"),
            !isFirstInGroup &&
              isLastInGroup &&
              (isOwn
                ? "rounded-2xl rounded-tr-md"
                : "rounded-2xl rounded-tl-md"),
          )}
        >
          <p className="whitespace-pre-wrap break-words">{content}</p>
          <span
            className={cn(
              "mt-1 block text-right text-[10px]",
              isOwn
                ? "text-primary-foreground/60"
                : "text-muted-foreground",
            )}
          >
            {formatTime(createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
