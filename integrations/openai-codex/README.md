# OpenAI Codex Integration

This guide explains how to use production-agent-skills with OpenAI Codex CLI.

## Installation

### Project-Level
Add to your project's AGENTS.md:

```markdown
# AGENTS.md

## Skills
- verify-before-finish: @.agent-skills/skills/verify-before-finish/SKILL.md
- repository-onboarding: @.agent-skills/skills/repository-onboarding/SKILL.md
- secret-leak-prevention: @.agent-skills/skills/secret-leak-prevention/SKILL.md
- dependency-risk-assessment: @.agent-skills/skills/dependency-risk-assessment/SKILL.md
- environment-config-safety: @.agent-skills/skills/environment-config-safety/SKILL.md
- universal-project-builder: @.agent-skills/skills/universal-project-builder/SKILL.md
- skill-creator: @.agent-skills/skills/skill-creator/SKILL.md
```

Copy skills:
```bash
mkdir -p .agent-skills
cp -r /path/to/production-agent-skills/skills .agent-skills/
```

### Global
Add to `~/.codex/AGENTS.md` or include in project instructions.

## Usage

### In Conversation
```
"Follow the verify-before-finish skill to verify this implementation."
"Use the repository-onboarding skill to understand this codebase."
"Run the secret-leak-prevention skill on this repository."
"Assess the risk of adding this dependency with dependency-risk-assessment."
"Review this Docker/config change with environment-config-safety."
"Build this API service using universal-project-builder."
"Create a new skill for PR review using skill-creator."
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

# Language runtimes as needed
```

## Notes

- Codex reads AGENTS.md at session start
- Skills loaded via `@path` syntax
- No slash commands — use natural language instructions
- Works with Codex's built-in tool execution