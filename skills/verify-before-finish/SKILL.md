---
name: verify-before-finish
description: Helps AI coding agents verify their work before reporting a task as completed. Use when finishing any implementation, fix, or change to ensure evidence-based completion reporting.
license: MIT
allowed-tools: [Read, Write, Edit, Bash, Grep, Glob, Task]
compatibility:
  - claude-code
  - openai-codex
  - cursor
  - generic
---

# Verify Before Finish

## Overview

This skill establishes an evidence-based verification workflow that prevents agents from claiming completion without proof. It inspects the original task, identifies acceptance criteria, examines changes, selects appropriate checks, inspects actual command results, and produces a truthful completion report. It never invents test results or claims comprehensive correctness merely because a limited set of checks passed.

## Scope

**Covers:**
- Acceptance criteria verification
- Diff inspection and unrelated file detection
- Test execution and result inspection
- Build/compilation verification
- Assumption vs. fact distinction
- Missing check reporting

**Does NOT cover:**
- Security auditing (use `secret-leak-prevention`, `dependency-risk-assessment`)
- Configuration validation (use `environment-config-safety`)
- Code quality review (use separate review process)
- Runtime behavior verification beyond tests

## When to Use

**Use when:**
- Reporting any task as "done" or "complete"
- Finishing a feature implementation
- Completing a bug fix
- Making configuration changes
- Before creating a pull request or commit

**When NOT to use:**
- During exploratory coding (not claiming completion)
- For pure documentation updates with no code changes
- When explicitly asked to skip verification (user assumes responsibility)

## Prerequisites

**Required tools:**
- `git` — for diff inspection
- Repository's test command (npm test, pytest, go test, cargo test, ./gradlew test, etc.)
- Repository's build command (npm build, cargo build, go build, etc.)

**Required context:**
- Original task description with acceptance criteria
- Access to the repository
- Ability to run commands in the repository root

**Required capabilities:**
- Agent can execute terminal commands
- Agent can read file contents
- Agent can parse command output

## Workflow

### Phase 1: Understand the Task

1. **Read the original task** — Get the full task description, acceptance criteria, and any referenced issues/PRs
2. **Extract acceptance criteria** — List each verifiable criterion explicitly
3. **Identify the scope** — What files/directories should be affected? What is out of scope?

### Phase 2: Inspect Changes

4. **Run `git diff --stat`** — Get overview of changed files
5. **Run `git diff`** — Inspect actual changes line by line
6. **Flag unrelated changes** — Any modified files outside expected scope
7. **Check for new files** — `git status --porcelain` for untracked files

### Phase 3: Verify Acceptance Criteria

8. **Map each criterion to a check** — For each acceptance criterion, determine how to verify it
9. **Execute verification checks** — Run the actual commands, don't assume
10. **Record evidence** — Capture command output, test results, build logs

### Phase 4: Run Standard Checks

11. **Run tests** — Execute the repository's test command; inspect output, not just exit code
12. **Run build** — Execute build command; verify success
13. **Run linter/formatter** — If configured in repo (ruff, black, eslint, prettier, etc.)
14. **Run type checker** — If configured (mypy, tsc, cargo check, etc.)

### Phase 5: Assess Assumptions

15. **List assumptions made** — During implementation, what did you assume?
16. **Verify each assumption** — Can it be checked? If not, mark as "Unknown"
17. **Document unverifiable assumptions** — Explicitly report what could not be verified

### Phase 6: Produce Completion Report

18. **Generate structured report** — Using the reporting format below
19. **Assign status to each check** — Verified / Partially Verified / Failed / Not Run / Unknown
20. **Make final determination** — Can you truthfully claim completion?

## Safety Constraints

- **NEVER** claim tests passed without running them and inspecting output
- **NEVER** ignore failed tests — report them as Failed
- **NEVER** report implementation complete without checking acceptance criteria
- **NEVER** claim "all tests pass" if only a subset ran
- **NEVER** confuse successful compilation with correct behavior
- **NEVER** report assumptions as verified facts
- **NEVER** fail to report checks that could not be performed
- **ALWAYS** require human approval before: force-pushing, rewriting history, deploying
- **ALWAYS** redact sensitive values in reports (secrets, tokens, keys)

## Error Handling

| Situation | Behavior |
|-----------|----------|
| Test command not found | Report "Not Run — test command not discovered"; suggest checking README/CI |
| Network unavailable for dependency checks | Report "Not Run — network unavailable"; do not substitute cached data |
| No acceptance criteria provided | Report "Unknown — no criteria to verify"; ask user for criteria |
| Build fails | Report "Failed — build error"; include error output |
| Tests fail | Report "Failed — X of Y tests failed"; include failure details |
| Unrelated files changed | Report "Warning — unrelated changes detected"; list files |
| Cannot run a check (permissions, missing tool) | Report "Not Run — [reason]"; do not skip silently |

## Verification

After completing verification workflow:

- [ ] Every acceptance criterion has a verification status with evidence
- [ ] Full diff inspected — no unexplained changes
- [ ] Test suite executed and output inspected (not just exit code)
- [ ] Build completed successfully
- [ ] Linter/type checker passed (if configured)
- [ ] All assumptions listed and verified or marked Unknown
- [ ] Checks that could not run are explicitly reported with reasons
- [ ] No sensitive values in report
- [ ] Report includes both human-readable Markdown and machine-readable JSON

## Reporting Format

### Human-Readable (Markdown)

```markdown
# Verification Report

## Task
[Original task description]

## Acceptance Criteria Verification

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | [Criterion text] | Verified | `pytest tests/test_feature.py::test_x -v` output shows PASSED |
| 2 | [Criterion text] | Failed | `pytest tests/test_feature.py::test_y -v` output shows FAILED: expected 5 got 3 |
| 3 | [Criterion text] | Not Run | Network unavailable — could not verify API integration |

## Changes Inspection

### Files Changed
- `src/feature.py` — Core implementation (expected)
- `tests/test_feature.py` — Tests (expected)
- `config/unrelated.yaml` — **UNEXPECTED** — investigate

### Diff Summary
- 2 files changed, 45 insertions(+), 3 deletions(-)
- No deletions of existing functionality

## Standard Checks

| Check | Status | Details |
|-------|--------|---------|
| Test Suite | Verified | 42 passed, 0 failed, 3 skipped (pytest output attached) |
| Build | Verified | `npm run build` exited 0, artifacts in dist/ |
| Lint | Verified | `ruff check .` — no issues |
| Type Check | Verified | `mypy src/` — success |

## Assumptions

| Assumption | Verified? | Evidence |
|------------|-----------|----------|
| API returns JSON | Verified | Integration test mocks JSON response |
| Database is PostgreSQL | Unknown | Not verified — no DB access in test env |

## Checks Not Performed

- E2E tests — requires staging environment (not available)
- Performance benchmarks — not in scope

## Conclusion

**Overall Status: Partially Verified** — Core functionality verified, but API integration and E2E flows not verified due to environment limitations.

**Recommendation:** Deploy to staging for full verification before production.
```

### Machine-Readable (JSON)

```json
{
  "task": "Original task description",
  "timestamp": "2026-10-23T10:30:00Z",
  "acceptance_criteria": [
    {"id": 1, "criterion": "text", "status": "Verified", "evidence": "command output"},
    {"id": 2, "criterion": "text", "status": "Failed", "evidence": "failure details"}
  ],
  "changes": {
    "files_changed": ["src/feature.py", "tests/test_feature.py"],
    "unexpected_files": ["config/unrelated.yaml"],
    "diff_summary": "2 files changed, 45 insertions(+), 3 deletions(-)"
  },
  "standard_checks": [
    {"name": "Test Suite", "status": "Verified", "details": "42 passed, 0 failed"},
    {"name": "Build", "status": "Verified", "details": "exit code 0"}
  ],
  "assumptions": [
    {"assumption": "API returns JSON", "verified": true, "evidence": "..."},
    {"assumption": "Database is PostgreSQL", "verified": false, "reason": "no DB access"}
  ],
  "checks_not_performed": [
    {"check": "E2E tests", "reason": "staging environment not available"}
  ],
  "overall_status": "Partially Verified",
  "recommendation": "Deploy to staging for full verification"
}
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Tests take too long, I'll just verify the main ones" | Run the full suite. If it's slow, that's a separate infrastructure problem. Partial runs miss regressions. |
| "The build succeeded, so the code must work" | Compilation ≠ correctness. Tests prove behavior; builds only prove syntax. |
| "I already tested it manually" | Manual testing doesn't persist. Automated tests are the only regression guard. |
| "This change is too small to break anything" | Small changes break things most often because they're not scrutinized. |
| "I'll add verification in the next commit" | You won't. Verification happens now or never. |
| "The tests are flaky, so failures don't count" | Flaky tests are a bug. Fix the flakiness or quarantine the test — don't ignore failures. |
| "CI will catch it" | CI runs later. You're claiming done NOW. Verify before you claim. |

## Red Flags

- Agent says "done" but `git diff` shows uncommitted changes
- Agent says "tests pass" but provides no test output
- Agent modified files unrelated to the task
- Agent cannot name the acceptance criteria
- Agent reports "all checks passed" but some are marked "Not Run"
- Agent assumes external service behavior without verification
- Agent skips build/lint/type-check because "it worked before"

## Known Limitations

- Cannot verify runtime behavior without integration tests
- Cannot verify external API contracts without network access
- Cannot verify performance characteristics without benchmarks
- Cannot verify security properties without dedicated security tools
- Relies on repository having discoverable test/build commands
- "Not Run" checks may hide real issues — deploy to staging for full verification
- Does not replace code review — complementary, not substitute

## References

- addyosmani/agent-skills: test-driven-development skill, skill-anatomy.md
- UnitOneAI/SecuritySkills: fixer-policy.md, evidence requirements
- domehahn/skil: assurance-closure.md, behavioral-testing.md
- Repository's README, CONTRIBUTING.md, CI workflow files for command discovery