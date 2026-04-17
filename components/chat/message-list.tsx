"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MessageBubble } from "./message-bubble";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

interface PendingMessage {
  _id: string;
  content: string;
  senderId: string;
  senderProfile: { displayName: string; avatarColor?: string; avatarUrl?: string | null };
  createdAt: number;
  type: "text";
  conversationId: Id<"conversations">;
}

interface MessageListProps {
  conversationId: Id<"conversations">;
  currentUserId: string;
  pendingMessages?: PendingMessage[];
}

export function MessageList({
  conversationId,
  currentUserId,
  pendingMessages = [],
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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isLoadingMoreRef = useRef(false);

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

      if (isLoadingMoreRef.current) {
        const container = containerRef.current;
        if (container) {
          requestAnimationFrame(() => {
            isLoadingMoreRef.current = false;
          });
        }
      } else {
        const lastNew = results[results.length - 1];
        const isOwnMessage = lastNew?.senderId === currentUserId;
        if (newCount <= 3 || isOwnMessage) {
          scrollToBottom("smooth");
        }
      }
    }

    prevLengthRef.current = results.length;
  }, [results, currentUserId, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollButton(distanceFromBottom > 200);

    if (container.scrollTop < 100 && status === "CanLoadMore") {
      isLoadingMoreRef.current = true;
      const prevScrollHeight = container.scrollHeight;
      loadMore(30);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop += newScrollHeight - prevScrollHeight;
        });
      });
    }
  }, [status, loadMore]);

  const messages = results ? [...results].reverse() : [];

  if (results === undefined || status === "LoadingFirstPage") {
    return (
      <div className="flex-1 space-y-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => {
          const isRight = i % 3 === 1;
          const widths = ["w-52", "w-40", "w-56", "w-44", "w-48", "w-36"];
          return (
            <div
              key={i}
              className={`flex gap-2 ${isRight ? "flex-row-reverse" : ""}`}
            >
              {!isRight && (
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              )}
              <div className={`flex flex-col gap-1 ${isRight ? "items-end" : "items-start"}`}>
                {!isRight && i % 2 === 0 && (
                  <Skeleton className="h-3 w-16 rounded" />
                )}
                <Skeleton
                  className={`h-10 rounded-2xl ${widths[i]}`}
                />
              </div>
            </div>
          );
        })}
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
    <div className="relative flex-1">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Messages"
        className="flex h-full flex-col overflow-y-auto px-4 py-2"
      >
        {status === "LoadingMore" && (
          <div className="flex justify-center py-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {status === "CanLoadMore" && (
          <button
            onClick={() => loadMore(30)}
            className="mb-2 self-center rounded-full bg-muted px-4 py-1.5 text-xs text-muted-foreground transition-colors duration-150 hover:bg-accent"
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
          const isNewTimeGroup = timeDiff > 300000;

          const showAvatar = !isSameSenderAsPrev || isNewTimeGroup;
          const showName = showAvatar;
          const isFirstInGroup = !isSameSenderAsPrev || isNewTimeGroup;
          const isLastInGroup =
            !isSameSenderAsNext ||
            !!(
              nextMessage &&
              nextMessage.createdAt - message.createdAt > 300000
            );

          const prevDate = prevMessage
            ? new Date(prevMessage.createdAt).toDateString()
            : null;
          const currentDate = new Date(message.createdAt).toDateString();
          const showDateSeparator = prevDate !== currentDate;

          return (
            <motion.div
              key={message._id}
              initial={{ opacity: 0, x: isOwn ? 12 : -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {showDateSeparator && (
                <div className="flex items-center gap-3 py-4">
                  <div className="h-px flex-1 bg-border/30" />
                  <span className="shrink-0 rounded-full bg-muted/50 px-3 py-1 text-[11px] text-muted-foreground">
                    {formatDate(message.createdAt)}
                  </span>
                  <div className="h-px flex-1 bg-border/30" />
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
            </motion.div>
          );
        })}

        {pendingMessages.map((msg) => (
          <motion.div
            key={msg._id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <MessageBubble
              content={msg.content}
              senderId={msg.senderId}
              senderName={msg.senderProfile.displayName}
              senderAvatarColor={msg.senderProfile.avatarColor}
              senderAvatarUrl={msg.senderProfile.avatarUrl}
              createdAt={msg.createdAt}
              type={msg.type}
              isOwn={true}
              showAvatar={false}
              showName={false}
              isFirstInGroup={true}
              isLastInGroup={true}
              isPending={true}
            />
          </motion.div>
        ))}

        <div ref={bottomRef} />
      </div>

      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={() => scrollToBottom("smooth")}
            className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-card/90 shadow-lg shadow-black/10 ring-1 ring-border/50 backdrop-blur-sm transition-colors duration-150 hover:bg-accent"
            aria-label="Scroll to bottom"
          >
            <ChevronDown className="h-4 w-4 text-foreground" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
