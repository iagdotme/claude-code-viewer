import { Bot, User } from "lucide-react";
import type { FC } from "react";
import { useConfig } from "@/app/hooks/useConfig";
import { formatLocaleDate } from "@/lib/date/formatLocaleDate";
import { AI_ASSISTANT_NAME } from "@/lib/constants/aiAssistant";

export type MessageSender = "assistant" | "user" | "system";

export const MessageHeader: FC<{
  sender: MessageSender;
  timestamp: string;
}> = ({ sender, timestamp }) => {
  const { config } = useConfig();

  const getSenderInfo = () => {
    switch (sender) {
      case "assistant":
        return {
          name: AI_ASSISTANT_NAME,
          icon: Bot,
          iconColor: "text-blue-600 dark:text-blue-400",
        };
      case "user":
        return {
          name: "You",
          icon: User,
          iconColor: "text-green-600 dark:text-green-400",
        };
      case "system":
        return {
          name: "System",
          icon: Bot,
          iconColor: "text-gray-600 dark:text-gray-400",
        };
    }
  };

  const { name, icon: Icon, iconColor } = getSenderInfo();

  return (
    <div className="flex items-center justify-between mt-6 mb-3 px-2">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${iconColor}`} />
        <span className="text-sm font-semibold">{name}</span>
      </div>
      <span className="text-xs text-muted-foreground">
        {formatLocaleDate(timestamp, {
          locale: config.locale,
          target: "timeOnly",
        })}
      </span>
    </div>
  );
};
