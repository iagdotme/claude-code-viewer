import type { FC } from "react";
import type {
  Conversation,
  SidechainConversation,
} from "@/lib/conversation-schema";
import type { ToolResultContent } from "@/lib/conversation-schema/content/ToolResultContentSchema";
import { AssistantConversationContent } from "./AssistantConversationContent";
import { FileHistorySnapshotConversationContent } from "./FileHistorySnapshotConversationContent";
import { MessageHeader } from "./MessageHeader";
import { MetaConversationContent } from "./MetaConversationContent";
import { QueueOperationConversationContent } from "./QueueOperationConversationContent";
import { SummaryConversationContent } from "./SummaryConversationContent";
import { SystemConversationContent } from "./SystemConversationContent";
import { UserConversationContent } from "./UserConversationContent";

export const ConversationItem: FC<{
  conversation: Conversation;
  getToolResult: (toolUseId: string) => ToolResultContent | undefined;
  getAgentIdForToolUse: (toolUseId: string) => string | undefined;
  isRootSidechain: (conversation: Conversation) => boolean;
  getSidechainConversationByPrompt: (
    prompt: string,
  ) => SidechainConversation | undefined;
  getSidechainConversations: (rootUuid: string) => SidechainConversation[];
  existsRelatedTaskCall: (prompt: string) => boolean;
  projectId: string;
  sessionId: string;
}> = ({
  conversation,
  getToolResult,
  getAgentIdForToolUse,
  getSidechainConversationByPrompt,
  getSidechainConversations,
  projectId,
  sessionId,
}) => {
  if (conversation.type === "summary") {
    return (
      <SummaryConversationContent>
        {conversation.summary}
      </SummaryConversationContent>
    );
  }

  if (conversation.type === "system") {
    return (
      <div>
        <MessageHeader sender="system" timestamp={conversation.timestamp} />
        <SystemConversationContent>
          {conversation.content}
        </SystemConversationContent>
      </div>
    );
  }

  if (conversation.type === "file-history-snapshot") {
    return (
      <FileHistorySnapshotConversationContent conversation={conversation} />
    );
  }

  if (conversation.type === "queue-operation") {
    return <QueueOperationConversationContent conversation={conversation} />;
  }

  if (conversation.type === "user") {
    const userConversationJsx =
      typeof conversation.message.content === "string" ? (
        <UserConversationContent
          content={conversation.message.content}
          id={`message-${conversation.uuid}`}
        />
      ) : (
        <ul className="w-full" id={`message-${conversation.uuid}`}>
          {conversation.message.content.map((content) => (
            <li key={content.toString()}>
              <UserConversationContent content={content} />
            </li>
          ))}
        </ul>
      );

    // Skip header for meta messages and tool results
    const isToolResult =
      typeof conversation.message.content !== "string" &&
      conversation.message.content.some(
        (c) => typeof c === "object" && c.type === "tool_result"
      );

    if (conversation.isMeta === true) {
      return (
        <MetaConversationContent>{userConversationJsx}</MetaConversationContent>
      );
    }

    // For tool results, don't show header
    if (isToolResult) {
      return userConversationJsx;
    }

    return (
      <div>
        <MessageHeader sender="user" timestamp={conversation.timestamp} />
        {userConversationJsx}
      </div>
    );
  }

  if (conversation.type === "assistant") {
    // Check if this is only tool_use content (no text)
    const hasTextContent = conversation.message.content.some(
      (c) => c.type === "text"
    );
    const hasOnlyToolUse =
      !hasTextContent &&
      conversation.message.content.every(
        (c) => c.type === "tool_use" || c.type === "thinking"
      );

    const content = (
      <ul className="w-full">
        {conversation.message.content.map((content) => (
          <li key={content.toString()}>
            <AssistantConversationContent
              content={content}
              getToolResult={getToolResult}
              getAgentIdForToolUse={getAgentIdForToolUse}
              getSidechainConversationByPrompt={
                getSidechainConversationByPrompt
              }
              getSidechainConversations={getSidechainConversations}
              projectId={projectId}
              sessionId={sessionId}
            />
          </li>
        ))}
      </ul>
    );

    // For tool-only messages, don't show the header (the tool icons are enough)
    if (hasOnlyToolUse) {
      return content;
    }

    return (
      <div>
        <MessageHeader sender="assistant" timestamp={conversation.timestamp} />
        {content}
      </div>
    );
  }

  return null;
};
