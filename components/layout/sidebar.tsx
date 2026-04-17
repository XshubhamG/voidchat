"use client";

import { ConversationList } from "@/components/chat/conversation-list";
import { NewChatDialog } from "@/components/chat/new-chat-dialog";
import { UserMenu } from "./user-menu";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
  return (
    <aside className="flex h-full w-full flex-col border-r border-border/50 bg-card/50 md:w-80 lg:w-96">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-lg font-bold tracking-tight">VoidChat</h1>
        <NewChatDialog />
      </div>
      <Separator className="opacity-50" />
      <ConversationList />
      <Separator className="opacity-50" />
      <div className="p-2">
        <UserMenu />
      </div>
    </aside>
  );
}
