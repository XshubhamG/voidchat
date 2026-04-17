"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConversationItem } from "./conversation-item";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";

export function ConversationList() {
  const conversations = useQuery(api.conversations.listConversations);

  if (conversations === undefined) {
    return (
      <div className="space-y-2 p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-40" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-muted-foreground">
        <div className="rounded-full bg-gradient-to-br from-primary/10 to-pastel-purple/10 p-4">
          <MessageSquare className="h-7 w-7 text-primary/60" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground/80">No conversations yet</p>
          <p className="mt-1 text-xs">Start a new chat to begin messaging</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div role="list" aria-label="Conversations" className="space-y-0.5 p-2">
        {conversations.map((conv) =>
          conv ? (
            <ConversationItem
              key={conv._id}
              conversationId={conv._id}
              type={conv.type}
              otherProfiles={conv.otherProfiles.filter(
                (p): p is NonNullable<typeof p> => p !== null,
              )}
              lastMessagePreview={conv.lastMessagePreview}
              lastMessageAt={conv.lastMessageAt}
              unreadCount={conv.unreadCount}
            />
          ) : null,
        )}
      </div>
    </ScrollArea>
  );
}
