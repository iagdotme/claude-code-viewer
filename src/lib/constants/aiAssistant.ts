/**
 * AI Assistant configuration
 * This allows easy switching between different AI coding assistants in the future
 */
export const AI_ASSISTANT_NAME = "Claude Code";

/**
 * Get the display name for the AI assistant
 * Can be extended in the future to support multiple AI providers
 */
export const getAiAssistantName = () => AI_ASSISTANT_NAME;
