"use client";

import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/layout/user-avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bot } from "lucide-react";

interface ChatHeaderProps {
  name: string;
  avatarUrl?: string | null;
  avatarColor?: string;
  type: string;
}

export function ChatHeader({ name, avatarUrl, avatarColor, type }: ChatHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex items-center gap-3 border-b border-border/50 bg-card/50 px-4 py-3">
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 md:hidden"
        onClick={() => router.push("/chat")}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      {type === "ai" ? (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500">
          <Bot className="h-5 w-5 text-white" />
        </div>
      ) : (
        <UserAvatar
          name={name}
          avatarUrl={avatarUrl}
          avatarColor={avatarColor}
          size="md"
        />
      )}
      <div className="min-w-0">
        <h2 className="truncate text-sm font-semibold">{name}</h2>
        {type === "ai" && (
          <p className="text-xs text-muted-foreground">Powered by OpenRouter</p>
        )}
      </div>
    </header>
  );
}
