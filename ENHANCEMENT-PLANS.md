# Claude Code Viewer - Enhancement Plans

This document outlines potential enhancements and deployment options for the [claude-code-viewer](https://github.com/d-kimuson/claude-code-viewer) project.

## Table of Contents

1. [Current Setup](#current-setup)
2. [Alternative Installation Methods](#alternative-installation-methods)
3. [Docker Deployment](#docker-deployment)
4. [Production Deployment with Caddy & SSL](#production-deployment-with-caddy--ssl)
5. [Network File Monitoring](#network-file-monitoring)
6. [Multi-Tool Support (OpenAI Codex, etc.)](#multi-tool-support)
7. [PostgreSQL Central Database](#postgresql-central-database)
8. [UI Enhancements](#ui-enhancements)
9. [Date/Time Display Fixes](#datetime-display-fixes)

---

## Current Setup

### Development Environment (Docker)
- **Source Code**: `/Users/iagdotme/APPS/claude-code-viewer/`
- **Running via**: Docker with mounted volumes (hot reload enabled)
- **Access URL**: `http://localhost:3400`
- **Start command**: `docker-compose -f docker-compose.dev.yml up -d`
- **Stop command**: `docker-compose -f docker-compose.dev.yml down`

### Version Info
- **Package**: `@kimuson/claude-code-viewer@0.4.7`
- **Based on**: https://github.com/d-kimuson/claude-code-viewer

### How It Works
- Reads Claude Code conversation logs from `~/.claude/projects/<project>/<session-id>.jsonl`
- Provides a web UI for viewing conversation history
- Supports starting new conversations and resuming sessions
- Includes Git diff viewer for reviewing changes

### Current Configuration Options
| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `PORT` | Server port | 3400 |
| `CLAUDE_CODE_VIEWER_CC_EXECUTABLE_PATH` | Custom Claude Code path | Auto-detect |

### UI Settings (via Sidebar)
- Hide empty sessions
- Unify sessions by title
- Enter key behavior
- Permission mode (Ask/Auto-approve)
- Theme (System/Dark/Light)
- Audio notifications
- Language (English/Japanese/System)

---

## Alternative Installation Methods

### Option 1: Clone and Run Locally

```bash
# Clone the repository
git clone https://github.com/d-kimuson/claude-code-viewer.git
cd claude-code-viewer

# Install dependencies (requires pnpm)
pnpm install

# Development mode (hot reload)
pnpm dev

# Or build and run production
pnpm build
node dist/main.js
```

### Option 2: Custom Directory Installation

```bash
# Create your preferred directory
mkdir -p ~/apps/claude-code-viewer
cd ~/apps/claude-code-viewer

# Clone and setup
git clone https://github.com/d-kimuson/claude-code-viewer.git .
pnpm install
pnpm build

# Create a startup script
cat > start.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
node dist/main.js
EOF
chmod +x start.sh
```

### Option 3: Run as systemd Service (Linux)

```ini
# /etc/systemd/system/claude-code-viewer.service
[Unit]
Description=Claude Code Viewer
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/home/your-username/apps/claude-code-viewer
ExecStart=/usr/bin/node dist/main.js
Restart=on-failure
Environment=PORT=3400
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable claude-code-viewer
sudo systemctl start claude-code-viewer
```

### Option 4: Run as launchd Service (macOS)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<!-- ~/Library/LaunchAgents/com.claude-code-viewer.plist -->
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.claude-code-viewer</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/node</string>
        <string>/Users/YOUR_USERNAME/apps/claude-code-viewer/dist/main.js</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/Users/YOUR_USERNAME/apps/claude-code-viewer</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PORT</key>
        <string>3400</string>
        <key>NODE_ENV</key>
        <string>production</string>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/claude-code-viewer.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/claude-code-viewer.error.log</string>
</dict>
</plist>
```

```bash
launchctl load ~/Library/LaunchAgents/com.claude-code-viewer.plist
```

---

## Docker Deployment

### Using Existing Docker Support

The project includes `Dockerfile` and `docker-compose.yml`:

```yaml
# docker-compose.yml (customized)
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3400:3400"
    environment:
      - NODE_ENV=production
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    volumes:
      # Mount your Claude projects directory
      - ~/.claude:/root/.claude:ro
      # Optional: mount workspace for active sessions
      - workspace:/root/workspace
    restart: unless-stopped
    init: true

volumes:
  workspace:
```

### Build and Run

```bash
# Clone the repo
git clone https://github.com/d-kimuson/claude-code-viewer.git
cd claude-code-viewer

# Build the Docker image
docker-compose build

# Run the container
docker-compose up -d

# View logs
docker-compose logs -f
```

### Custom Dockerfile for Multi-Machine Setup

```dockerfile
FROM node:22-slim AS base

# Install required system dependencies
RUN apt-get update && apt-get install -y \
    git \
    openssh-client \
    nfs-common \
    cifs-utils \
    && rm -rf /var/lib/apt/lists/*

# ... rest of standard Dockerfile ...

# Add support for mounting network shares
VOLUME ["/claude-data"]
ENV CLAUDE_PROJECTS_PATH=/claude-data
```

---

## Production Deployment with Caddy & SSL

### Caddy Configuration

```
# /etc/caddy/Caddyfile

claude.yourdomain.com {
    reverse_proxy localhost:3400

    # Optional: Basic authentication
    # basicauth {
    #     admin $2a$14$your-hashed-password-here
    # }

    # Optional: IP whitelist
    # @blocked not remote_ip 192.168.1.0/24
    # respond @blocked "Access denied" 403

    # Security headers
    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        Referrer-Policy strict-origin-when-cross-origin
    }

    # Enable compression
    encode gzip zstd

    # Logging
    log {
        output file /var/log/caddy/claude-viewer.log
        format json
    }
}
```

### Docker Compose with Caddy

```yaml
version: '3.8'
services:
  claude-viewer:
    build: .
    expose:
      - "3400"
    environment:
      - NODE_ENV=production
    volumes:
      - ~/.claude:/root/.claude:ro
    restart: unless-stopped
    networks:
      - web

  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    restart: unless-stopped
    networks:
      - web

volumes:
  caddy_data:
  caddy_config:

networks:
  web:
```

### SSL with Let's Encrypt (Automatic)

Caddy automatically provisions SSL certificates. Just ensure:
1. Your domain's DNS A record points to your server
2. Ports 80 and 443 are open
3. The domain is specified in the Caddyfile

---

## Network File Monitoring

### Goal
Monitor Claude Code files from multiple computers on the network.

### Option 1: Symlink Approach (Simplest)

```bash
# On the main machine, create symlinks to network shares
cd ~/.claude/projects

# Mount network share first (macOS)
mkdir -p /Volumes/remote-claude
mount -t smbfs //user@remote-machine/claude-projects /Volumes/remote-claude

# Or use NFS
mount -t nfs remote-machine:/home/user/.claude/projects /Volumes/remote-claude

# Create symlink with prefix to identify remote projects
ln -s /Volumes/remote-claude remote-machine-projects
```

### Option 2: Environment Variable for Multiple Paths

**Proposed Enhancement**: Add support for multiple project directories.

```typescript
// Proposed configuration
interface Config {
  projectPaths: {
    name: string;        // Display name (e.g., "MacBook Pro", "Desktop")
    path: string;        // Path to .claude/projects directory
    type: 'local' | 'network' | 'ssh';
  }[];
}

// Environment variable format
CLAUDE_PROJECT_PATHS='[
  {"name": "Local", "path": "~/.claude/projects", "type": "local"},
  {"name": "Work Desktop", "path": "/mnt/work-pc/claude/projects", "type": "network"},
  {"name": "Server", "path": "ssh://server/home/user/.claude/projects", "type": "ssh"}
]'
```

### Option 3: Docker with Multiple Volume Mounts

```yaml
services:
  app:
    volumes:
      # Local machine
      - ~/.claude/projects:/claude-data/local:ro
      # Network share - Machine 2
      - /mnt/machine2-claude:/claude-data/machine2:ro
      # Network share - Machine 3
      - /mnt/machine3-claude:/claude-data/machine3:ro
    environment:
      - CLAUDE_MULTI_SOURCE=true
```

### Option 4: Real-time Sync with Syncthing

```yaml
# docker-compose.yml
services:
  syncthing:
    image: syncthing/syncthing
    volumes:
      - claude-sync:/var/syncthing
    ports:
      - "8384:8384"  # Web UI
      - "22000:22000" # Sync protocol

  claude-viewer:
    volumes:
      - claude-sync/claude-projects:/root/.claude/projects:ro
    depends_on:
      - syncthing

volumes:
  claude-sync:
```

### Implementation Notes

Changes required to support multiple sources:
1. Modify project discovery to scan multiple directories
2. Add source identifier to project/session metadata
3. Update UI to show source machine for each project
4. Handle potential ID conflicts between machines

---

## Multi-Tool Support

### Goal
Support conversation logs from other AI coding tools like OpenAI Codex.

### Current Claude Code JSONL Format

```json
{
  "parentUuid": null,
  "isSidechain": true,
  "userType": "external",
  "cwd": "/path/to/project",
  "sessionId": "d2ffe4eb-c26f-4e9c-a39b-6723ae8383ac",
  "version": "2.0.44",
  "gitBranch": "",
  "message": {
    "model": "claude-haiku-4-5-20251001",
    "id": "msg_01Jgc3NtvqBAtaGk8h1wAsAV",
    "type": "message",
    "role": "assistant",
    "content": [
      {
        "type": "text",
        "text": "Response content here..."
      }
    ],
    "stop_reason": "end_turn",
    "usage": {
      "input_tokens": 2130,
      "output_tokens": 188
    }
  },
  "type": "assistant",
  "uuid": "8543fae8-c841-46e5-9f15-0dbee8c89cee",
  "timestamp": "2025-11-18T09:46:52.907Z"
}
```

### Proposed Unified Schema

```typescript
interface UnifiedMessage {
  id: string;
  sessionId: string;
  source: 'claude-code' | 'openai-codex' | 'cursor' | 'copilot' | 'aider' | 'other';
  timestamp: Date;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: MessageContent[];
  metadata: {
    model?: string;
    tokens?: { input: number; output: number };
    cwd?: string;
    gitBranch?: string;
    toolCalls?: ToolCall[];
    [key: string]: unknown;  // Tool-specific metadata
  };
}

interface MessageContent {
  type: 'text' | 'code' | 'image' | 'file' | 'tool_use' | 'tool_result';
  content: string;
  language?: string;  // For code blocks
  mimeType?: string;  // For files/images
}
```

### Adapter Architecture

```typescript
// src/adapters/base.ts
interface ConversationAdapter {
  name: string;
  detectFormat(data: unknown): boolean;
  parseSession(filePath: string): Promise<UnifiedSession>;
  parseMessage(raw: unknown): UnifiedMessage;
}

// src/adapters/claude-code.ts
class ClaudeCodeAdapter implements ConversationAdapter {
  name = 'claude-code';

  detectFormat(data: unknown): boolean {
    return typeof data === 'object' &&
           data !== null &&
           'sessionId' in data &&
           'message' in data;
  }

  parseMessage(raw: ClaudeMessage): UnifiedMessage {
    return {
      id: raw.uuid,
      sessionId: raw.sessionId,
      source: 'claude-code',
      timestamp: new Date(raw.timestamp),
      role: raw.type as 'user' | 'assistant',
      content: this.parseContent(raw.message.content),
      metadata: {
        model: raw.message.model,
        tokens: raw.message.usage,
        cwd: raw.cwd,
        gitBranch: raw.gitBranch,
      }
    };
  }
}

// src/adapters/openai-codex.ts
class OpenAICodexAdapter implements ConversationAdapter {
  name = 'openai-codex';
  // Implementation based on Codex log format...
}

// src/adapters/cursor.ts
class CursorAdapter implements ConversationAdapter {
  name = 'cursor';
  // Cursor stores conversations in SQLite at:
  // ~/Library/Application Support/Cursor/User/workspaceStorage/*/state.vscdb
}

// src/adapters/aider.ts
class AiderAdapter implements ConversationAdapter {
  name = 'aider';
  // Aider stores in .aider.chat.history.md and .aider.input.history
}
```

### Plugin Registration

```typescript
// src/adapters/registry.ts
class AdapterRegistry {
  private adapters: Map<string, ConversationAdapter> = new Map();

  register(adapter: ConversationAdapter): void {
    this.adapters.set(adapter.name, adapter);
  }

  detectAdapter(data: unknown): ConversationAdapter | null {
    for (const adapter of this.adapters.values()) {
      if (adapter.detectFormat(data)) {
        return adapter;
      }
    }
    return null;
  }
}

// Usage
const registry = new AdapterRegistry();
registry.register(new ClaudeCodeAdapter());
registry.register(new OpenAICodexAdapter());
registry.register(new CursorAdapter());
registry.register(new AiderAdapter());
```

### Known AI Coding Tool Log Locations

| Tool | Log Location | Format |
|------|--------------|--------|
| Claude Code | `~/.claude/projects/` | JSONL |
| Cursor | `~/Library/Application Support/Cursor/User/workspaceStorage/*/state.vscdb` | SQLite |
| Aider | `.aider.chat.history.md` (per project) | Markdown |
| GitHub Copilot | No local logs (cloud-based) | N/A |
| OpenAI Codex CLI | TBD - needs research | TBD |
| Continue.dev | `~/.continue/sessions/` | JSON |

### Implementation Effort
- **Estimated time**: 2-4 weeks
- **Complexity**: Medium
- **Key challenges**:
  - Researching each tool's log format
  - Handling format differences (SQLite vs JSONL vs Markdown)
  - Normalizing tool calls/results across different schemas
  - UI updates to show tool source

---

## PostgreSQL Central Database

### Goal
Store all conversations in a central PostgreSQL database for:
- Cross-machine aggregation
- Advanced search capabilities
- Analytics and reporting
- Data persistence beyond local files

### Database Schema

```sql
-- Core tables
CREATE TABLE sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    machine_id VARCHAR(255),
    path TEXT,
    type VARCHAR(50) NOT NULL,  -- 'local', 'network', 'synced'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_synced_at TIMESTAMPTZ
);

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES sources(id),
    external_id VARCHAR(255) NOT NULL,  -- Original project path/identifier
    name VARCHAR(255) NOT NULL,
    path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_id, external_id)
);

CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    external_id VARCHAR(255) NOT NULL,  -- Original session UUID
    title VARCHAR(500),
    tool_source VARCHAR(50) NOT NULL,  -- 'claude-code', 'cursor', 'aider', etc.
    model VARCHAR(100),
    cwd TEXT,
    git_branch VARCHAR(255),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    message_count INTEGER DEFAULT 0,
    total_input_tokens BIGINT DEFAULT 0,
    total_output_tokens BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, external_id)
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id),
    external_id VARCHAR(255),  -- Original message UUID
    parent_id INTEGER REFERENCES messages(id),
    role VARCHAR(50) NOT NULL,  -- 'user', 'assistant', 'system', 'tool'
    content JSONB NOT NULL,
    model VARCHAR(100),
    input_tokens INTEGER,
    output_tokens INTEGER,
    timestamp TIMESTAMPTZ NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tool_calls (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(id),
    tool_name VARCHAR(255) NOT NULL,
    tool_input JSONB,
    tool_output JSONB,
    status VARCHAR(50),  -- 'success', 'error', 'pending'
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_sessions_project ON sessions(project_id);
CREATE INDEX idx_sessions_started ON sessions(started_at DESC);
CREATE INDEX idx_messages_session ON messages(session_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_messages_content_gin ON messages USING GIN(content);
CREATE INDEX idx_tool_calls_message ON tool_calls(message_id);
CREATE INDEX idx_tool_calls_name ON tool_calls(tool_name);

-- Full-text search
ALTER TABLE messages ADD COLUMN content_text TEXT
    GENERATED ALWAYS AS (content->>'text') STORED;
CREATE INDEX idx_messages_fts ON messages
    USING GIN(to_tsvector('english', COALESCE(content_text, '')));
```

### Ingestion Service Architecture

```typescript
// src/services/database/ingestion.ts
import { Pool } from 'pg';
import chokidar from 'chokidar';

interface IngestionConfig {
  database: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
  sources: {
    name: string;
    path: string;
    type: 'local' | 'network';
  }[];
  syncInterval: number;  // milliseconds
}

class IngestionService {
  private pool: Pool;
  private watchers: Map<string, chokidar.FSWatcher> = new Map();

  constructor(private config: IngestionConfig) {
    this.pool = new Pool(config.database);
  }

  async start(): Promise<void> {
    // Initial full sync
    await this.fullSync();

    // Set up file watchers for real-time updates
    for (const source of this.config.sources) {
      const watcher = chokidar.watch(`${source.path}/**/*.jsonl`, {
        persistent: true,
        ignoreInitial: true,
      });

      watcher.on('add', (path) => this.handleNewFile(source, path));
      watcher.on('change', (path) => this.handleFileChange(source, path));

      this.watchers.set(source.name, watcher);
    }
  }

  async fullSync(): Promise<void> {
    for (const source of this.config.sources) {
      await this.syncSource(source);
    }
  }

  private async syncSource(source: IngestionConfig['sources'][0]): Promise<void> {
    // Get or create source record
    const sourceRecord = await this.upsertSource(source);

    // Scan for all JSONL files
    const files = await glob(`${source.path}/**/*.jsonl`);

    for (const file of files) {
      await this.ingestFile(sourceRecord.id, file);
    }
  }

  private async ingestFile(sourceId: number, filePath: string): Promise<void> {
    // Parse project and session from path
    const { projectPath, sessionId } = this.parseFilePath(filePath);

    // Get or create project
    const project = await this.upsertProject(sourceId, projectPath);

    // Read and parse JSONL
    const messages = await this.parseJSONL(filePath);

    // Get or create session
    const session = await this.upsertSession(project.id, sessionId, messages);

    // Insert messages (with deduplication)
    await this.insertMessages(session.id, messages);
  }

  // ... additional methods
}
```

### API Changes

```typescript
// src/server/routes/sessions.ts
import { Hono } from 'hono';
import { Pool } from 'pg';

const app = new Hono();

// List sessions with filtering and pagination
app.get('/api/sessions', async (c) => {
  const {
    source,
    project,
    tool,
    search,
    from,
    to,
    limit = 50,
    offset = 0
  } = c.req.query();

  const pool = c.get('db') as Pool;

  let query = `
    SELECT
      s.*,
      p.name as project_name,
      src.name as source_name
    FROM sessions s
    JOIN projects p ON s.project_id = p.id
    JOIN sources src ON p.source_id = src.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramIndex = 1;

  if (source) {
    query += ` AND src.name = $${paramIndex++}`;
    params.push(source);
  }

  if (project) {
    query += ` AND p.id = $${paramIndex++}`;
    params.push(project);
  }

  if (tool) {
    query += ` AND s.tool_source = $${paramIndex++}`;
    params.push(tool);
  }

  if (search) {
    query += ` AND s.id IN (
      SELECT DISTINCT session_id FROM messages
      WHERE to_tsvector('english', content_text) @@ plainto_tsquery($${paramIndex++})
    )`;
    params.push(search);
  }

  if (from) {
    query += ` AND s.started_at >= $${paramIndex++}`;
    params.push(from);
  }

  if (to) {
    query += ` AND s.started_at <= $${paramIndex++}`;
    params.push(to);
  }

  query += ` ORDER BY s.started_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return c.json(result.rows);
});

// Full-text search across all messages
app.get('/api/search', async (c) => {
  const { q, limit = 50 } = c.req.query();
  const pool = c.get('db') as Pool;

  const result = await pool.query(`
    SELECT
      m.*,
      s.title as session_title,
      p.name as project_name,
      ts_headline('english', m.content_text, plainto_tsquery($1)) as highlight
    FROM messages m
    JOIN sessions s ON m.session_id = s.id
    JOIN projects p ON s.project_id = p.id
    WHERE to_tsvector('english', m.content_text) @@ plainto_tsquery($1)
    ORDER BY m.timestamp DESC
    LIMIT $2
  `, [q, limit]);

  return c.json(result.rows);
});

// Analytics endpoints
app.get('/api/analytics/usage', async (c) => {
  const { from, to, groupBy = 'day' } = c.req.query();
  const pool = c.get('db') as Pool;

  const result = await pool.query(`
    SELECT
      date_trunc($3, s.started_at) as period,
      COUNT(DISTINCT s.id) as session_count,
      SUM(s.message_count) as total_messages,
      SUM(s.total_input_tokens) as total_input_tokens,
      SUM(s.total_output_tokens) as total_output_tokens
    FROM sessions s
    WHERE s.started_at BETWEEN $1 AND $2
    GROUP BY period
    ORDER BY period
  `, [from, to, groupBy]);

  return c.json(result.rows);
});
```

### Docker Compose with PostgreSQL

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: claude_viewer
      POSTGRES_USER: claude
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U claude -d claude_viewer"]
      interval: 5s
      timeout: 5s
      retries: 5

  app:
    build: .
    ports:
      - "3400:3400"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://claude:${DB_PASSWORD}@db:5432/claude_viewer
      - ENABLE_DATABASE=true
    volumes:
      - ~/.claude:/claude-data/local:ro
    depends_on:
      db:
        condition: service_healthy

  # Optional: Database admin UI
  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@local.dev
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD}
    ports:
      - "5050:80"
    depends_on:
      - db

volumes:
  postgres_data:
```

### Implementation Effort
- **Estimated time**: 3-5 weeks
- **Complexity**: Medium-High
- **Key components**:
  1. Database schema design and migrations
  2. Ingestion service with file watching
  3. API layer modifications
  4. Frontend updates for search and filtering
  5. Analytics dashboard (optional)

---

## UI Enhancements

### List View for Projects

Currently, projects are displayed in a card/grid view. A list view option would provide:
- More compact display
- Better for users with many projects
- Sortable columns (name, last modified, session count)

#### Proposed Implementation

```tsx
// src/components/ProjectList.tsx
import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';

type ViewMode = 'grid' | 'list';

export function ProjectList({ projects }: { projects: Project[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  return (
    <div>
      {/* View toggle */}
      <div className="flex justify-end mb-4">
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded',
              viewMode === 'grid' && 'bg-background shadow'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded',
              viewMode === 'list' && 'bg-background shadow'
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <ProjectGrid projects={projects} />
      ) : (
        <ProjectTable projects={projects} />
      )}
    </div>
  );
}

function ProjectTable({ projects }: { projects: Project[] }) {
  const [sortField, setSortField] = useState<'name' | 'lastModified' | 'sessionCount'>('lastModified');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = [...projects].sort((a, b) => {
    const modifier = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'name') {
      return a.name.localeCompare(b.name) * modifier;
    }
    if (sortField === 'lastModified') {
      return (new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()) * modifier;
    }
    return (a.sessionCount - b.sessionCount) * modifier;
  });

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b">
          <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('name')}>
            Name {sortField === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
          </th>
          <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('lastModified')}>
            Last Modified {sortField === 'lastModified' && (sortDir === 'asc' ? '↑' : '↓')}
          </th>
          <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('sessionCount')}>
            Sessions {sortField === 'sessionCount' && (sortDir === 'asc' ? '↑' : '↓')}
          </th>
          <th className="text-left p-2">Source</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((project) => (
          <tr key={project.id} className="border-b hover:bg-muted/50">
            <td className="p-2">
              <Link to={`/projects/${project.id}`}>{project.name}</Link>
            </td>
            <td className="p-2 text-muted-foreground">
              {formatDistanceToNow(project.lastModified, { addSuffix: true })}
            </td>
            <td className="p-2">{project.sessionCount}</td>
            <td className="p-2">
              <Badge variant="outline">{project.source}</Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Implementation Effort
- **Estimated time**: 2-4 hours
- **Complexity**: Low
- **Changes required**:
  - Add view toggle component
  - Create table/list view component
  - Persist preference in localStorage or settings

---

## Date/Time Display Fixes

### Known Issues
- Last modified dates may not reflect actual file modification times
- Timezone handling may be inconsistent
- Relative time display could be improved

### Investigation Areas

1. **File system timestamps**
   ```typescript
   // Check how dates are currently obtained
   import { stat } from 'fs/promises';

   const stats = await stat(filePath);
   console.log({
     created: stats.birthtime,  // File creation time
     modified: stats.mtime,     // Last modified time
     accessed: stats.atime,     // Last access time
   });
   ```

2. **JSONL message timestamps**
   ```typescript
   // Messages have embedded timestamps
   interface Message {
     timestamp: string;  // "2025-11-18T09:46:52.907Z"
   }

   // Session "last modified" should be the latest message timestamp
   const lastMessage = messages[messages.length - 1];
   const lastModified = new Date(lastMessage.timestamp);
   ```

3. **Timezone display**
   ```typescript
   // Use user's local timezone for display
   const formatDate = (date: Date) => {
     return new Intl.DateTimeFormat(undefined, {
       dateStyle: 'medium',
       timeStyle: 'short',
     }).format(date);
   };
   ```

### Proposed Fix

```typescript
// src/utils/dates.ts
import { parseISO, isValid, max } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export function getSessionLastModified(session: Session): Date {
  // Priority order:
  // 1. Latest message timestamp in the session
  // 2. File modification time
  // 3. File creation time

  const messageTimestamps = session.messages
    .map(m => parseISO(m.timestamp))
    .filter(isValid);

  if (messageTimestamps.length > 0) {
    return max(messageTimestamps);
  }

  return session.fileStats?.mtime ?? session.fileStats?.birthtime ?? new Date(0);
}

export function formatTimestamp(date: Date, options?: { relative?: boolean }): string {
  if (options?.relative) {
    return formatDistanceToNow(date, { addSuffix: true });
  }

  // Use browser's timezone
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return formatInTimeZone(date, tz, 'MMM d, yyyy h:mm a');
}
```

### Implementation Effort
- **Estimated time**: 2-4 hours
- **Complexity**: Low
- **Changes required**:
  - Investigate current date extraction logic
  - Implement consistent timestamp handling
  - Update UI components to use new formatting

---

## Implementation Priority

| Enhancement | Priority | Effort | Dependencies | Status |
|-------------|----------|--------|--------------|--------|
| Date/Time Fixes | High | Low | None | ✅ **DONE** |
| List View UI | High | Low | None | ✅ **DONE** |
| Docker Setup | Medium | Low | None | ✅ **DONE** |
| Caddy + SSL | Medium | Low | Docker (optional) | Pending |
| Network Monitoring | Medium | Medium | Source code access | Pending |
| Multi-Tool Support | Low | Medium | Adapter architecture | Pending |
| PostgreSQL Database | Low | High | Multi-tool support (recommended) | Pending |

## Completed Work

### ✅ Docker Development Setup (2025-12-05)
- Removed global npm installation
- Cloned source repository to `/Users/iagdotme/APPS/claude-code-viewer/`
- Created `Dockerfile.dev` for development with hot reload
- Created `docker-compose.dev.yml` with mounted volumes
- Modified `vite.config.ts` to support Docker networking
- Running at http://localhost:3400

**Files created/modified:**
- `Dockerfile.dev` - Development Docker image
- `docker-compose.dev.yml` - Development compose with volume mounts
- `vite.config.ts` - Added VITE_HOST environment variable support

### ✅ Date/Time Display Fixes (2025-12-05)
- Fixed raw ISO timestamp display in QueueOperationConversationContent
- Added proper locale-aware formatting using `formatLocaleDate()`

**Files modified:**
- `src/app/projects/[projectId]/sessions/[sessionId]/components/conversationList/QueueOperationConversationContent.tsx` - Added imports for `useConfig` and `formatLocaleDate`, applied formatting to timestamp display

### ✅ Session List View Toggle (2025-12-05)
- Added new `sessionViewMode` config option ("card" | "list")
- Implemented compact list view as alternative to card view
- Added view toggle buttons in Sessions sidebar header
- List view shows: status indicator dot, title, message count, cost

**Files modified:**
- `src/server/lib/config/config.ts` - Added `sessionViewMode` to schema
- `src/app/projects/[projectId]/sessions/[sessionId]/components/sessionSidebar/SessionsTab.tsx` - Added view toggle UI and conditional rendering for card/list views
- `src/server/core/platform/services/UserConfigService.ts` - Added default `sessionViewMode`
- `src/testing/layers/testPlatformLayer.ts` - Added `sessionViewMode` to test config

## Next Steps

1. ~~**Fork the repository** to make modifications~~ → ✅ **DONE** (https://github.com/iagdotme/claude-code-viewer)
2. ~~**Set up local development environment**~~ → ✅ **DONE**
3. ~~**Start with low-effort, high-impact fixes** (dates, list view)~~ → ✅ **DONE**
4. **Implement Caddy + SSL** for production deployment
5. **Design adapter architecture** for multi-tool support
6. **Plan database schema** and migration strategy

---

## Resources

- [GitHub Repository](https://github.com/d-kimuson/claude-code-viewer)
- [Issues & Feature Requests](https://github.com/d-kimuson/claude-code-viewer/issues)
- [Caddy Documentation](https://caddyserver.com/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Effect-TS (used in codebase)](https://effect.website/)
