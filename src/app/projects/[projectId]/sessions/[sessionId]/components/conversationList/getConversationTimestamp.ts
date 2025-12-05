import type { Conversation } from "@/lib/conversation-schema";

/**
 * Get the timestamp from a conversation entry
 * Different conversation types store timestamps in different places
 */
export const getConversationTimestamp = (
  conversation: Conversation
): string | null => {
  if (conversation.type === "summary") {
    return null; // Summary doesn't have a timestamp
  }

  if (conversation.type === "file-history-snapshot") {
    return conversation.snapshot.timestamp;
  }

  if (conversation.type === "queue-operation") {
    return conversation.timestamp;
  }

  // user, assistant, system all have timestamp in BaseEntry
  return conversation.timestamp;
};
