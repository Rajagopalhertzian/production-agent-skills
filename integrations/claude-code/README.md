# Claude Code Integration

This guide explains how to use production-agent-skills with Claude Code.

## Installation Options

### Option 1: Project-Level (Recommended)
Add skills to your project's CLAUDE.md:

```markdown
# CLAUDE.md

## Skills
@.agent-skills/skills/verify-before-finish/SKILL.md
@.agent-skills/skills/repository-onboarding/SKILL.md
@.agent-skills/skills/secret-leak-prevention/SKILL.md
@.agent-skills/skills/dependency-risk-assessment/SKILL.md
@.agent-skills/skills/environment-config-safety/SKILL.md
@.agent-skills/skills/universal-project-builder/SKILL.md
@.agent-skills/skills/skill-creator/SKILL.md
```

Copy skills to your project:
```bash
mkdir -p .agent-skills
cp -r /path/to/production-agent-skills/skills .agent-skills/
```

### Option 2: Global (User-Level)
Add to `~/.claude/CLAUDE.md`:
```markdown
# Global Skills
@/path/to/production-agent-skills/skills/verify-before-finish/SKILL.md
@/path/to/production-agent-skills/skills/repository-onboarding/SKILL.md
...
```

### Option 3: Slash Commands
Create `.claude/commands/` in your project:
```bash
mkdir -p .claude/commands
```

Create `.claude/commands/verify.md`:
```markdown
---
name: verify
description: Run verify-before-finish skill on current changes
---

Follow the `verify-before-finish` skill to verify the current implementation before claiming completion.
```

Create `.claude/commands/onboard.md`:
```markdown
---
name: onboard
description: Run repository-onboarding skill on current repo
---

Follow the `repository-onboarding` skill to understand this repository before making changes.
```

## Usage

### In Conversation
```
"Follow the verify-before-finish skill to verify this implementation."
"Use the repository-onboarding skill to understand this codebase."
"Run the secret-leak-prevention skill before I commit."
"Assess the risk of adding this dependency with dependency-risk-assessment."
"Review this Docker/config change with environment-config-safety."
"Build this API service using universal-project-builder."
"Create a new skill for PR review using skill-creator."
```

### With Slash Commands
```
/verify
/onboard
```

## Required Tools Installation

```bash
# Secret scanning
brew install gitleaks
# or: pip install trufflehog

# Dependency scanning
go install github.com/google/osv-scanner/cmd/osv-scanner@latest

# Config validation
brew install hadolint
pip install checkov yamllint

# For universal-project-builder
# Node.js: https://nodejs.org
# Python: https://python.org
# Go: https://go.dev
# Rust: https://rustup.rs
```

## Tips

1. **Load skills selectively** — Only reference skills needed for the current task
2. **Combine skills** — Chain skills: `/onboard` then `/verify` then build
3. **Project memory** — Keep SPEC.md, tasks/plan.md in version control for session continuity
4. **Agent personas** — Use `@.agent-skills/agents/security-auditor.md` for specialized review