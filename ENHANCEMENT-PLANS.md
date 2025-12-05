# Claude Code Viewer - Enhancement Roadmap

This document tracks planned enhancements for the [claude-code-viewer](https://github.com/iagdotme/claude-code-viewer) fork.

**Repository**: https://github.com/iagdotme/claude-code-viewer
**Running at**: http://localhost:3400
**Start**: `docker-compose -f docker-compose.dev.yml up -d`

---

## Phase 1: Production Deployment

### Caddy + SSL Setup
- [ ] Create production `docker-compose.prod.yml`
- [ ] Add Caddy service with automatic SSL
- [ ] Configure reverse proxy to app
- [ ] Add basic authentication option
- [ ] Add IP whitelist option
- [ ] Test with custom domain

### Security Hardening
- [ ] Add security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- [ ] Enable gzip/zstd compression
- [ ] Set up logging to file
- [ ] Configure restart policies

---

## Phase 2: Multi-Machine Support

### Network File Monitoring
- [ ] Add support for multiple project directories via environment variable
- [ ] Create source identifier for projects from different machines
- [ ] Update UI to show source machine badge
- [ ] Handle potential session ID conflicts
- [ ] Test with NFS/SMB mounted shares

### Syncthing Integration (Optional)
- [ ] Document Syncthing setup for real-time sync
- [ ] Add docker-compose example with Syncthing service

---

## Phase 3: Multi-Tool Support

### Adapter Architecture
- [ ] Design unified message schema
- [ ] Create base `ConversationAdapter` interface
- [ ] Implement Claude Code adapter (refactor existing)
- [ ] Research and document other tool log formats:
  - [ ] Cursor (SQLite at `~/Library/Application Support/Cursor/`)
  - [ ] Aider (`.aider.chat.history.md`)
  - [ ] Continue.dev (`~/.continue/sessions/`)
- [ ] Implement adapters for priority tools
- [ ] Add tool source indicator in UI
- [ ] Update filtering to support tool type

---

## Phase 4: Central Database

### PostgreSQL Integration
- [ ] Design database schema (sources, projects, sessions, messages, tool_calls)
- [ ] Set up PostgreSQL in docker-compose
- [ ] Create database migrations
- [ ] Build ingestion service with file watching
- [ ] Add full-text search capability
- [ ] Implement analytics endpoints (usage stats, token counts)
- [ ] Update frontend for search and filtering
- [ ] Add analytics dashboard (optional)

---

## Future Ideas (Backlog)

- [ ] Export conversations to different formats (PDF, Markdown)
- [ ] Conversation sharing/collaboration features
- [ ] Token usage analytics and cost tracking dashboard
- [ ] Keyboard shortcuts for navigation
- [ ] Conversation bookmarks/favorites
- [ ] Custom themes/branding
- [ ] API for external integrations

---

## Reference: Known AI Tool Log Locations

| Tool | Location | Format |
|------|----------|--------|
| Claude Code | `~/.claude/projects/` | JSONL |
| Cursor | `~/Library/Application Support/Cursor/User/workspaceStorage/*/state.vscdb` | SQLite |
| Aider | `.aider.chat.history.md` (per project) | Markdown |
| Continue.dev | `~/.continue/sessions/` | JSON |
| GitHub Copilot | Cloud-based (no local logs) | N/A |

---

## Resources

- [Original Repository](https://github.com/d-kimuson/claude-code-viewer)
- [Caddy Documentation](https://caddyserver.com/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Effect-TS (used in codebase)](https://effect.website/)
