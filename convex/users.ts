import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) return null;

    const userId = String(authUser._id);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    return profile ? { ...profile, authUser } : null;
  },
});

export const getProfileByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const storeProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");

    const userId = String(authUser._id);

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existing) return existing._id;

    const PASTEL_COLORS = [
      "#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF",
      "#E8BAFF", "#FFB3E6", "#B3FFE0", "#B3D4FF", "#FFD4B3",
      "#D4B3FF", "#B3FFD4", "#FFB3D4", "#B3FFB3", "#D4FFB3",
      "#FFE8B3", "#B3E8FF", "#FFB3FF", "#B3FFFF", "#FFCBA4",
    ];
    let hash = 0;
    const name = authUser.name ?? userId;
    for (let i = 0; i < name.length; i++) {
      hash = (hash << 5) - hash + name.charCodeAt(i);
      hash |= 0;
    }
    const avatarColor = PASTEL_COLORS[Math.abs(hash) % PASTEL_COLORS.length];

    return await ctx.db.insert("profiles", {
      userId,
      displayName: authUser.name ?? "Anonymous",
      avatarColor,
      createdAt: Date.now(),
    });
  },
});

export const updateProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");

    const userId = String(authUser._id);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile not found");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.displayName !== undefined) updates.displayName = args.displayName;
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;

    await ctx.db.patch(profile._id, updates);
  },
});

export const searchUsers = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) return [];

    const allProfiles = await ctx.db.query("profiles").collect();

    const userId = String(authUser._id);
    return allProfiles
      .filter(
        (p) =>
          p.userId !== userId &&
          p.displayName.toLowerCase().includes(args.searchTerm.toLowerCase()),
      )
      .slice(0, 20);
  },
});
