# Production Agent Skills - MCP Server

MCP (Model Context Protocol) server that exposes the [production-agent-skills](https://github.com/your-org/production-agent-skills) collection as resources and tools for AI coding agents.

## Features

- **Resources**: All skills, references, and examples exposed as `skill://` URIs
- **Tools**: Execute skill workflows, validate skills, search skills
- **Dynamic Discovery**: Skills loaded at runtime from the skills directory
- **Cross-platform**: Works with any MCP-compatible client (Claude Desktop, Cursor, etc.)

## Installation

### Prerequisites
- Node.js 20+
- The production-agent-skills repository cloned locally

### Build
```bash
cd mcp-server
npm install
npm run build
```

## Usage

### Claude Desktop

Add to `claude_desktop_config.json`:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "production-agent-skills": {
      "command": "node",
      "args": ["/absolute/path/to/production-agent-skills/mcp-server/dist/index.js"],
      "env": {
        "SKILLS_PATH": "/absolute/path/to/production-agent-skills/skills"
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "production-agent-skills": {
      "command": "node",
      "args": ["/absolute/path/to/production-agent-skills/mcp-server/dist/index.js"],
      "env": {
        "SKILLS_PATH": "/absolute/path/to/production-agent-skills/skills"
      }
    }
  }
}
```

### Generic MCP Client

```bash
# Run directly
SKILLS_PATH=/path/to/production-agent-skills/skills node /path/to/mcp-server/dist/index.js
```

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

## MCP Resources

All skills exposed as `skill://` URIs:

```
skill://verify-before-finish                    # Main skill file
skill://verify-before-finish/references/...     # Reference files
skill://verify-before-finish/examples/...       # Example files
```

## MCP Tools

### `list_skills`
List all available skills with metadata.

### `search_skills`
Search skills by keyword.

```json
{ "query": "secret" }
```

### `get_skill_guidance`
Get full skill guidance for execution with optional context.

```json
{
  "skill": "verify-before-finish",
  "context": {
    "repository_path": "/path/to/repo",
    "task_description": "Implement user authentication",
    "target_files": ["src/auth.ts", "tests/auth.test.ts"]
  }
}
```

### `validate_skill`
Validate a skill's structure and completeness.

```json
{ "skill": "verify-before-finish" }
```

## Example Workflows

### Using with Claude Desktop

1. **Discover skills**: Ask "What skills are available?"
2. **Get guidance**: "Give me the verify-before-finish skill guidance for my current PR"
3. **Execute workflow**: Agent reads skill and executes the workflow
4. **Validate**: Use validate_skill to check skill quality

### Using with Cursor

1. Open Cursor with MCP enabled
2. In chat: "Search for skills related to secrets"
3. Get guidance: "Get the secret-leak-prevention skill with context for my repo"
5. Agent executes the skill workflow

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SKILLS_PATH` | Path to skills directory | `../skills` (relative to server) |

### Development

```bash
cd mcp-server
npm run dev  # Hot reload with tsx
```

## Architecture

```
┌─────────────────┐     MCP/stdio     ┌──────────────────┐
│  AI Agent       │ ◄────────────────► │  MCP Server      │
│  (Claude,       │                    │  (this package)  │
│   Cursor, etc.) │                    │                  │
└─────────────────┘                    └────────┬─────────┘
                                                │
                                                ▼
                                    ┌──────────────────┐
                                    │  Skills Directory│
                                    │  (SKILL.md files)│
                                    └──────────────────┘
```

## Security

- Read-only access to skills directory
- No credential handling in server
- Skills themselves enforce security (redaction, approval gates)
- No network calls from server

## License

MIT - same as production-agent-skills repository