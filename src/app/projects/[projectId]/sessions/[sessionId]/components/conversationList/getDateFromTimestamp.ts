/**
 * Extract just the date portion (YYYY-MM-DD) from an ISO timestamp
 * Used to compare if two messages are from the same day
 */
export const getDateFromTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    return date.toISOString().split("T")[0] ?? "";
  } catch {
    return "";
  }
};

/**
 * Check if two timestamps are from the same day
 */
export const isSameDay = (
  timestamp1: string,
  timestamp2: string
): boolean => {
  return getDateFromTimestamp(timestamp1) === getDateFromTimestamp(timestamp2);
};
