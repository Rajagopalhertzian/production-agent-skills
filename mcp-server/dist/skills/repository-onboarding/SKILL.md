---
name: repository-onboarding
description: Helps AI coding agents understand an unfamiliar repository before making significant changes. Use when starting work on a new or unfamiliar codebase.
license: MIT
allowed-tools: [Read, Write, Edit, Bash, Grep, Glob, Task]
compatibility:
  - claude-code
  - openai-codex
  - cursor
  - generic
---

# Repository Onboarding

## Overview

This skill guides agents through systematic discovery of an unfamiliar repository. It produces a concise, evidence-based repository overview covering architecture, entry points, module relationships, dependencies, build/test commands, configuration conventions, security-sensitive areas, and documentation gaps. It avoids unnecessary file changes during discovery and distinguishes observed facts from assumptions.

## Scope

**Covers:**
- Architecture and high-level structure discovery
- Language and framework identification
- Entry point discovery (CLI, API, workers, etc.)
- Module/component relationships
- Dependency manifests and lockfiles
- Build and test command discovery
- Configuration conventions
- Development documentation
- Security-sensitive directories and files
- Uncertainty from missing/conflicting docs

**Does NOT cover:**
- Code modification (discovery only unless explicitly requested)
- Secret scanning (use `secret-leak-prevention`)
- Dependency vulnerability assessment (use `dependency-risk-assessment`)
- Configuration validation (use `environment-config-safety`)
- Full code review

## When to Use

**Use when:**
- Starting work on a new/unfamiliar repository
- Joining an existing project
- Before making significant architectural changes
- When documentation is missing or outdated
- Before proposing refactoring

**When NOT to use:**
- For trivial changes in well-known codebases
- When user explicitly says "skip onboarding"
- For repositories already documented in project memory

## Prerequisites

**Required tools:**
- `git` — for history and structure
- `find`/`glob` — for file discovery
- Language-specific tools (optional): `npm`, `pip`, `cargo`, `go`, `mvn`, `gradle`

**Required context:**
- Repository root access
- Ability to run read-only commands

**Required capabilities:**
- File system traversal
- Command execution
- Pattern matching

## Workflow

### Phase 1: Quick Orientation (2-5 minutes)

1. **Identify repository root** — `git rev-parse --show-toplevel` or current directory
2. **List top-level structure** — `ls -la` and `find . -maxdepth 2 -type f -name "*.md" -o -name "*.txt" -o -name "*.toml" -o -name "*.yaml" -o -name "*.yml" -o -name "*.json" -o -name "*.xml" | head -50`
3. **Read key documentation** — README.md, CONTRIBUTING.md, ARCHITECTURE.md, docs/ (first 200 lines each)
4. **Check for CI/CD** — `.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`, `.circleci/`

### Phase 2: Language and Framework Detection

5. **Detect primary languages** — `find . -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.go" -o -name "*.rs" -o -name "*.java" -o -name "*.cs" -o -name "*.rb" -o -name "*.php" | wc -l` per extension
6. **Find manifests** — `package.json`, `pyproject.toml`/`requirements.txt`/`Pipfile`/`poetry.lock`, `go.mod`, `Cargo.toml`, `pom.xml`/`build.gradle`, `Gemfile`, `composer.json`
7. **Read manifests** — Extract: name, version, dependencies, scripts, entry points
8. **Identify frameworks** — From dependencies: Express/FastAPI/Django/React/Vue/Next.js/Spring/etc.

### Phase 3: Architecture Discovery

9. **Map directory structure** — `find . -type d -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/target/*" -not -path "*/build/*" -not -path "*/dist/*" -not -path "*/.venv/*" | sort`
10. **Identify architectural patterns** — Look for: `src/`, `lib/`, `app/`, `pkg/`, `internal/`, `cmd/`, `services/`, `modules/`, `components/`, `handlers/`, `controllers/`, `models/`, `views/`
11. **Find module boundaries** — Package.json workspaces, Cargo workspaces, Go modules, Python packages, Maven modules
12. **Generate ASCII architecture summary** — Text-based component diagram

### Phase 4: Entry Point Discovery

13. **Find CLI entry points** — `bin/`, `scripts/`, `main.py`, `main.go`, `cmd/*.go`, `index.js`, `cli.js`, `manage.py`
14. **Find API entry points** — `server.js`, `app.py`, `main.go`, `Application.java`, `Startup.cs`, `routes/`, `handlers/`
15. **Find worker/background entry points** — `worker.py`, `celery.py`, `jobs/`, `tasks/`, `consumers/`
16. **Find test entry points** — `test/`, `tests/`, `spec/`, `__tests__/`, `*_test.go`, `*_test.py`

### Phase 5: Module Relationships

17. **Analyze imports/dependencies** — Sample key files to understand internal vs external deps
18. **Identify shared/core modules** — Common utilities, shared types, base classes
19. **Map data flow** — From entry points through handlers to storage/external services
20. **Note circular dependency risks** — Mutual imports, shared state

### Phase 6: Build and Test Commands

21. **Extract from manifests** — `scripts` in package.json, `[tool.poetry.scripts]` in pyproject.toml, `Makefile`, `justfile`, `Taskfile.yml`
22. **Extract from CI** — GitHub Actions, GitLab CI steps
23. **Extract from docs** — README "Development" section, CONTRIBUTING
24. **Verify commands work** — Run `npm test`, `pytest`, `go test ./...`, `cargo test`, `./gradlew test` (dry-run or fast subset)
25. **Note command variations** — Full suite vs focused test vs watch mode

### Phase 7: Configuration Conventions

26. **Find config files** — `.env*`, `config/`, `settings/`, `*.config.js`, `*.config.ts`, `pyproject.toml` `[tool.*]`, `config.yaml`, `config.toml`
27. **Identify config patterns** — Environment variables, config files, secret references, feature flags
28. **Find environment-specific configs** — `config.dev.yaml`, `config.prod.yaml`, `.env.development`, `.env.production`
29. **Check for config validation** — Schema files, validation libraries (zod, pydantic, viper, etc.)

### Phase 8: Security-Sensitive Discovery

30. **Find secret-prone files** — `.env*`, `*.pem`, `*.key`, `*.crt`, `id_rsa*`, `secrets.*`, `credentials.*`, `*.kubeconfig`
31. **Find CI/CD secrets** — GitHub Actions secrets, GitLab CI variables, `.github/workflows/` with hardcoded values
32. **Find infrastructure configs** — `terraform/`, `helm/`, `k8s/`, `docker-compose*.yml`, `Dockerfile*`, `cloudbuild.yaml`
33. **Note security documentation** — SECURITY.md, threat models, audit reports

### Phase 9: Documentation Gap Analysis

34. **Check for missing docs** — No README, no CONTRIBUTING, no ARCHITECTURE, no API docs
35. **Check for conflicting docs** — README says X, code does Y; CI uses different commands than docs
36. **Check for outdated docs** — Version numbers, deprecated commands, removed features still documented
37. **Rate documentation quality** — Good / Partial / Poor / Missing

### Phase 10: Produce Onboarding Report

38. **Generate structured report** — Using the reporting format below
39. **Label each finding** — Observed (with evidence) vs Assumed (no evidence)
40. **Highlight uncertainties** — Explicitly flag gaps and conflicts

## Safety Constraints

- **NEVER** modify files during discovery unless explicitly requested by user
- **NEVER** run destructive commands (`rm`, `drop`, `destroy`, `clean`)
- **NEVER** transmit repository content to external services
- **NEVER** print full secret values if discovered — redact and report location only
- **ALWAYS** distinguish observed facts from assumptions in report
- **ALWAYS** ask before running commands that might have side effects (even test commands that modify DB)

## Error Handling

| Situation | Behavior |
|-----------|----------|
| No manifests found | Report "Unknown — no standard manifest detected"; suggest manual inspection |
| Commands fail | Report "Not Run — [error]"; continue with other discovery |
| No documentation | Report "Missing — no README/CONTRIBUTING found" |
| Conflicting documentation | Report "Conflict — [doc A] says X, [doc B] says Y" |
| Large monorepo | Limit depth; report "Partial — monorepo, sampled N packages" |
| Permission denied | Report "Not Run — permission denied"; continue |

## Verification

After completing onboarding:

- [ ] Primary language(s) identified with evidence
- [ ] Manifest(s) located and parsed
- [ ] Framework(s) identified from dependencies
- [ ] Top-level architecture mapped (ASCII diagram)
- [ ] Entry points discovered (CLI, API, workers, tests)
- [ ] Build command discovered and verified (dry-run)
- [ ] Test command discovered and verified (fast subset)
- [ ] Configuration conventions documented
- [ ] Security-sensitive files inventoried (redacted)
- [ ] Documentation gaps explicitly listed
- [ ] All findings labeled Observed vs Assumed
- [ ] Report includes both Markdown and JSON

## Reporting Format

### Human-Readable (Markdown)

```markdown
# Repository Onboarding Report

## Repository
- **Path**: /path/to/repo
- **Git Remote**: git@github.com:org/repo.git
- **Branch**: main
- **Last Commit**: abc1234 "feat: add feature" (2026-10-20)

## Languages & Frameworks

| Language | File Count | Primary Framework | Evidence |
|----------|------------|-------------------|----------|
| TypeScript | 1,247 | Next.js 14, React 18 | package.json deps |
| Python | 312 | FastAPI, Pydantic | pyproject.toml deps |

## Architecture

```
repo/
├── apps/
│   ├── web/          # Next.js frontend (Observed)
│   └── api/          # FastAPI backend (Observed)
├── packages/
│   ├── shared/       # Shared types, utilities (Observed)
│   └── database/     # Prisma schema, migrations (Observed)
├── infrastructure/   # Terraform, Kubernetes (Observed)
└── docs/             # Documentation (Partial)
```

## Entry Points

| Type | Path | Description | Evidence |
|------|------|-------------|----------|
| Web App | `apps/web/app/page.tsx` | Next.js App Router entry | File exists |
| API Server | `apps/api/main.py` | FastAPI application factory | File exists, uvicorn in deps |
| CLI | `packages/cli/src/index.ts` | Command line interface | package.json bin field |
| Tests | `apps/api/tests/` | Pytest test suite | Directory exists |

## Module Relationships

- `apps/web` → depends on → `packages/shared`, `packages/database`
- `apps/api` → depends on → `packages/shared`, `packages/database`
- `packages/shared` → no internal deps
- `packages/database` → no internal deps

## Build & Test Commands

| Command | Purpose | Verified | Source |
|---------|---------|----------|--------|
| `pnpm install` | Install deps | Yes | package.json |
| `pnpm build` | Build all apps | Yes (dry-run) | package.json scripts |
| `pnpm test` | Run all tests | Yes (unit only) | package.json scripts |
| `pnpm lint` | Lint all | Yes | package.json scripts |
| `pnpm db:migrate` | Run migrations | Not Run | package.json scripts |

## Configuration

| Config Type | Files | Pattern | Evidence |
|-------------|-------|---------|----------|
| Env vars | `.env.local`, `.env.production` | `NEXT_PUBLIC_*`, `DATABASE_URL` | Files exist |
| App config | `apps/web/next.config.js`, `apps/api/config.py` | Module exports / Pydantic Settings | Files exist |
| Infra | `infrastructure/main.tf` | Terraform HCL | Directory exists |

## Security-Sensitive Files

| Category | Files Found | Redacted Details |
|----------|-------------|------------------|
| Local env | `.env.local` | Contains DATABASE_URL, API_KEY_*** |
| CI/CD | `.github/workflows/deploy.yml` | References `${{ secrets.* }}` |
| Infra | `infrastructure/main.tf` | References `var.db_password` |

## Documentation Assessment

| Document | Status | Notes |
|----------|--------|-------|
| README.md | Good | Current, has quickstart |
| CONTRIBUTING.md | Missing | Not found |
| ARCHITECTURE.md | Missing | Not found |
| API Docs | Partial | OpenAPI spec at `/docs/api.yaml` |
| Changelog | Good | CHANGELOG.md maintained |

## Uncertainties & Assumptions

| Item | Type | Details |
|------|------|---------|
| Worker process | Assumed | No obvious worker entry point; may use external queue |
| Auth strategy | Assumed | NextAuth in deps but no config found |
| Deployment target | Observed | Terraform points to AWS ECS |

## Recommendations

1. Add CONTRIBUTING.md with development setup
2. Document architecture in ARCHITECTURE.md
3. Verify worker/background job setup
4. Add secret scanning to CI
```

### Machine-Readable (JSON)

```json
{
  "repository": {
    "path": "/path/to/repo",
    "git_remote": "git@github.com:org/repo.git",
    "branch": "main",
    "last_commit": "abc1234"
  },
  "languages": [
    {"language": "TypeScript", "file_count": 1247, "framework": "Next.js 14", "evidence": "package.json"},
    {"language": "Python", "file_count": 312, "framework": "FastAPI", "evidence": "pyproject.toml"}
  ],
  "architecture": {
    "diagram": "repo/\\n├── apps/\\n│   ├── web/\\n│   └── api/\\n├── packages/\\n│   ├── shared/\\n│   └── database/\\n├── infrastructure/\\n└── docs/",
    "components": [
      {"name": "web", "type": "frontend", "path": "apps/web", "status": "Observed"},
      {"name": "api", "type": "backend", "path": "apps/api", "status": "Observed"}
    ]
  },
  "entry_points": [
    {"type": "web", "path": "apps/web/app/page.tsx", "status": "Observed"},
    {"type": "api", "path": "apps/api/main.py", "status": "Observed"}
  ],
  "build_test_commands": [
    {"command": "pnpm test", "purpose": "test", "verified": true, "source": "package.json"}
  ],
  "security_findings": [
    {"category": "env", "files": [".env.local"], "redacted": true}
  ],
  "documentation": [
    {"doc": "README.md", "status": "Good"},
    {"doc": "CONTRIBUTING.md", "status": "Missing"}
  ],
  "uncertainties": [
    {"item": "Worker process", "type": "Assumed", "details": "No obvious entry point"}
  ]
}
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll figure it out as I go" | You'll make wrong assumptions. Discovery takes minutes; fixing wrong assumptions takes hours. |
| "The code is self-documenting" | Code shows *what*, not *why*. Architecture, conventions, and intent are invisible. |
| "I know this framework, I don't need to check" | Every project customizes. Config, conventions, and structure vary wildly. |
| "Documentation is probably up to date" | It rarely is. Verify commands actually work. |
| "Security files are obvious" | Secrets hide in config, CI, infra, test fixtures. Systematic search required. |
| "I can just ask the team" | Team knowledge is tribal and inconsistent. Build your own map first. |

## Red Flags

- Agent starts coding without running discovery commands
- Agent assumes framework version without checking manifest
- Agent uses wrong test command (e.g., `npm test` in a pytest project)
- Agent misses monorepo structure and treats subpackage as root
- Agent doesn't check for environment-specific configs
- Agent reports "no secrets" without checking `.env*`, CI, infra
- Agent treats missing documentation as "not needed"

## Known Limitations

- Cannot discover runtime-only behavior (dynamic imports, plugin systems)
- Cannot verify external service contracts without network
- Monorepos may need per-package onboarding (sampling used)
- Private/internal packages not on public registries opaque
- Generated code (protobuf, GraphQL) may obscure actual structure
- "Assumed" items may be wrong — verify before depending on them

## References

- addyosmani/agent-skills: TDD "Discover the Stack First", skill-anatomy.md
- UnitOneAI/SecuritySkills: manifest discovery patterns
- Repository's own README, CONTRIBUTING, CI workflows, package manifests