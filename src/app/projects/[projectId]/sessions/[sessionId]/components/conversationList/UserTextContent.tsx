import { ChevronDown, FileIcon, InfoIcon, Terminal } from "lucide-react";
import { type FC, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { parseUserMessage } from "../../../../../../../server/core/claude-code/functions/parseUserMessage";
import { MarkdownContent } from "../../../../../../components/MarkdownContent";

/**
 * Extracts system context tags from user message text.
 * Returns the main content and extracted system context blocks.
 */
const extractSystemContext = (text: string) => {
  const systemContextBlocks: Array<{
    type: "ide_opened_file" | "system_reminder" | "ide_selection";
    content: string;
  }> = [];

  // Extract ide_opened_file tags
  const ideOpenedFileRegex =
    /<ide_opened_file>([\s\S]*?)<\/ide_opened_file>/g;
  let match;
  while ((match = ideOpenedFileRegex.exec(text)) !== null) {
    const content = match[1];
    if (content !== undefined) {
      systemContextBlocks.push({
        type: "ide_opened_file",
        content: content.trim(),
      });
    }
  }

  // Extract ide-opened-file tags (hyphenated variant)
  const ideOpenedFileHyphenRegex =
    /<ide-opened-file>([\s\S]*?)<\/ide-opened-file>/g;
  while ((match = ideOpenedFileHyphenRegex.exec(text)) !== null) {
    const content = match[1];
    if (content !== undefined) {
      systemContextBlocks.push({
        type: "ide_opened_file",
        content: content.trim(),
      });
    }
  }

  // Extract system-reminder tags
  const systemReminderRegex =
    /<system-reminder>([\s\S]*?)<\/system-reminder>/g;
  while ((match = systemReminderRegex.exec(text)) !== null) {
    const content = match[1];
    if (content !== undefined) {
      systemContextBlocks.push({
        type: "system_reminder",
        content: content.trim(),
      });
    }
  }

  // Extract ide_selection tags
  const ideSelectionRegex = /<ide_selection>([\s\S]*?)<\/ide_selection>/g;
  while ((match = ideSelectionRegex.exec(text)) !== null) {
    const content = match[1];
    if (content !== undefined) {
      systemContextBlocks.push({
        type: "ide_selection",
        content: content.trim(),
      });
    }
  }

  // Remove all system context tags from main content
  const mainContent = text
    .replace(/<ide_opened_file>[\s\S]*?<\/ide_opened_file>/g, "")
    .replace(/<ide-opened-file>[\s\S]*?<\/ide-opened-file>/g, "")
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "")
    .replace(/<ide_selection>[\s\S]*?<\/ide_selection>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { mainContent, systemContextBlocks };
};

/**
 * Renders a collapsible system context block
 */
const SystemContextBlock: FC<{
  type: "ide_opened_file" | "system_reminder" | "ide_selection";
  content: string;
}> = ({ type, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  const config = {
    ide_opened_file: {
      icon: FileIcon,
      label: "IDE Context: File Opened",
      bgColor: "bg-blue-50/50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      iconColor: "text-blue-500 dark:text-blue-400",
    },
    system_reminder: {
      icon: InfoIcon,
      label: "System Context",
      bgColor: "bg-amber-50/50 dark:bg-amber-950/20",
      borderColor: "border-amber-200 dark:border-amber-800",
      iconColor: "text-amber-500 dark:text-amber-400",
    },
    ide_selection: {
      icon: FileIcon,
      label: "IDE Context: Selection",
      bgColor: "bg-purple-50/50 dark:bg-purple-950/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      iconColor: "text-purple-500 dark:text-purple-400",
    },
  };

  const { icon: Icon, label, bgColor, borderColor, iconColor } = config[type];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={`${bgColor} ${borderColor} border rounded-lg mb-2 overflow-hidden`}
      >
        <CollapsibleTrigger className="w-full px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
          <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
          <span className="flex-1 text-left font-medium">{label}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-2 pt-0">
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
              {content}
            </pre>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export const UserTextContent: FC<{ text: string; id?: string }> = ({
  text,
  id,
}) => {
  const { mainContent, systemContextBlocks } = extractSystemContext(text);
  const parsed = parseUserMessage(mainContent || text);

  // Render system context blocks first (if any)
  const contextBlocks = systemContextBlocks.map((block, index) => (
    <SystemContextBlock
      key={`${block.type}-${index}`}
      type={block.type}
      content={block.content}
    />
  ));

  if (parsed.kind === "command") {
    return (
      <div id={id}>
        {contextBlocks}
        <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20 gap-2 py-3 mb-3">
          <CardHeader className="py-0 px-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-green-600 dark:text-green-400" />
              <CardTitle className="text-sm font-medium">
                Claude Code Command
              </CardTitle>
              <Badge
                variant="outline"
                className="border-green-300 text-green-700 dark:border-green-700 dark:text-green-300"
              >
                {parsed.commandName}
              </Badge>
            </div>
          </CardHeader>
          {parsed.commandArgs || parsed.commandMessage ? (
            <CardContent className="py-0 px-4">
              <div className="space-y-2">
                <div>
                  {parsed.commandArgs && (
                    <>
                      <span className="text-xs font-medium text-muted-foreground">
                        Arguments:
                      </span>
                      <div className="bg-background rounded border p-2 mt-1">
                        <code className="text-xs whitespace-pre-line break-all">
                          {parsed.commandArgs}
                        </code>
                      </div>
                    </>
                  )}
                  {parsed.commandMessage && (
                    <>
                      <span className="text-xs font-medium text-muted-foreground">
                        Message:
                      </span>
                      <div className="bg-background rounded border p-2 mt-1">
                        <code className="text-xs whitespace-pre-line break-all">
                          {parsed.commandMessage}
                        </code>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          ) : null}
        </Card>
      </div>
    );
  }

  if (parsed.kind === "local-command") {
    return (
      <div id={id}>
        {contextBlocks}
        <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20 gap-2 py-3 mb-3">
          <CardHeader className="py-0 px-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-green-600 dark:text-green-400" />
              <CardTitle className="text-sm font-medium">
                Local Command
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="py-0 px-4">
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words">
              {parsed.stdout}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If there's only system context and no main content, just show the context blocks
  if (!mainContent && systemContextBlocks.length > 0) {
    return <div id={id}>{contextBlocks}</div>;
  }

  return (
    <div id={id}>
      {contextBlocks}
      <MarkdownContent
        className="w-full px-3 py-3 mb-5 border border-border rounded-lg bg-slate-50 dark:bg-slate-900/50"
        content={parsed.content}
      />
    </div>
  );
};
