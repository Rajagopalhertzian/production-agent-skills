# Skill Structure Definition

This document defines the consistent structure for all skills in this repository.

## Frontmatter (Required)

```yaml
---
name: skill-name-with-hyphens
description: Guides agents through [task/workflow]. Use when [specific trigger conditions].
license: MIT
allowed-tools: [Read, Write, Edit, Bash, Grep, Glob, Task]
compatibility:
  - claude-code
  - openai-codex
  - cursor
  - generic
---
```

**Rules:**
- `name`: lowercase-hyphen-separated, matches directory name
- `description`: Third-person action + "Use when" trigger conditions (max 1024 chars)
- `license`: MIT (our repository license)
- `allowed-tools`: Array of tool names the skill needs
- `compatibility`: Tested agent platforms

## Standard Sections (Required Pattern)

```markdown
# Skill Title

## Overview
One-two sentences explaining what this skill does and why it matters.

## Scope
Explicit boundaries: what this skill covers and what it does NOT cover.

## When to Use
- Bullet list of triggering conditions (symptoms, task types)
- When NOT to use (exclusions)

## Prerequisites
- Required tools (CLI, permissions, access)
- Required context (files, information)
- Required capabilities (agent must be able to...)

## Workflow
The main workflow, broken into numbered steps or phases.
Include decision points with explicit criteria.
Reference supporting files for details.

## Safety Constraints
- What the skill must NEVER do
- Human approval required for...
- Credential handling rules
- External service restrictions

## Error Handling
- Behavior when required tools missing
- Behavior when network unavailable
- Behavior when evidence insufficient
- Graceful degradation

## Verification
After completing the skill's process, confirm:
- [ ] Checklist of exit criteria with evidence requirements
- [ ] Status semantics used: Verified / Partially Verified / Failed / Not Run / Unknown

## Reporting Format
Structured output specification:
- Human-readable Markdown report
- Machine-readable JSON summary
- Redaction rules for sensitive data

## Common Rationalizations
| Rationalization | Reality |
|---|---|
| Excuse agents use to skip steps | Why the excuse is wrong |

## Red Flags
- Behavioral patterns indicating the skill is being violated
- Things to watch for during review

## Known Limitations
- Honest coverage gaps
- Blind spots
- Assumptions

## References
- Links to supporting documentation
- Tool documentation
- Standards referenced
```

## Supporting Files

Create only when needed:
- `references/` — Detailed technical docs, examples, templates
- `scripts/` — Runnable helpers (bash, Python) with JSON stdout
- `examples/` — Example inputs/outputs
- `schemas/` — JSON schemas for validation

## Status Semantics (Per Skill)

Each skill defines its own status values based on its verification needs:

| Status | Meaning |
|--------|---------|
| Verified | Check completed with positive evidence |
| Partially Verified | Some evidence found, but incomplete |
| Failed | Check ran and found violation/failure |
| Not Run | Check could not be executed (missing tool, no network, etc.) |
| Unknown | Cannot determine (runtime-only, outside scope) |

**Do not force every skill into the same vocabulary** — use what fits the task.

## Script Conventions

When skills include scripts in `scripts/`:
- `#!/bin/bash` shebang (or `#!/usr/bin/env python3`)
- `set -e` for fail-fast
- Status messages to stderr: `echo "Message" >&2`
- Machine-readable output (JSON) to stdout
- Cleanup trap for temporary files
- Path referenced as `skills/<skill-name>/scripts/<script>.sh`

## Cross-Skill References

Reference other skills by name:
```
Follow the `verify-before-finish` skill for completion verification.
If secrets are found, use the `secret-leak-prevention` skill.
```

Don't duplicate content — reference and link.

## Writing Principles

1. **Process over knowledge** — Skills are workflows, not reference docs
2. **Specific over general** — "Run `npm test`" beats "verify the tests"
3. **Evidence over assumption** — Every verification checkbox requires proof
4. **Anti-rationalization** — Every skip-worthy step needs a counter-argument
5. **Progressive disclosure** — Main SKILL.md is entry point; supporting files loaded on demand
6. **Token-conscious** — Every section must justify its inclusion
7. **Model-neutral** — Write the procedure, not the workaround for a specific model

## Verification Requirements

Every skill must have:
1. Test fixtures in `tests/<skill-name>/`
2. Positive, negative, edge, missing-tool, insufficient-evidence, safety cases
3. Synthetic data only — no real credentials
4. Test runner validation