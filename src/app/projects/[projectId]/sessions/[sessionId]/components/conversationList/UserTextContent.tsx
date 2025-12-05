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
 * Renders a collapsible system context block with icon-only by default, expanding on hover
 */
const SystemContextBlock: FC<{
  type: "ide_opened_file" | "system_reminder" | "ide_selection";
  content: string;
}> = ({ type, content }) => {
  const [isHovered, setIsHovered] = useState(false);

  const config = {
    ide_opened_file: {
      icon: FileIcon,
      label: "IDE Context: File Opened",
      hoverBg: "bg-blue-50/50 dark:bg-blue-950/20",
      hoverBorder: "border-blue-200 dark:border-blue-800",
      iconHoverBg: "bg-blue-100 dark:bg-blue-900/40",
      iconColor: "text-blue-500 dark:text-blue-400",
    },
    system_reminder: {
      icon: InfoIcon,
      label: "System Context",
      hoverBg: "bg-amber-50/50 dark:bg-amber-950/20",
      hoverBorder: "border-amber-200 dark:border-amber-800",
      iconHoverBg: "bg-amber-100 dark:bg-amber-900/40",
      iconColor: "text-amber-500 dark:text-amber-400",
    },
    ide_selection: {
      icon: FileIcon,
      label: "IDE Context: Selection",
      hoverBg: "bg-purple-50/50 dark:bg-purple-950/20",
      hoverBorder: "border-purple-200 dark:border-purple-800",
      iconHoverBg: "bg-purple-100 dark:bg-purple-900/40",
      iconColor: "text-purple-500 dark:text-purple-400",
    },
  };

  const { icon: Icon, label, hoverBg, hoverBorder, iconHoverBg, iconColor } =
    config[type];

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
                ? `${hoverBg} border ${hoverBorder}`
                : "bg-transparent border border-transparent"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`flex items-center justify-center rounded-full p-1 transition-all duration-200 ${
                  isHovered ? iconHoverBg : ""
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 flex-shrink-0 transition-colors duration-200 ${
                    isHovered ? iconColor : "text-muted-foreground"
                  }`}
                />
              </div>
              <div
                className={`flex-1 transition-all duration-200 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {label}
                </span>
              </div>
              <ChevronDown
                className={`h-3.5 w-3.5 text-muted-foreground transition-all duration-200 flex-shrink-0 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div
            className={`${hoverBg} border ${hoverBorder} rounded-lg mt-1 overflow-hidden`}
          >
            <div className="px-3 py-2">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                {content}
              </pre>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
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
