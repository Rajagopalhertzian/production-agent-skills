# MCP (Model Context Protocol) Integration

This guide explains how to use production-agent-skills with MCP-enabled agents.

## Overview

MCP allows agents to access external tools and resources through a standardized protocol. Skills can be exposed as MCP resources or tools.

## Architecture

```
┌─────────────────┐     MCP      ┌──────────────────┐
│   AI Agent      │ ◄──────────► │  MCP Server      │
│  (Claude, etc.) │              │  (skills server) │
└─────────────────┘              └──────────────────┘
                                          │
                                          ▼
                              ┌──────────────────┐
                              │  Skill Resources │
                              │  - SKILL.md files│
                              │  - References    │
                              │  - Scripts       │
                              └──────────────────┘
```

## MCP Server Implementation

Create a simple MCP server that serves skills:

```python
# mcp-skills-server.py
#!/usr/bin/env python3
"""
MCP Server for production-agent-skills
"""

import asyncio
import json
from pathlib import Path
from typing import Any

from mcp.server import Server
from mcp.types import Resource, Tool, TextContent

SKILLS_DIR = Path("skills")

app = Server("production-agent-skills")

@app.list_resources()
async def list_resources() -> list[Resource]:
    resources = []
    for skill_dir in SKILLS_DIR.iterdir():
        if skill_dir.is_dir():
            skill_file = skill_dir / "SKILL.md"
            if skill_file.exists():
                resources.append(Resource(
                    uri=f"skill://{skill_dir.name}",
                    name=skill_dir.name,
                    description=f"Skill: {skill_dir.name}",
                    mimeType="text/markdown"
                ))
                # Add references
                for ref in (skill_dir / "references").glob("*.md"):
                    resources.append(Resource(
                        uri=f"skill://{skill_dir.name}/references/{ref.name}",
                        name=f"{skill_dir.name}/references/{ref.name}",
                        description=f"Reference: {ref.name}",
                        mimeType="text/markdown"
                    ))
    return resources

@app.read_resource()
async def read_resource(uri: str) -> str:
    # Parse skill://name or skill://name/references/file.md
    if not uri.startswith("skill://"):
        raise ValueError(f"Unknown URI scheme: {uri}")
    
    path = uri[8:]  # Remove "skill://"
    parts = path.split("/")
    skill_name = parts[0]
    
    if len(parts) == 1:
        # Main skill file
        file_path = SKILLS_DIR / skill_name / "SKILL.md"
    elif parts[1] == "references":
        file_path = SKILLS_DIR / skill_name / "references" / parts[2]
    else:
        raise ValueError(f"Unknown resource path: {path}")
    
    if not file_path.exists():
        raise ValueError(f"Resource not found: {uri}")
    
    return file_path.read_text(encoding='utf-8')

@app.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="run_skill",
            description="Execute a skill workflow (simulated - returns guidance)",
            inputSchema={
                "type": "object",
                "properties": {
                    "skill": {"type": "string", "description": "Skill name"},
                    "context": {"type": "object", "description": "Context for skill execution"}
                },
                "required": ["skill"]
            }
        ),
        Tool(
            name="validate_skill",
            description="Validate a skill's structure",
            inputSchema={
                "type": "object",
                "properties": {
                    "skill": {"type": "string", "description": "Skill name"}
                },
                "required": ["skill"]
            }
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name == "run_skill":
        skill = arguments.get("skill")
        context = arguments.get("context", {})
        # Return guidance for the agent to execute the skill
        skill_file = SKILLS_DIR / skill / "SKILL.md"
        if not skill_file.exists():
            return [TextContent(type="text", text=f"Skill not found: {skill}")]
        
        content = skill_file.read_text()
        return [TextContent(type="text", text=f"Skill guidance for {skill}:\n\n{content}\n\nContext: {json.dumps(context, indent=2)}")]
    
    elif name == "validate_skill":
        skill = arguments.get("skill")
        skill_file = SKILLS_DIR / skill / "SKILL.md"
        if not skill_file.exists():
            return [TextContent(type="text", text=f"Skill not found: {skill}")]
        
        # Run validation
        import subprocess
        result = subprocess.run(["python", "scripts/validate-skills.py"], 
                              capture_output=True, text=True, cwd=SKILLS_DIR.parent)
        return [TextContent(type="text", text=f"Validation result:\n{result.stdout}\n{result.stderr}")]
    
    raise ValueError(f"Unknown tool: {name}")

if __name__ == "__main__":
    import sys
    from mcp.server.stdio import stdio_server
    
    async def main():
        async with stdio_server() as (read_stream, write_stream):
            await app.run(read_stream, write_stream, app.create_initialization_options())
    
    asyncio.run(main())
```

## Client Configuration

### Claude Desktop (claude_desktop_config.json)
```json
{
  "mcpServers": {
    "production-agent-skills": {
      "command": "python",
      "args": ["/path/to/production-agent-skills/mcp-skills-server.py"],
      "env": {}
    }
  }
}
```

### Cursor (mcp.json)
```json
{
  "mcpServers": {
    "production-agent-skills": {
      "command": "python",
      "args": ["/path/to/production-agent-skills/mcp-skills-server.py"]
    }
  }
}
```

## Using Skills via MCP

Once connected, agents can:

1. **List available skills**: `resources/list` with `skill://` URIs
2. **Read skill content**: `resources/read` with `skill://skill-name`
3. **Get references**: `resources/read` with `skill://skill-name/references/file.md`
4. **Run skill guidance**: `tools/call` with `run_skill` and context
5. **Validate skills**: `tools/call` with `validate_skill`

## Example Agent Usage

```
User: "I need to verify this PR before merging. What skills are available?"

Agent: [lists skills via resources/list]
       "Available skills: verify-before-finish, repository-onboarding, secret-leak-prevention, 
       dependency-risk-assessment, environment-config-safety, universal-project-builder, skill-creator"

User: "Use verify-before-finish on the current changes."

Agent: [calls run_skill with skill=verify-before-finish, context={repo: ".", pr: "123"}]
       Returns skill guidance for agent to execute
```

## Benefits of MCP Integration

- **Dynamic discovery** — Agents find skills at runtime
- **Resource isolation** — Skills served as read-only resources
- **Tool abstraction** — Skills as callable tools with structured input
- **Cross-platform** — Works with any MCP-compatible agent
- **Versioning** — Server can serve specific skill versions

## Security Considerations

- Server runs locally — no network exposure
- Read-only file access
- No credential handling in server
- Skills themselves handle security (redaction, approval gates)
- Validate all tool inputs

## Future Enhancements

- Skill execution sandbox
- Real-time validation feedback
- Skill composition workflows
- Telemetry and usage analytics