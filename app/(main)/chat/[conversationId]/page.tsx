"use client";

import { use } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Sidebar } from "@/components/layout/sidebar";
import { ChatView } from "@/components/chat/chat-view";

export default function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = use(params);

  return (
    <>
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      <ChatView
        conversationId={conversationId as Id<"conversations">}
      />
    </>
  );
}
