/**
 * Get display information for a tool based on its name and input parameters
 * Returns a user-friendly title for the tool's collapsed state
 */
export const getToolDisplayInfo = (
  toolName: string,
  input: Record<string, unknown>
): { title: string; description?: string } => {
  // For Read tool, show just the file path
  if (toolName === "Read") {
    const filePath = input.file_path as string | undefined;
    if (filePath) {
      // Extract just the filename from the path for a cleaner display
      const fileName = filePath.split("/").pop() || filePath;
      return {
        title: fileName,
        description: filePath !== fileName ? filePath : undefined,
      };
    }
  }

  // For Write tool, show the file path
  if (toolName === "Write") {
    const filePath = input.file_path as string | undefined;
    if (filePath) {
      const fileName = filePath.split("/").pop() || filePath;
      return {
        title: fileName,
        description: filePath !== fileName ? filePath : undefined,
      };
    }
  }

  // For Edit tool, show the file path
  if (toolName === "Edit") {
    const filePath = input.file_path as string | undefined;
    if (filePath) {
      const fileName = filePath.split("/").pop() || filePath;
      return {
        title: fileName,
        description: filePath !== fileName ? filePath : undefined,
      };
    }
  }

  // For Bash tool, show the command
  if (toolName === "Bash") {
    const command = input.command as string | undefined;
    if (command) {
      // Truncate long commands
      const truncated =
        command.length > 50 ? `${command.substring(0, 47)}...` : command;
      return {
        title: truncated,
        description: command.length > 50 ? command : undefined,
      };
    }
  }

  // For Grep tool, show the pattern
  if (toolName === "Grep") {
    const pattern = input.pattern as string | undefined;
    if (pattern) {
      return {
        title: `"${pattern}"`,
        description: input.path as string | undefined,
      };
    }
  }

  // For Glob tool, show the pattern
  if (toolName === "Glob") {
    const pattern = input.pattern as string | undefined;
    if (pattern) {
      return {
        title: pattern,
        description: input.path as string | undefined,
      };
    }
  }

  // For Task tool, show the description
  if (toolName === "Task") {
    const description = input.description as string | undefined;
    if (description) {
      return { title: description };
    }
    const prompt = input.prompt as string | undefined;
    if (prompt) {
      const truncated =
        prompt.length > 50 ? `${prompt.substring(0, 47)}...` : prompt;
      return { title: truncated };
    }
  }

  // For WebFetch tool, show the URL
  if (toolName === "WebFetch") {
    const url = input.url as string | undefined;
    if (url) {
      // Try to extract just the domain/path for cleaner display
      try {
        const urlObj = new URL(url);
        return {
          title: urlObj.hostname + urlObj.pathname.substring(0, 30),
          description: url,
        };
      } catch {
        return { title: url.substring(0, 50) };
      }
    }
  }

  // For WebSearch tool, show the query
  if (toolName === "WebSearch") {
    const query = input.query as string | undefined;
    if (query) {
      return { title: `"${query}"` };
    }
  }

  // For TodoWrite tool, show a summary
  if (toolName === "TodoWrite") {
    const todos = input.todos as unknown[] | undefined;
    if (todos && Array.isArray(todos)) {
      return { title: `${todos.length} todo(s)` };
    }
  }

  // Default: use description if available, otherwise first meaningful parameter
  const description = input.description as string | undefined;
  if (description) {
    const truncated =
      description.length > 60
        ? `${description.substring(0, 57)}...`
        : description;
    return { title: truncated };
  }

  // Try to find a meaningful first parameter
  const firstEntry = Object.entries(input)[0];
  if (firstEntry) {
    const [key, value] = firstEntry;
    if (typeof value === "string" && value.length > 0) {
      const truncated =
        value.length > 50 ? `${value.substring(0, 47)}...` : value;
      return { title: `${key}: ${truncated}` };
    }
  }

  // Fallback to tool name only
  return { title: "" };
};
