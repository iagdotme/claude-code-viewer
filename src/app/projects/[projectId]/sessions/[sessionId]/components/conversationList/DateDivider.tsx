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
    target: "full",
  });

  // Both first and subsequent date dividers use the same style with full-width lines
  return (
    <div className={`flex items-center w-full ${isFirst ? "py-4 mb-2" : "py-4 my-2"}`}>
      <div className="flex-1 h-px bg-border" />
      <span className="px-4 text-xs font-medium text-muted-foreground whitespace-nowrap">
        {formattedDate}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
};
