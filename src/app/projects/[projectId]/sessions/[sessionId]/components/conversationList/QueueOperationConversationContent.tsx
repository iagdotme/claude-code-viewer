import { ChevronDown, SendIcon, PlayIcon } from "lucide-react";
import { type FC, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useConfig } from "@/app/hooks/useConfig";
import { formatLocaleDate } from "@/lib/date/formatLocaleDate";
import { normalizeQueueOperationContent } from "@/lib/conversation-schema/entry/normalizeQueueOperationContent";
import type { QueueOperationEntry } from "@/lib/conversation-schema/entry/QueueOperationEntrySchema";
import { AI_ASSISTANT_NAME } from "@/lib/constants/aiAssistant";

export const QueueOperationConversationContent: FC<{
  conversation: QueueOperationEntry;
}> = ({ conversation }) => {
  const { config } = useConfig();
  const [isHovered, setIsHovered] = useState(false);

  // User-friendly labels
  const isEnqueue = conversation.operation === "enqueue";
  const title = isEnqueue
    ? `Message sent to ${AI_ASSISTANT_NAME}`
    : "Processing Started";
  const Icon = isEnqueue ? SendIcon : PlayIcon;

  const formattedTime = formatLocaleDate(conversation.timestamp, {
    locale: config.locale,
    target: "timeOnly",
  });

  return (
    <div
      className="mb-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Collapsible>
        <CollapsibleTrigger asChild>
          <div
            className={`cursor-pointer transition-all duration-200 px-2 py-1.5 rounded ${
              isHovered
                ? "bg-gray-50/50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800"
                : "bg-transparent border border-transparent"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`flex items-center justify-center rounded-full p-1 transition-all duration-200 ${
                  isHovered ? "bg-gray-100 dark:bg-gray-900/40" : ""
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 flex-shrink-0 transition-colors duration-200 ${
                    isHovered
                      ? "text-gray-600 dark:text-gray-400"
                      : "text-muted-foreground"
                  }`}
                />
              </div>
              <div
                className={`flex-1 transition-all duration-200 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
              >
                <span className="text-sm font-medium">{title}</span>
              </div>
              <span className="text-xs text-muted-foreground/60 ml-auto flex-shrink-0">
                {formattedTime}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-muted-foreground transition-all duration-200 flex-shrink-0 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
          </div>
        </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="bg-background rounded border p-3 mt-2">
          <div className="space-y-2 text-xs">
            <div>
              <span className="font-medium text-muted-foreground">
                Session ID:
              </span>{" "}
              <span className="font-mono text-muted-foreground/80">
                {conversation.sessionId}
              </span>
            </div>
            {isEnqueue && (
              <div>
                <span className="font-medium text-muted-foreground">
                  Message Content:
                </span>
                <pre className="mt-1 overflow-x-auto whitespace-pre-wrap text-muted-foreground/80">
                  {normalizeQueueOperationContent(conversation.content)}
                </pre>
              </div>
            )}
          </div>
        </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
