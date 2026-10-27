# Production Agent Skills - MCP Server

MCP (Model Context Protocol) server that exposes the [production-agent-skills](https://github.com/Rajagopalhertzian/production-agent-skills) collection as resources and tools for AI coding agents.

## Features

- **Resources**: All skills, references, and examples exposed as `skill://` URIs
- **Tools**: Execute skill workflows, validate skills, search skills
- **Dual Transport**: STDIO (local) + Streamable HTTP (remote deployment)
- **Dynamic Discovery**: Skills loaded at runtime from bundled `skills/` directory
- **Cross-platform**: Works with any MCP-compatible client (Claude Desktop, Cursor, Claude.ai, etc.)

## Quick Start

### Local Development (STDIO)
```bash
cd mcp-server
npm install
npm run dev          # STDIO transport for Claude Desktop/Cursor
```

### Local HTTP Testing
```bash
npm run dev:http     # HTTP transport on port 3000
# Test: curl -X POST http://localhost:3000/mcp -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

### Build for Production
```bash
npm run build        # Compiles TypeScript + bundles skills into dist/
npm start            # Runs HTTP server on port 3000
```

---

## Deployment

### Docker (Recommended for MCP Market)

```bash
# Build image
docker build -t production-agent-skills ./mcp-server

# Run container
docker run -p 3000:3000 production-agent-skills
```

### MCP Market Deployment

1. **Push to GitHub** (public repo required)
2. **Submit to MCP Market** with:
   - Source: GitHub repository URL
   - Build: Auto-detected (Dockerfile present)
   - Port: 3000
3. **Deploy** - MCP Market builds Docker image and hosts it

### Manual Cloud Deployment

The Docker image runs on any platform supporting containers:
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Apps
- Railway/Render/Fly.io
- Kubernetes

Required environment variables:
```bash
MCP_TRANSPORT=http
PORT=3000
NODE_ENV=production
```

---

## Available Skills

| Skill | Description |
|-------|-------------|
| `verify-before-finish` | Evidence-based completion verification |
| `repository-onboarding` | Systematic repository discovery |
| `secret-leak-prevention` | Credential detection & remediation |
| `dependency-risk-assessment` | Vulnerability, license, supply chain analysis |
| `environment-config-safety` | Config review before deployment |
| `universal-project-builder` | Build any project from requirements |
| `skill-creator` | Create production-quality skills |

---

## MCP Interface

### Resources
All skills exposed as `skill://` URIs:
```
skill://verify-before-finish                    # Main skill file
skill://verify-before-finish/references/...     # Reference files
skill://verify-before-finish/examples/...       # Example files
```

### Tools

| Tool | Description |
|------|-------------|
| `list_skills` | List all available skills with metadata |
| `search_skills` | Search skills by keyword |
| `get_skill_guidance` | Get full skill guidance with optional context |
| `validate_skill` | Validate a skill's structure and completeness |

### Example Usage

**List all skills:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": { "name": "list_skills", "arguments": {} }
}
```

**Get skill guidance with context:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_skill_guidance",
    "arguments": {
      "skill": "verify-before-finish",
      "context": {
        "repository_path": "/path/to/repo",
        "task_description": "Implement user authentication",
        "target_files": ["src/auth.ts", "tests/auth.test.ts"]
      }
    }
  }
}
```

**Search skills:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "search_skills",
    "arguments": { "query": "secret" }
  }
}
```

---

## Client Configuration

### Claude Desktop (Local STDIO)
```json
{
  "mcpServers": {
    "production-agent-skills": {
      "command": "node",
      "args": ["/absolute/path/to/production-agent-skills/mcp-server/dist/index.js"],
      "env": {
        "MCP_TRANSPORT": "stdio"
      }
    }
  }
}
```

### Claude.ai / Remote Clients (HTTP)
```json
{
  "mcpServers": {
    "production-agent-skills": {
      "url": "https://your-deployment.mcpmarket.com/mcp"
    }
  }
```

### Cursor
```json
{
  "mcpServers": {
    "production-agent-skills": {
      "command": "node",
      "args": ["/absolute/path/to/production-agent-skills/mcp-server/dist/index.js"]
    }
  }
}
```

---

## Development

```bash
cd mcp-server

# Install dependencies
npm install

# Run with STDIO (for Claude Desktop)
npm run dev

# Run with HTTP (for testing remote clients)
npm run dev:http

# Build for production
npm run build

# Run production build
npm start

# Test with Docker
docker build -t production-agent-skills .
docker run -p 3000:3000 production-agent-skills
```

---

## Architecture

```
┌─────────────────┐     MCP (STDIO/HTTP)     ┌──────────────────┐
│  AI Agent       │ ◄──────────────────────► │  MCP Server      │
│  (Claude,       │                          │  (this package)  │
│   Cursor, etc.) │                          │                  │
└─────────────────┘                          └────────┬─────────┘
                                                      │
                                                      ▼
                                            ┌──────────────────┐
                                            │  Bundled Skills  │
                                            │  (dist/skills/)  │
                                            └──────────────────┘
```

---

## Security

- **Read-only** access to bundled skills
- **No credential handling** in server
- **CORS enabled** for browser clients
- **Health check** endpoint for container orchestration
- **Non-root user** in Docker container
- **Graceful shutdown** on SIGTERM

---

## License

MIT - same as production-agent-skills repository