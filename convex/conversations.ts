import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

export const getOrCreateDM = mutation({
  args: { otherUserId: v.string() },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");
    const userId = String(authUser._id);

    const myMemberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const membership of myMemberships) {
      const conversation = await ctx.db.get(membership.conversationId);
      if (!conversation || conversation.type !== "dm") continue;

      const otherMembers = await ctx.db
        .query("conversationMembers")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", membership.conversationId),
        )
        .collect();

      const hasOther = otherMembers.some(
        (m) => m.userId === args.otherUserId,
      );
      if (hasOther) return membership.conversationId;
    }

    const now = Date.now();
    const conversationId = await ctx.db.insert("conversations", {
      type: "dm",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId,
      unreadCount: 0,
      joinedAt: now,
    });

    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: args.otherUserId,
      unreadCount: 0,
      joinedAt: now,
    });

    return conversationId;
  },
});

export const listConversations = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) return [];
    const userId = String(authUser._id);

    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const conversations = await Promise.all(
      memberships.map(async (membership) => {
        const conversation = await ctx.db.get(membership.conversationId);
        if (!conversation) return null;

        const members = await ctx.db
          .query("conversationMembers")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", membership.conversationId),
          )
          .collect();

        const otherMembers = members.filter((m) => m.userId !== userId);

        const otherProfiles = await Promise.all(
          otherMembers.map(async (m) => {
            return await ctx.db
              .query("profiles")
              .withIndex("by_userId", (q) => q.eq("userId", m.userId))
              .unique();
          }),
        );

        return {
          ...conversation,
          membership,
          otherProfiles: otherProfiles.filter(Boolean),
          unreadCount: membership.unreadCount,
        };
      }),
    );

    return conversations
      .filter(Boolean)
      .sort((a, b) => b!.updatedAt - a!.updatedAt);
  },
});

export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) return null;
    const userId = String(authUser._id);

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user_and_conversation", (q) =>
        q.eq("userId", userId).eq("conversationId", args.conversationId),
      )
      .unique();

    if (!membership) return null;

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    const members = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();

    const profiles = await Promise.all(
      members.map(async (m) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", m.userId))
          .unique();
        return { ...m, profile };
      }),
    );

    return {
      ...conversation,
      members: profiles,
      currentUserId: userId,
    };
  },
});

export const getOrCreateAIChat = mutation({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");
    const userId = String(authUser._id);

    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const membership of memberships) {
      const conversation = await ctx.db.get(membership.conversationId);
      if (conversation?.type === "ai") return membership.conversationId;
    }

    const now = Date.now();
    const conversationId = await ctx.db.insert("conversations", {
      type: "ai",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId,
      unreadCount: 0,
      joinedAt: now,
    });

    return conversationId;
  },
});

export const markAsRead = mutation({
  args: { conversationId: v.id("conversations") },
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

    if (membership) {
      await ctx.db.patch(membership._id, { unreadCount: 0 });
    }
  },
});
