# Production Agent Skills

A collection of reusable, testable, security-conscious workflows that help AI coding agents understand repositories, verify code changes, protect secrets, assess dependencies, and safely review configuration changes.

## The Problem

AI coding agents often:
- Claim completion without running tests or verifying acceptance criteria
- Make changes to unfamiliar repositories without understanding architecture
- Miss hardcoded secrets in code, config, or Git history
- Add dependencies without assessing security, license, or supply-chain risk
- Deploy configuration changes that pass syntax checks but fail at runtime

This repository provides **skills** — structured, evidence-based workflows — that address these failure modes.

## Skills Included

| Skill | Purpose | Key Capability |
|-------|---------|----------------|
| `verify-before-finish` | Evidence-based completion verification | Runs tests, inspects diff, checks assumptions, reports truthfully |
| `repository-onboarding` | Systematic repository discovery | Maps architecture, entry points, commands, config, security files |
| `secret-leak-prevention` | Credential exposure detection & remediation | Scans code/history/config, verifies secrets, guides rotation |
| `dependency-risk-assessment` | Dependency risk evaluation | Vulnerabilities (EPSS+KEV), licenses, typosquatting, breaking changes |
| `environment-config-safety` | Configuration change review | Validates syntax, checks env vars, detects destructive commands, drift |
| `universal-project-builder` | Build anything from requirements | Classifies project, scaffolds, toolchain, incremental with verification |
| `skill-creator` | Create production-quality skills | Template, validation, testing, security review, compatibility |

## Supported Agents

- **Claude Code** — Load via `/skill` command or include in CLAUDE.md
- **OpenAI Codex** — Include in AGENTS.md or project instructions
- **Cursor** — Add to .cursorrules or project rules
- **Generic** — Paste skill content into any agent's context

## Installation

### Option 1: Clone Entire Repository (Recommended)

```bash
git clone https://github.com/your-org/production-agent-skills.git
# Reference skills from the cloned path
```

### Option 2: Copy Individual Skills

```bash
# Copy specific skill directory to your project
cp -r production-agent-skills/skills/verify-before-finish .agent-skills/
```

### Option 3: Agent-Specific Integration

See [integrations/](integrations/) for platform-specific setup:
- [Claude Code](integrations/claude-code/)
- [OpenAI Codex](integrations/openai-codex/)
- [Cursor](integrations/cursor/)
- [Generic Agents](integrations/generic-agents/)

## Quick Start

### 1. Verify Before Finish
```markdown
# In your agent conversation:
"Follow the verify-before-finish skill to verify this implementation before claiming done."
```

### 2. Repository Onboarding
```markdown
"Use the repository-onboarding skill to understand this codebase before making changes."
```

### 3. Secret Leak Prevention
```markdown
"Run the secret-leak-prevention skill on this repository before committing."
```

### 4. Dependency Risk Assessment
```markdown
"Assess the risk of adding this dependency using the dependency-risk-assessment skill."
```

### 5. Environment Config Safety
```markdown
"Review this Docker/Compose/config change with the environment-config-safety skill."
```

## Required Tools

| Skill | Required Tools | Install |
|-------|----------------|---------|
| All | `git`, `bash` | System package manager |
| verify-before-finish | Project's test/build commands | Per project |
| repository-onboarding | `find`, `grep` | System |
| secret-leak-prevention | `gitleaks` or `trufflehog` | `brew install gitleaks` / `pip install trufflehog` |
| dependency-risk-assessment | `osv-scanner` + ecosystem tools | `go install github.com/google/osv-scanner/cmd/osv-scanner@latest` |
| environment-config-safety | `hadolint`, `checkov`, `yamllint`, `docker compose` | `brew install hadolint` / `pip install checkov yamllint` |
| universal-project-builder | Language runtimes (node, python, go, rust) | Per language |
| skill-creator | `markdownlint-cli` (optional) | `npm install -g markdownlint-cli` |

**Note:** Skills gracefully handle missing tools — they report "Not Run" with install instructions rather than failing silently.

## Safety Considerations

- **No automatic actions** — All skills are advisory; they produce reports with recommendations
- **Human approval required** — For credential rotation, Git history rewrites, dependency updates, deployments
- **Secrets never printed** — All reports redact sensitive values (show only type + prefix/suffix)
- **No external data transmission** — Skills analyze locally; never send code/secrets to external services
- **Prompt injection resistant** — All skills include safety notices and output validation
- **Synthetic test data only** — Test fixtures never contain real credentials

## Testing

Each skill includes test fixtures in `tests/<skill-name>/FIXTURES.md` covering:
- Positive cases (expected behavior works)
- Negative cases (expected violations detected)
- Edge cases (boundary conditions, empty inputs)
- Missing-tool scenarios (tool unavailable)
- Insufficient-evidence scenarios (incomplete data)
- Safety cases (prompt injection, destructive commands)

Run tests by following the skill's workflow against the fixture repositories.

## Known Limitations

| Skill | Limitations |
|-------|-------------|
| verify-before-finish | Cannot verify runtime behavior without integration tests; relies on repo having discoverable commands |
| repository-onboarding | Cannot discover runtime-only behavior; monorepos sampled |
| secret-leak-prevention | Cannot detect secrets in binaries; verification needs network; encrypted secrets appear as false positives |
| dependency-risk-assessment | Advisory data lag (24-72h); offline mode limited; cannot assess private deps |
| environment-config-safety | Cannot validate runtime behavior (OOM, timeouts); drift detection needs deployed access |
| universal-project-builder | Cannot predict requirement changes; templates may not fit unique needs |
| skill-creator | Cannot auto-verify in all agent platforms; security review pattern-based only |

## Release Readiness

| Stage | Status |
|-------|--------|
| Research Complete | ✅ |
| Implementation Complete | ✅ |
| Structurally Validated | ✅ |
| Functionally Evaluated | ⚠️ Test fixtures defined, execution pending |
| Security Reviewed | ⚠️ Pattern-based review done, SkillSpector scan pending |
| Production Pilot | ❌ Not yet evaluated in controlled environment |
| Production Ready | ❌ |

**Current Stage: Implementation Complete** — Skills implemented with test fixtures. Functional evaluation and security review needed before production use.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Adding new skills
- Improving existing skills
- Adding test fixtures
- Reporting issues

## License

MIT License — see [LICENSE](LICENSE)

## Attribution

This project draws inspiration and patterns from:
- [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) (MIT) — Skill anatomy, verification patterns, anti-rationalization
- [UnitOneAI/SecuritySkills](https://github.com/UnitOneAI/SecuritySkills) (MIT) — Security workflows, EPSS+KEV triage, fixer policy
- [NVIDIA/SkillSpector](https://github.com/NVIDIA/SkillSpector) (Apache-2.0) — Skill security scanning concepts
- [gitleaks/gitleaks](https://github.com/gitleaks/gitleaks) (MIT) — Secret detection
- [trufflesecurity/trufflehog](https://github.com/trufflesecurity/trufflehog) — Secret verification
- [google/osv-scanner](https://github.com/google/osv-scanner) (Apache-2.0) — Vulnerability database
- [hadolint/hadolint](https://github.com/hadolint/hadolint) — Dockerfile linting
- [bridgecrewio/checkov](https://github.com/bridgecrewio/checkov) — IaC validation

