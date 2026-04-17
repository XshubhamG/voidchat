"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  return (
    <>
      <Sidebar />
      <main className="hidden flex-1 items-center justify-center bg-background md:flex">
        <div className="flex flex-col items-center gap-5 text-muted-foreground">
          <div className="rounded-full bg-gradient-to-br from-primary/10 to-pastel-purple/10 p-7">
            <MessageSquare className="h-10 w-10 text-primary/50" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-medium text-foreground/90">
              Select a conversation
            </h2>
            <p className="mt-1.5 text-sm">
              Choose a chat from the sidebar or start a new one
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
