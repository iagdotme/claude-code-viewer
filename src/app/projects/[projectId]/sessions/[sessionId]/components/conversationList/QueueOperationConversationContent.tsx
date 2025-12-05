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

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <div
          className="flex items-center gap-2 cursor-pointer rounded p-2 -mx-2 transition-all duration-200"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className={`flex items-center justify-center rounded-full p-1.5 transition-all duration-200 ${
              isHovered
                ? "bg-muted/80"
                : "bg-transparent"
            }`}
          >
            <Icon className="h-3 w-3 text-muted-foreground" />
          </div>
          <div
            className={`flex items-center gap-2 flex-1 transition-all duration-200 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <h4 className="text-xs font-medium text-muted-foreground">
              {title}
            </h4>
            <span className="text-xs text-muted-foreground/60">
              {formatLocaleDate(conversation.timestamp, {
                locale: config.locale,
                target: "time",
              })}
            </span>
          </div>
          <ChevronDown
            className={`h-3 w-3 text-muted-foreground transition-all duration-200 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />
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
  );
};
