import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { authComponent } from "./auth";

export const list = query({
  args: {
    conversationId: v.id("conversations"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");
    const userId = String(authUser._id);

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user_and_conversation", (q) =>
        q.eq("userId", userId).eq("conversationId", args.conversationId),
      )
      .unique();

    if (!membership) throw new Error("Not a member of this conversation");

    const results = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("desc")
      .paginate(args.paginationOpts);

    const messagesWithProfiles = await Promise.all(
      results.page.map(async (message) => {
        const senderProfile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", message.senderId))
          .unique();

        return {
          ...message,
          senderProfile,
        };
      }),
    );

    return {
      ...results,
      page: messagesWithProfiles,
    };
  },
});

export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");
    const userId = String(authUser._id);

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user_and_conversation", (q) =>
        q.eq("userId", userId).eq("conversationId", args.conversationId),
      )
      .unique();

    if (!membership) throw new Error("Not a member of this conversation");

    const now = Date.now();

    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: userId,
      content: args.content,
      type: "text",
      createdAt: now,
    });

    const preview =
      args.content.length > 100
        ? args.content.slice(0, 100) + "..."
        : args.content;

    await ctx.db.patch(args.conversationId, {
      updatedAt: now,
      lastMessagePreview: preview,
      lastMessageAt: now,
    });

    const allMembers = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();

    for (const member of allMembers) {
      if (member.userId !== userId) {
        await ctx.db.patch(member._id, {
          unreadCount: member.unreadCount + 1,
        });
      }
    }
  },
});

export const sendAI = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: "ai-assistant",
      content: args.content,
      type: "ai",
      createdAt: now,
    });

    const preview =
      args.content.length > 100
        ? args.content.slice(0, 100) + "..."
        : args.content;

    await ctx.db.patch(args.conversationId, {
      updatedAt: now,
      lastMessagePreview: preview,
      lastMessageAt: now,
    });
  },
});
