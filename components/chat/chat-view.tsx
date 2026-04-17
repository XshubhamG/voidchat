"use client";

import { useEffect, useCallback, useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChatHeader } from "./chat-header";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { Skeleton } from "@/components/ui/skeleton";

interface PendingMessage {
  _id: string;
  content: string;
  senderId: string;
  senderProfile: { displayName: string; avatarColor?: string; avatarUrl?: string | null };
  createdAt: number;
  type: "text";
  conversationId: Id<"conversations">;
}

interface ChatViewProps {
  conversationId: Id<"conversations">;
}

export function ChatView({ conversationId }: ChatViewProps) {
  const conversation = useQuery(api.conversations.getConversation, {
    conversationId,
  });
  const markAsRead = useMutation(api.conversations.markAsRead);
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);

  const activePending = useMemo(
    () => pendingMessages.filter((m) => m.conversationId === conversationId),
    [pendingMessages, conversationId],
  );

  useEffect(() => {
    markAsRead({ conversationId }).catch(() => {});
  }, [conversationId, markAsRead]);

  const handleOptimisticSend = useCallback(
    (content: string) => {
      if (!conversation) return;
      const pending: PendingMessage = {
        _id: `pending-${Date.now()}`,
        content,
        senderId: conversation.currentUserId,
        senderProfile: {
          displayName: "You",
        },
        createdAt: Date.now(),
        type: "text",
        conversationId,
      };
      setPendingMessages((prev) => [...prev, pending]);
      setTimeout(() => {
        setPendingMessages((prev) =>
          prev.filter((m) => m._id !== pending._id),
        );
      }, 5000);
    },
    [conversation, conversationId],
  );

  if (conversation === undefined) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-border/30 bg-card/50 backdrop-blur-sm px-4 py-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="flex-1" />
        <div className="border-t border-border/30 bg-card/50 px-4 py-3">
          <Skeleton className="h-10 w-full rounded-2xl" />
        </div>
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
        pendingMessages={activePending}
      />
      <MessageInput
        conversationId={conversationId}
        isAIChat={isAI}
        onOptimisticSend={isAI ? undefined : handleOptimisticSend}
      />
    </div>
  );
}
