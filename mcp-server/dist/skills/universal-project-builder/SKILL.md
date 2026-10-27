---
name: universal-project-builder
description: Helps AI agents build almost anything — applications, APIs, websites, scripts, automation workflows, and other software projects — from requirements to working code. Use when starting a new project or significant feature from scratch.
license: MIT
allowed-tools: [Read, Write, Edit, Bash, Grep, Glob, Task]
compatibility:
  - claude-code
  - openai-codex
  - cursor
  - generic
---

# Universal Project Builder

## Overview

This skill provides a unified workflow for building software projects from requirements to working code. It adapts to project type (API, CLI, web app, script, automation), discovers or selects the appropriate toolchain, scaffolds a project structure, and guides incremental implementation with verification checkpoints. It integrates with other skills for verification, onboarding, and safety.

## Scope

**Covers:**
- Project type classification and template selection
- Toolchain discovery and setup
- Requirements clarification and specification
- Task breakdown with acceptance criteria
- Incremental implementation with verification
- Cross-skill integration (verify-before-finish, repository-onboarding, etc.)
- Minimal viable process scaled to project complexity

**Does NOT cover:**
- Actual code generation (agent does this using the workflow)
- Deployment (use `environment-config-safety`)
- Security auditing (use `secret-leak-prevention`, `dependency-risk-assessment`)
- Detailed framework-specific guidance (reference framework docs)

## When to Use

**Use when:**
- Starting a new project from scratch
- Building a significant new feature in an existing project
- Creating a script, automation, or utility
- User says "build me a..." or "create a..."
- Project type is unclear and needs classification

**When NOT to use:**
- For minor changes to existing code
- When user provides explicit implementation instructions
- For maintenance/refactoring tasks

## Prerequisites

**Required tools:**
- `git` — for version control
- Language runtimes as needed: `node`/`npm`/`pnpm`, `python`/`pip`/`uv`, `go`, `rust`/`cargo`, `java`/`mvn`/`gradle`
- Build tools as needed: `make`, `just`, `task`

**Required context:**
- User requirements (functional and non-functional)
- Target environment constraints (if any)
- Access to write files in target directory

**Required capabilities:**
- File creation and editing
- Command execution
- Template rendering
- Task management

## Workflow

### Phase 1: Clarify Requirements

1. **Extract requirements** — From user request, ask clarifying questions:
   - What problem does this solve?
   - Who are the users?
   - What are the functional requirements?
   - What are non-functional requirements (performance, security, scale)?
   - What is the target environment?
   - Any existing constraints (language, framework, platform)?
2. **Document as SPEC.md** — Structured specification with:
   - Problem statement
   - User stories / use cases
   - Functional requirements (numbered, testable)
   - Non-functional requirements
   - Constraints and assumptions
   - Acceptance criteria per requirement

### Phase 2: Classify Project Type

3. **Determine project category:**
   - **Web Application** — Frontend (React, Vue, Svelte, Next.js, Remix) + Backend API
   - **API Service** — REST, GraphQL, gRPC (FastAPI, Express, Go, Rust, Spring)
   - **CLI Tool** — Command-line utility (Python, Go, Rust, Node, Deno)
   - **Script/Automation** — Single-file or small multi-file (Python, Bash, Deno, Node)
   - **Library/Package** — Reusable code (TypeScript, Python, Go, Rust)
   - **Mobile App** — React Native, Flutter, Swift, Kotlin
   - **Desktop App** — Electron, Tauri, PyQt, Flutter
   - **Infrastructure** — Terraform, Pulumi, CDK, Helm
4. **Select or create template** — From `templates/` or generate minimal scaffold

### Phase 3: Discover/Setup Toolchain

5. **Detect existing toolchain** — If in existing repo, use `repository-onboarding` skill
6. **Select toolchain for new project:**
   - Language: Based on requirements, team expertise, ecosystem fit
   - Framework: Based on project type and requirements
   - Build tool: Native to language/framework (npm, cargo, go build, etc.)
   - Test framework: Standard for language (jest, pytest, go test, cargo test)
   - Linter/formatter: Standard (ruff/black, eslint/prettier, gofmt, cargo fmt)
   - Type checker: If applicable (mypy, tsc, cargo check)
7. **Initialize project** — Run init commands, create base files

### Phase 4: Break Down into Tasks

8. **Create task breakdown** — Using `planning-and-task-breakdown` principles:
   - Decompose requirements into small, verifiable tasks
   - Each task has: ID, description, acceptance criteria, dependencies
   - Order by dependency and risk (risky/uncertain first)
   - Save as `tasks/plan.md` and `tasks/todo.md`
9. **Define verification per task** — How to prove each task works

### Phase 5: Incremental Implementation

10. **For each task (in order):**
    - **Implement** — Write code to satisfy acceptance criteria
    - **Verify** — Run task-specific verification (unit test, manual check, build)
    - **Record** — Update todo.md with status and evidence
    - **Commit** — Small, atomic commits with conventional messages
11. **Run cross-cutting checks periodically:**
    - Full test suite
    - Lint/format
    - Type check
    - Build
    - Security scan (if deps added)

### Phase 6: Integration and Polish

12. **Integration testing** — Test component interactions
13. **Documentation** — README, API docs, usage examples
14. **Configuration** — Environment setup, configs for dev/staging/prod
15. **CI/CD** — Basic pipeline (lint, test, build)
16. **Final verification** — Run `verify-before-finish` skill

### Phase 7: Handoff

17. **Produce handoff document** — What's built, how to run, test, deploy, known issues
18. **Tag version** — `v0.1.0` or similar
19. **Clean up** — Remove temporary files, update .gitignore

## Safety Constraints

- **NEVER** assume requirements — clarify ambiguities
- **NEVER** skip verification checkpoints
- **NEVER** commit secrets or credentials
- **NEVER** use unapproved dependencies without `dependency-risk-assessment`
- **NEVER** deploy without `environment-config-safety` review
- **ALWAYS** use synthetic data in examples/tests
- **ALWAYS** require human approval for: framework selection, major architectural decisions, deployment

## Error Handling

| Situation | Behavior |
|---|---|
| Requirements unclear | Ask specific clarifying questions; don't guess |
| Toolchain not available | Report missing tools; suggest alternatives or install |
| Template not found | Generate minimal scaffold from scratch |
| Task verification fails | Stop; debug; don't proceed to next task |
| Dependency risk high | Flag; require human decision |
| Build fails | Fix before continuing |

## Verification

After completing project build:

- [ ] SPEC.md exists with clear requirements
- [ ] Project type classified and template applied
- [ ] Toolchain initialized and verified (build passes)
- [ ] Task breakdown created with acceptance criteria
- [ ] Each task implemented and verified
- [ ] Full test suite passes
- [ ] Lint/format/type-check pass
- [ ] Build produces working artifact
- [ ] `verify-before-finish` skill run and passed
- [ ] Documentation complete (README, usage)
- [ ] CI/CD pipeline configured
- [ ] Handoff document produced

## Reporting Format

### Human-Readable (Markdown)

```markdown
# Project Build Report

## Project
- **Name**: my-api-service
- **Type**: API Service (REST)
- **Language**: Python 3.11
- **Framework**: FastAPI
- **Location**: /path/to/my-api-service

## Requirements
- SPEC.md: 12 functional requirements, 5 non-functional
- Acceptance criteria: 100% defined

## Toolchain
| Component | Choice | Version |
|-----------|--------|---------|
| Language | Python | 3.11 |
| Framework | FastAPI | 0.115 |
| Test | pytest | 8.3 |
| Lint | ruff | 0.6 |
| Format | black | 24.0 |
| Type Check | mypy | 1.11 |

## Task Breakdown

| ID | Task | Status | Verification |
|----|------|--------|--------------|
| 1 | Project scaffold | ✅ Done | `pytest` passes |
| 2 | Database models | ✅ Done | Migration runs |
| 3 | API routes | ✅ Done | Integration tests pass |
| 4 | Auth middleware | ✅ Done | Unit tests pass |
| 5 | Input validation | ✅ Done | Fuzz tests pass |

## Verification Summary
- Unit tests: 47 passed
- Integration tests: 12 passed
- Lint: Clean
- Type check: Clean
- Build: Success
- Security scan: No issues

## Known Issues
- Rate limiting not implemented (deferred to v0.2)
- OpenAPI spec generation needs refinement

## Handoff
- Run: `uv run uvicorn app.main:app --reload`
- Test: `uv run pytest`
- Deploy: See `environment-config-safety` review
```

### Machine-Readable (JSON)

```json
{
  "project": {
    "name": "my-api-service",
    "type": "api_service",
    "language": "python",
    "framework": "fastapi",
    "path": "/path/to/my-api-service"
  },
  "requirements": {
    "spec_file": "SPEC.md",
    "functional_count": 12,
    "non_functional_count": 5,
    "acceptance_criteria_complete": true
  },
  "toolchain": [
    {"component": "language", "choice": "python", "version": "3.11"},
    {"component": "framework", "choice": "fastapi", "version": "0.115"}
  ],
  "tasks": [
    {"id": 1, "name": "Project scaffold", "status": "Done", "verification": "pytest passes"},
    {"id": 2, "name": "Database models", "status": "Done", "verification": "Migration runs"}
  ],
  "verification": {
    "unit_tests": "47 passed",
    "integration_tests": "12 passed",
    "lint": "Clean",
    "type_check": "Clean",
    "build": "Success",
    "security_scan": "No issues"
  },
  "known_issues": ["Rate limiting deferred"],
  "handoff": {
    "run_command": "uv run uvicorn app.main:app --reload",
    "test_command": "uv run pytest"
  }
}
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll just start coding, we can fix structure later" | Structure fixes later cost 10x more. Scaffold first. |
| "This is simple, doesn't need a spec" | Even simple projects benefit from written requirements. |
| "I'll add tests at the end" | Tests written last test implementation, not behavior. |
| "We don't need CI for a small project" | CI catches breaks early. Setup takes minutes. |
| "Let's use the latest alpha framework" | Bleeding edge = broken builds, missing docs, no answers. |
| "Requirements will change anyway" | Write for current requirements; refactor when they change. |

## Red Flags

- Agent starts coding without SPEC.md
- Agent picks framework without checking requirements fit
- Agent skips task breakdown for "simple" projects
- Agent implements multiple tasks before verifying
- Agent doesn't run tests after each task
- Agent adds dependencies without risk assessment
- Agent declares "done" without `verify-before-finish`

## Known Limitations

- Cannot predict all requirement changes
- Template selection may not fit unique needs
- Toolchain discovery limited to known ecosystems
- Cross-skill integration requires those skills to be available
- Does not generate production-ready deployment configs
- Human judgment required for architectural decisions

## References

- addyosmani/agent-skills: spec-driven-development, planning-and-task-breakdown, incremental-implementation, test-driven-development, shipping-and-launch
- templates/ directory in this skill
- verify-before-finish skill
- repository-onboarding skill
- dependency-risk-assessment skill
- environment-config-safety skill