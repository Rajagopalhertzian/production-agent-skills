---
name: {{skill_name}}
description: Guides agents through [task/workflow]. Use when [specific trigger conditions].
license: MIT
allowed-tools: [Read, Write, Edit, Bash, Grep, Glob, Task]
compatibility:
  - claude-code
  - openai-codex
  - cursor
  - generic
---

# {{Skill Title}}

## Overview

One-two sentences explaining what this skill does and why it matters.

## Scope

**Covers:**
- Item 1
- Item 2

**Does NOT cover:**
- Item 1
- Item 2

## When to Use

**Use when:**
- Trigger condition 1
- Trigger condition 2

**When NOT to use:**
- Exclusion 1
- Exclusion 2

## Prerequisites

**Required tools:**
- `tool1` — purpose
- `tool2` — purpose

**Required context:**
- Context item 1
- Context item 2

**Required capabilities:**
- Capability 1
- Capability 2

## Workflow

### Phase 1: Phase Name

1. **Step description** — Detail
2. **Step description** — Detail

### Phase 2: Phase Name

3. **Step description** — Detail
4. **Step description** — Detail

## Safety Constraints

- **NEVER** action that must never happen
- **NEVER** another forbidden action
- **ALWAYS** required action
- **ALWAYS** another required action

## Error Handling

| Situation | Behavior |
|-----------|----------|
| Situation 1 | Behavior description |
| Situation 2 | Behavior description |

## Verification

After completing the skill's process, confirm:

- [ ] Checkpoint 1 with evidence requirement
- [ ] Checkpoint 2 with evidence requirement

## Reporting Format

### Human-Readable (Markdown)

```markdown
# Report Title

## Summary
- Key metric: value

## Details

| Column 1 | Column 2 |
|----------|----------|
| Value 1  | Value 2  |
```

### Machine-Readable (JSON)

```json
{
  "field1": "value1",
  "field2": "value2"
}
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| Excuse agents use to skip steps | Why the excuse is wrong |

## Red Flags

- Behavioral pattern indicating violation
- Another red flag

## Known Limitations

- Honest coverage gap
- Blind spot

## References

- Link 1
- Link 2