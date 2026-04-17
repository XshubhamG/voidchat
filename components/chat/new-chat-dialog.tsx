"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/layout/user-avatar";
import { MessageSquarePlus, Bot } from "lucide-react";

export function NewChatDialog() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const searchResults = useQuery(
    api.users.searchUsers,
    search.length >= 1 ? { searchTerm: search } : "skip",
  );

  const getOrCreateDM = useMutation(api.conversations.getOrCreateDM);
  const getOrCreateAIChat = useMutation(api.conversations.getOrCreateAIChat);

  async function handleSelectUser(userId: string) {
    const conversationId = await getOrCreateDM({ otherUserId: userId });
    setOpen(false);
    setSearch("");
    router.push(`/chat/${conversationId}`);
  }

  async function handleStartAIChat() {
    const conversationId = await getOrCreateAIChat();
    setOpen(false);
    setSearch("");
    router.push(`/chat/${conversationId}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="ghost" size="icon" className="shrink-0" aria-label="New conversation" />}
      >
        <MessageSquarePlus className="h-5 w-5" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <button
            onClick={handleStartAIChat}
            className="flex w-full items-center gap-3 rounded-lg border border-border/50 p-3 text-left transition-colors hover:bg-accent"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">AI Assistant</p>
              <p className="text-xs text-muted-foreground">
                Chat with AI models via OpenRouter
              </p>
            </div>
          </button>

          <div className="relative">
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className="max-h-64 space-y-1 overflow-y-auto">
            {search.length >= 1 && searchResults?.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No users found
              </p>
            )}
            {searchResults?.map((profile) => (
              <button
                key={profile._id}
                onClick={() => handleSelectUser(profile.userId)}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent"
              >
                <UserAvatar
                  name={profile.displayName}
                  avatarUrl={profile.avatarUrl}
                  avatarColor={profile.avatarColor}
                  size="sm"
                />
                <p className="text-sm font-medium">{profile.displayName}</p>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
