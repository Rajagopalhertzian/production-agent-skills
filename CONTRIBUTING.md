# Contributing to Production Agent Skills

Thank you for contributing! This guide covers how to add new skills, improve existing ones, and maintain quality standards.

## Adding a New Skill

### 1. Check Existing Skills First
- Search the `skills/` directory
- Check if an existing skill can be extended or referenced
- Avoid duplication — reference other skills by name

### 2. Follow the Skill Creation Process
Use the `skill-creator` skill to guide you:
```bash
# The skill-creator skill will walk you through:
# 1. Requirements gathering
# 2. SKILL.md generation from template
# 3. Supporting files creation
# 4. Test fixture generation
# 5. Structure validation
# 6. Security review
# 7. Compatibility check
# 8. Documentation generation
```

### 3. Skill Requirements Checklist

Every skill must have:
- [ ] `SKILL.md` with valid YAML frontmatter
- [ ] All 13 standard sections (Overview, Scope, When to Use, Prerequisites, Workflow, Safety Constraints, Error Handling, Verification, Reporting Format, Common Rationalizations, Red Flags, Known Limitations, References)
- [ ] `references/` directory if detailed docs needed
- [ ] `scripts/` directory if runnable helpers needed (JSON stdout, stderr for status)
- [ ] `examples/` directory with example inputs/outputs
- [ ] `schemas/` directory with JSON schema for machine-readable output
- [ ] Test fixtures in `tests/<skill-name>/FIXTURES.md` covering all 6 categories
- [ ] Security review passed (SkillSceptor or manual)
- [ ] Compatibility documented for target agents

### 4. Naming Conventions
- Directory: `lowercase-hyphen-separated` (e.g., `verify-before-finish`)
- Main file: `SKILL.md` (always uppercase)
- Supporting files: `lowercase-hyphen-separated.md`
- Scripts: `lowercase-hyphen-separated.sh` or `.py`
- Templates: `lowercase-hyphen-separated.template.md`

### 5. Frontmatter Requirements
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

## Improving Existing Skills

### 1. Edit SKILL.md Directly
- Make focused changes
- Update version in frontmatter if significant
- Ensure all sections remain complete

### 2. Update Supporting Files
- Keep references/examples/scripts in sync with SKILL.md
- Add new test fixtures for new behaviors

### 3. Run Validation
- Check frontmatter validity
- Verify all cross-references resolve
- Validate JSON examples against schemas
- Run markdown linting

## Test Fixture Guidelines

### Required Categories (6 per skill)
1. **Positive** — Expected behavior works
2. **Negative** — Expected violations detected
3. **Edge** — Boundary conditions, empty inputs, conflicting signals
4. **Missing-tool** — Required CLI not installed
5. **Insufficient-evidence** — Incomplete data, no network
6. **Safety** — Prompt injection attempts, destructive command detection

### Fixture Rules
- Use **synthetic data only** — never real credentials
- Make fixtures self-contained and reproducible
- Document expected behavior clearly
- Include both input (repository structure) and expected output

## Code Style

### Markdown
- Use ATX headings (`#`, `##`, `###`)
- Use tables for structured data
- Use fenced code blocks with language hints
- Keep lines under 120 characters where practical

### Scripts (Bash)
```bash
#!/bin/bash
set -e

# Status messages to stderr
echo "Processing..." >&2

# Machine-readable output to stdout (JSON)
echo '{"status": "success", "data": "value"}'

# Cleanup trap
trap 'rm -f /tmp/tempfile' EXIT
```

### Scripts (Python)
```python
#!/usr/bin/env python3
import json
import sys

def main():
    try:
        # ... logic ...
        print(json.dumps({"status": "success", "data": "value"}))
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
```

## Security Review

Before submitting a skill:
1. **No unsafe instructions** — Never auto-execute, never expose credentials
2. **Prompt injection safety** — Include standard notice, validate output schema
3. **External calls documented** — No private data transmission without authorization
4. **Destructive actions require approval** — Explicit human confirmation
5. **Secrets redacted in output** — Never print full values

## Compatibility

Skills must work across agents:
- **Model-neutral language** — No model-specific workarounds
- **No agent-specific tool names** — Use generic capabilities
- **Document installation** per platform in skill's README
- **Test on target agents** when possible

## Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run validation (structure, tests, security)
5. Submit PR with:
   - Clear description of changes
   - Test results (which fixtures passed)
   - Security review notes
   - Compatibility verification

## Review Criteria

PRs are evaluated on:
- **Correctness** — Skill works as specified
- **Completeness** — All required sections and files present
- **Safety** — No security issues
- **Clarity** — Instructions are specific and actionable
- **Evidence-based** — Verification requires proof
- **Compatibility** — Works across target agents

## License

By contributing, you agree that your contributions will be licensed under the MIT License (same as the repository).