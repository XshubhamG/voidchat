"use client";

import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChatHeader } from "./chat-header";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatViewProps {
  conversationId: Id<"conversations">;
}

export function ChatView({ conversationId }: ChatViewProps) {
  const conversation = useQuery(api.conversations.getConversation, {
    conversationId,
  });
  const markAsRead = useMutation(api.conversations.markAsRead);

  useEffect(() => {
    markAsRead({ conversationId }).catch(() => {});
  }, [conversationId, markAsRead]);

  if (conversation === undefined) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex-1" />
      </div>
    );
  }

  if (conversation === null) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <p>Conversation not found</p>
      </div>
    );
  }

  const isAI = conversation.type === "ai";
  const otherMembers = conversation.members.filter(
    (m) => m.userId !== conversation.currentUserId,
  );
  const displayName = isAI
    ? "AI Assistant"
    : otherMembers[0]?.profile?.displayName ?? "Unknown User";
  const avatarUrl = otherMembers[0]?.profile?.avatarUrl;
  const avatarColor = otherMembers[0]?.profile?.avatarColor;

  return (
    <div className="flex flex-1 flex-col">
      <ChatHeader
        name={displayName}
        avatarUrl={avatarUrl}
        avatarColor={avatarColor}
        type={conversation.type}
      />
      <MessageList
        conversationId={conversationId}
        currentUserId={conversation.currentUserId}
      />
      <MessageInput conversationId={conversationId} isAIChat={isAI} />
    </div>
  );
}
