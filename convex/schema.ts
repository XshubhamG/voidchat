import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    userId: v.string(),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
    avatarColor: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"]),

  conversations: defineTable({
    type: v.union(
      v.literal("dm"),
      v.literal("ai"),
      v.literal("group"),
      v.literal("channel"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastMessagePreview: v.optional(v.string()),
    lastMessageAt: v.optional(v.number()),
  })
    .index("by_type", ["type"])
    .index("by_updatedAt", ["updatedAt"]),

  conversationMembers: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),
    nickname: v.optional(v.string()),
    unreadCount: v.number(),
    joinedAt: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_user", ["userId"])
    .index("by_user_and_conversation", ["userId", "conversationId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("text"),
      v.literal("ai"),
      v.literal("system"),
    ),
    createdAt: v.number(),
  })
    .index("by_conversation", ["conversationId", "createdAt"]),
});
