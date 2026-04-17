"use client";

import { useState, useRef } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Loader2 } from "lucide-react";

interface MessageInputProps {
  conversationId: Id<"conversations">;
  isAIChat?: boolean;
  onSend?: () => void;
}

export function MessageInput({
  conversationId,
  isAIChat,
  onSend,
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendMessage = useMutation(api.messages.send);
  const sendAIMessage = useAction(api.ai.chat);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setContent("");

    try {
      if (isAIChat) {
        await sendAIMessage({ conversationId, userMessage: trimmed });
      } else {
        await sendMessage({ conversationId, content: trimmed });
      }
      onSend?.();
    } catch {
      setContent(trimmed);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t border-border/50 bg-card/50 p-4"
    >
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          autoResize();
        }}
        onKeyDown={handleKeyDown}
        placeholder={
          isAIChat ? "Ask the AI anything..." : "Type a message..."
        }
        rows={1}
        disabled={sending && isAIChat}
        className="flex-1 resize-none rounded-xl border border-border/50 bg-background px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!content.trim() || sending}
        className="shrink-0 rounded-xl"
      >
        {sending && isAIChat ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <SendHorizontal className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}
