"use client";

import { ConversationList } from "@/components/chat/conversation-list";
import { NewChatDialog } from "@/components/chat/new-chat-dialog";
import { UserMenu } from "./user-menu";

export function Sidebar() {
  return (
    <aside className="flex h-full w-full flex-col border-r border-border/50 bg-card/50 backdrop-blur-sm md:w-80 lg:w-96">
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <h1 className="bg-gradient-to-r from-primary to-pastel-purple bg-clip-text text-xl font-bold tracking-tight text-transparent">
          VoidChat
        </h1>
        <NewChatDialog />
      </div>
      <ConversationList />
      <div className="border-t border-border/30 p-2">
        <UserMenu />
      </div>
    </aside>
  );
}
