"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const chat = action({
  args: {
    conversationId: v.id("conversations"),
    userMessage: v.string(),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(api.messages.send, {
      conversationId: args.conversationId,
      content: args.userMessage,
    });

    const model = args.model ?? "openai/gpt-4o-mini";

    try {
      const result = await generateText({
        model: openrouter(model),
        messages: [
          {
            role: "system",
            content:
              "You are a helpful AI assistant in VoidChat. Be concise, friendly, and helpful.",
          },
          { role: "user", content: args.userMessage },
        ],
        maxOutputTokens: 2048,
      });

      await ctx.runMutation(api.messages.sendAI, {
        conversationId: args.conversationId,
        content: result.text,
      });
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error";
      await ctx.runMutation(api.messages.sendAI, {
        conversationId: args.conversationId,
        content: `Sorry, I encountered an error: ${errorMsg}`,
      });
    }
  },
});
