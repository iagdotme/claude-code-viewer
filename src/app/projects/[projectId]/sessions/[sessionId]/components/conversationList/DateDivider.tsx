import { Calendar } from "lucide-react";
import type { FC } from "react";
import { useConfig } from "@/app/hooks/useConfig";
import { formatLocaleDate } from "@/lib/date/formatLocaleDate";

export const DateDivider: FC<{
  timestamp: string;
  isFirst?: boolean;
}> = ({ timestamp, isFirst = false }) => {
  const { config } = useConfig();

  const formattedDate = formatLocaleDate(timestamp, {
    locale: config.locale,
    target: "day",
  });

  if (isFirst) {
    // First date at the top of the conversation - more prominent
    return (
      <div className="flex items-center justify-center py-4 mb-4">
        <div className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            {formattedDate}
          </span>
        </div>
      </div>
    );
  }

  // Date divider between messages
  return (
    <div className="flex items-center justify-center py-4 my-2">
      <div className="flex-1 h-px bg-border" />
      <div className="flex items-center gap-2 mx-4 text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span className="text-xs">{formattedDate}</span>
      </div>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
};
