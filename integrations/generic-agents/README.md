# Generic Agent Integration

This guide explains how to use production-agent-skills with any AI coding agent that accepts Markdown instructions.

## Installation

### Copy Skills to Project
```bash
mkdir -p .agent-skills
cp -r /path/to/production-agent-skills/skills .agent-skills/
```

### Include in Agent Context

**Option 1: System Prompt**
Paste the skill's SKILL.md content into your agent's system prompt.

**Option 2: Project Rules File**
Add to your project's rules file (`.cursorrules`, `.windsurfrules`, etc.):

```markdown
# Project Rules

## Skills
### verify-before-finish
@.agent-skills/skills/verify-before-finish/SKILL.md

### repository-onboarding
@.agent-skills/skills/repository-onboarding/SKILL.md

### secret-leak-prevention
@.agent-skills/skills/secret-leak-prevention/SKILL.md

### dependency-risk-assessment
@.agent-skills/skills/dependency-risk-assessment/SKILL.md

### environment-config-safety
@.agent-skills/skills/environment-config-safety/SKILL.md

### universal-project-builder
@.agent-skills/skills/universal-project-builder/SKILL.md

### skill-creator
@.agent-skills/skills/skill-creator/SKILL.md
```

**Option 3: Conversation Reference**
Reference skills by name in your instructions:
```
"Follow the verify-before-finish skill from .agent-skills/skills/verify-before-finish/SKILL.md"
```

## Usage

### Direct Instruction
```
Follow the verify-before-finish skill to verify this implementation before claiming done.

Use the repository-onboarding skill to understand this codebase before making changes.

Run the secret-leak-prevention skill on this repository before committing.

Assess the risk of adding this dependency using the dependency-risk-assessment skill.

Review this Docker/config change with the environment-config-safety skill.

Build this API service using the universal-project-builder skill.

Create a new skill for PR review using the skill-creator skill.
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

# Language runtimes as needed for universal-project-builder
# Node.js: https://nodejs.org
# Python: https://python.org
# Go: https://go.dev
# Rust: https://rustup.rs
```

## Platform-Specific Notes

### Cursor
- Add to `.cursorrules` or Settings > Rules
- Use `@` references for file inclusion

### Windsurf
- Add to `.windsurfrules`
- Use `@` references

### GitHub Copilot (VS Code)
- Add to `.github/copilot-instructions.md`
- Reference skills in chat

### Zed
- Add to `.zed/rules.md` or project settings

### Any LLM with File Access
- Paste SKILL.md content directly into conversation
- Or provide file path for agent to read

## Tips

1. **Context management** — Load only skills needed for current task
2. **Skill chaining** — Combine: onboard → build → verify → safety checks
3. **Persistence** — Keep SPEC.md, tasks/ in version control for session continuity
4. **Tool availability** — Skills gracefully handle missing tools with "Not Run" status