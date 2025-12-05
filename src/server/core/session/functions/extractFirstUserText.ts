import type { ExtendedConversation } from "../../types";

/**
 * Strips system context tags from user message text.
 * These tags are injected by IDEs/editors and shouldn't be used for titles.
 */
const stripSystemContextTags = (text: string): string => {
  return text
    // Remove <ide_opened_file>...</ide_opened_file> tags
    .replace(/<ide_opened_file>[\s\S]*?<\/ide_opened_file>/g, "")
    // Remove <ide-opened-file>...</ide-opened-file> tags (hyphenated variant)
    .replace(/<ide-opened-file>[\s\S]*?<\/ide-opened-file>/g, "")
    // Remove <system-reminder>...</system-reminder> tags
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "")
    // Remove <ide_selection>...</ide_selection> tags
    .replace(/<ide_selection>[\s\S]*?<\/ide_selection>/g, "")
    // Clean up extra whitespace left behind
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

export const extractFirstUserText = (
  conversation: ExtendedConversation,
): string | null => {
  if (conversation.type !== "user") {
    return null;
  }

  const rawText =
    typeof conversation.message.content === "string"
      ? conversation.message.content
      : (() => {
          const firstContent = conversation.message.content.at(0);
          if (firstContent === undefined) return null;
          if (typeof firstContent === "string") return firstContent;
          if (firstContent.type === "text") return firstContent.text;
          return null;
        })();

  if (rawText === null) {
    return null;
  }

  // Strip system context tags for title generation
  const cleanedText = stripSystemContextTags(rawText);

  // If the message was only system tags, return null
  if (cleanedText === "") {
    return null;
  }

  return cleanedText;
};
