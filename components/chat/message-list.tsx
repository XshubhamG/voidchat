"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MessageBubble } from "./message-bubble";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

interface MessageListProps {
  conversationId: Id<"conversations">;
  currentUserId: string;
}

export function MessageList({
  conversationId,
  currentUserId,
}: MessageListProps) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.list,
    { conversationId },
    { initialNumItems: 30 },
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);
  const initialScrollDone = useRef(false);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    if (!results) return;

    if (!initialScrollDone.current && results.length > 0) {
      scrollToBottom();
      initialScrollDone.current = true;
      prevLengthRef.current = results.length;
      return;
    }

    if (results.length > prevLengthRef.current) {
      const newCount = results.length - prevLengthRef.current;
      const lastNew = results[results.length - 1];
      const isOwnMessage = lastNew?.senderId === currentUserId;

      if (newCount <= 3 || isOwnMessage) {
        scrollToBottom("smooth");
      }
    }

    prevLengthRef.current = results.length;
  }, [results, currentUserId, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (container.scrollTop < 100 && status === "CanLoadMore") {
      loadMore(30);
    }
  }, [status, loadMore]);

  const messages = results ? [...results].reverse() : [];

  if (results === undefined || (status === "LoadingFirstPage")) {
    return (
      <div className="flex-1 space-y-4 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`flex gap-2 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}
          >
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
            <Skeleton
              className={`h-12 rounded-2xl ${i % 2 === 0 ? "w-48" : "w-36"}`}
            />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <p className="text-sm">No messages yet. Say hello!</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex flex-1 flex-col overflow-y-auto px-4 py-2"
    >
      {status === "LoadingMore" && (
        <div className="flex justify-center py-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {status === "CanLoadMore" && (
        <button
          onClick={() => loadMore(30)}
          className="mb-2 self-center rounded-full bg-muted px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent"
        >
          Load older messages
        </button>
      )}

      {messages.map((message, index) => {
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const nextMessage =
          index < messages.length - 1 ? messages[index + 1] : null;

        const isOwn = message.senderId === currentUserId;
        const isSameSenderAsPrev =
          prevMessage?.senderId === message.senderId;
        const isSameSenderAsNext =
          nextMessage?.senderId === message.senderId;

        const prevTime = prevMessage?.createdAt ?? 0;
        const timeDiff = message.createdAt - prevTime;
        const isNewTimeGroup = timeDiff > 300000; // 5 minutes

        const showAvatar = !isSameSenderAsPrev || isNewTimeGroup;
        const showName = showAvatar;
        const isFirstInGroup = !isSameSenderAsPrev || isNewTimeGroup;
        const isLastInGroup = !isSameSenderAsNext || !!(nextMessage && nextMessage.createdAt - message.createdAt > 300000);

        const prevDate = prevMessage
          ? new Date(prevMessage.createdAt).toDateString()
          : null;
        const currentDate = new Date(message.createdAt).toDateString();
        const showDateSeparator = prevDate !== currentDate;

        return (
          <div key={message._id}>
            {showDateSeparator && (
              <div className="flex items-center justify-center py-4">
                <span className="rounded-full bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
                  {formatDate(message.createdAt)}
                </span>
              </div>
            )}
            <MessageBubble
              content={message.content}
              senderId={message.senderId}
              senderName={
                message.senderProfile?.displayName ?? "Unknown"
              }
              senderAvatarColor={message.senderProfile?.avatarColor}
              senderAvatarUrl={message.senderProfile?.avatarUrl}
              createdAt={message.createdAt}
              type={message.type}
              isOwn={isOwn}
              showAvatar={showAvatar}
              showName={showName}
              isFirstInGroup={isFirstInGroup}
              isLastInGroup={isLastInGroup}
            />
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}
