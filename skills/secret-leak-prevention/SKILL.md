---
name: secret-leak-prevention
description: Helps agents identify potential credential exposure and recommend safe remediation. Use when reviewing code changes, auditing repositories, or before committing/pushing changes.
license: MIT
allowed-tools: [Read, Write, Edit, Bash, Grep, Glob, Task]
compatibility:
  - claude-code
  - openai-codex
  - cursor
  - generic
---

# Secret Leak Prevention

## Overview

This skill helps agents identify potential credential exposure in source code, Git history, configuration files, and environment files. It provides a workflow for detection, verification, assessment, and safe remediation guidance. It never uses real production credentials in tests, never prints full detected secret values in reports, and never automatically revokes credentials or rewrites Git history without authorization.

## Scope

**Covers:**
- Secret detection in source code (working tree)
- Secret detection in Git history
- Secrets in environment and configuration files
- API tokens, cloud credentials, private keys
- False positive management
- Secret redaction in reports
- Credential rotation guidance
- Git history remediation guidance (with warnings)

**Does NOT cover:**
- Actual credential revocation (requires auth)
- Automatic Git history rewriting (requires auth + explicit approval)
- Secret storage/management (vaults)
- Runtime secret scanning (memory, logs)
- Supply chain secret scanning (dependencies)

## When to Use

**Use when:**
- Reviewing code changes before commit/push
- Auditing a repository for historical leaks
- Onboarding to a new repository (with `repository-onboarding`)
- Before deploying configuration changes
- After discovering a potential leak

**When NOT to use:**
- As a substitute for dedicated secret scanning in CI/CD
- For real-time production monitoring
- When user explicitly declines secret scanning

## Prerequisites

**Required tools (at least one):**
- `gitleaks` — `brew install gitleaks` / `go install github.com/gitleaks/gitleaks@latest`
- `trufflehog` — `brew install trufflehog` / `pip install trufflehog`
- `git` — for history scanning

**Optional tools:**
- `detect-secrets` — `pip install detect-secrets`
- `ggshield` — GitGuardian CLI

**Required context:**
- Repository access (local clone)
- Ability to run read-only scanning commands

**Required capabilities:**
- Command execution
- File reading
- Output parsing

## Workflow

### Phase 1: Choose Detection Strategy

1. **Determine scope** — Working tree only, or include Git history?
2. **Select tool(s)** — Prefer `trufflehog` for verification, `gitleaks` for speed
3. **Check tool availability** — Run `gitleaks version` or `trufflehog --version`

### Phase 2: Scan Working Tree

4. **Run gitleaks on working tree** — `gitleaks detect --source . --verbose --redact --report-format json --report-path gitleaks-report.json`
5. **Run trufflehog on working tree** — `trufflehog filesystem --directory . --json --fail` (verifies secrets)
6. **Run detect-secrets** — `detect-secrets scan --all-files --baseline .secrets.baseline`

### Phase 3: Scan Git History (If Requested)

7. **Run gitleaks on history** — `gitleaks detect --source . --log-opts="--all" --verbose --redact --report-format json --report-path gitleaks-history-report.json`
8. **Run trufflehog on history** — `trufflehog git file://. --json --fail` (verifies historical secrets)

### Phase 4: Scan Configuration Files

9. **Find config files** — `.env*`, `*.yaml`, `*.yml`, `*.toml`, `*.json`, `*.ini`, `*.conf`, `config/`, `settings/`
10. **Scan each config file** — Use gitleaks/trufflehog with `--config-path` or manual grep for patterns
11. **Check for secret references** — `${{ secrets.* }}`, `${VAR}`, `{{ secret }}`, `vault:`, `sops:`

### Phase 5: Verify and Triage Findings

12. **Deduplicate findings** — Same secret in multiple locations
13. **Verify each finding** — TruffleHog verification; check if secret is:
    - **Active/Valid** — Still works (highest priority)
    - **Revoked/Expired** — No longer works
    - **Placeholder/Test** — `test_key`, `example`, `dummy`, `fake`
    - **False Positive** — Pattern match but not a secret (e.g., UUID, hash, example key)
14. **Classify severity** — Critical (production creds), High (staging creds), Medium (dev creds), Low (placeholders)

### Phase 6: Assess Exposure

15. **Determine exposure window** — When was secret committed? When detected?
16. **Check access logs** — If available, check for unauthorized access
17. **Identify affected systems** — What services/systems does the secret grant access to?
18. **Check for lateral movement** — Same secret used elsewhere?

### Phase 7: Generate Remediation Plan

19. **For each verified secret, recommend:**
    - **Immediate**: Rotate/revoke the credential
    - **Short-term**: Remove from code/config, use secret manager
    - **History**: Consider Git history rewrite (BFG, git-filter-repo) — **requires explicit approval**
20. **Provide rotation procedures** per secret type (see references)
21. **Document false positives** — Add to allowlist/baseline

### Phase 8: Produce Report

22. **Generate structured report** — Using the reporting format below
23. **Redact all secret values** — Show only type, location, first/last 4 chars
24. **Include verification status** — Verified / Revoked / Placeholder / False Positive
25. **Flag history findings separately** — Require explicit approval for history rewrite

## Safety Constraints

- **NEVER** print full secret values in any output (report, logs, terminal)
- **NEVER** transmit detected secrets to external services
- **NEVER** automatically revoke or rotate credentials
- **NEVER** rewrite Git history without explicit user approval
- **NEVER** use real production credentials in tests or examples
- **NEVER** suggest committing fixes that expose secrets in new commits
- **ALWAYS** redact: show `API_KEY: sk_live_****abcd` not `sk_live_abcdef123456`
- **ALWAYS** use synthetic credentials in test fixtures
- **ALWAYS** require human approval for: rotation, history rewrite, deployment of fixes

## Error Handling

| Situation | Behavior |
|-----------|----------|
| No scanner installed | Report "Not Run — gitleaks/trufflehog not installed"; provide install instructions |
| Scanner fails | Report "Failed — [error output]"; try alternative scanner |
| No findings | Report "Verified — no secrets detected" with scanner output |
| Network unavailable (trufflehog verification) | Report "Partially Verified — local scan only, verification skipped"; note limitation |
| Large repo (history scan timeout) | Report "Not Run — history scan timeout"; suggest targeted scan |
| Permission denied | Report "Not Run — permission denied"; continue with accessible paths |

## Verification

After completing scan:

- [ ] At least one scanner ran successfully
- [ ] Working tree scanned
- [ ] Git history scanned (if requested)
- [ ] Configuration files scanned
- [ ] All findings verified or classified
- [ ] No full secret values in report
- [ ] Redacted report generated (Markdown + JSON)
- [ ] Remediation plan with rotation guidance
- [ ] False positives documented
- [ ] History rewrite warnings included if applicable

## Reporting Format

### Human-Readable (Markdown)

```markdown
# Secret Leak Prevention Report

## Scan Summary
- **Repository**: /path/to/repo
- **Branch**: main
- **Scan Date**: 2026-10-23T10:30:00Z
- **Scanners Used**: gitleaks v8.18.0, trufflehog v3.81.0
- **Scope**: Working tree + Git history (last 100 commits)
- **Total Findings**: 7 (3 verified, 2 placeholders, 2 false positives)

## Verified Secrets (Require Immediate Action)

| # | Type | Location | Commit | Status | Rotation Guide |
|---|------|----------|--------|--------|----------------|
| 1 | AWS Access Key | `config/aws.yaml:12` | a1b2c3d | **Active** | [AWS Key Rotation](references/rotation/aws.md) |
| 2 | GitHub Token | `.github/workflows/deploy.yml:45` | e4f5g6h | **Active** | [GitHub Token Rotation](references/rotation/github.md) |
| 3 | Database URL | `.env.local:3` | (uncommitted) | **Active** | [DB Credential Rotation](references/rotation/database.md) |

## Placeholders / Test Credentials (No Action Needed)

| # | Type | Location | Reason |
|---|------|----------|--------|
| 4 | API Key | `tests/fixtures/api_test.py:10` | Value: `test_key_12345` |
| 5 | JWT Secret | `config/test.yaml:5` | Value: `test_secret_do_not_use` |

## False Positives

| # | Pattern | Location | Reason |
|---|---------|----------|--------|
| 6 | Generic API Key | `src/utils/crypto.ts:22` | UUID used as ID, not secret |
| 7 | Private Key | `docs/example.pem` | Example certificate in documentation |

## Git History Findings

| # | Type | Commit | File | Status | Action Required |
|---|------|--------|------|--------|-----------------|
| 8 | Slack Webhook | b7c8d9e | `old/notifications.py` | **Revoked** | History rewrite recommended (see warning) |

⚠️ **HISTORY REWRITE WARNING**: Commit b7c8d9e contains a revoked Slack webhook. 
Rewriting history requires `git filter-repo` or BFG Repo-Cleaner. 
This changes all commit SHAs after that point. 
**Requires explicit team approval and coordination.**

## Remediation Plan

### Immediate (Today)
1. Rotate AWS Access Key in AWS Console → update in secret manager
2. Rotate GitHub Token in GitHub Settings → update in GitHub Actions secrets
3. Move DATABASE_URL from `.env.local` to secret manager; add `.env.local` to `.gitignore`

### Short-term (This Sprint)
1. Add gitleaks to pre-commit hook
2. Add trufflehog to CI pipeline
3. Set up secret scanning in GitHub/GitLab

### Process Improvements
1. Adopt `.secrets.baseline` for detect-secrets
2. Document secret management in CONTRIBUTING.md
3. Regular secret rotation schedule

## Redacted Finding Details (for reference)

```json
{
  "findings": [
    {
      "rule_id": "aws-access-key",
      "file": "config/aws.yaml",
      "line": 12,
      "secret_type": "AWS Access Key",
      "redacted_value": "AKIA****ABCD",
      "verified": true,
      "commit": "a1b2c3d",
      "entropy": 4.2
    }
  ]
}
```

### Machine-Readable (JSON)

```json
{
  "scan_metadata": {
    "repository": "/path/to/repo",
    "branch": "main",
    "timestamp": "2026-10-23T10:30:00Z",
    "scanners": ["gitleaks v8.18.0", "trufflehog v3.81.0"],
    "scope": "working_tree + history"
  },
  "summary": {
    "total": 7,
    "verified": 3,
    "placeholders": 2,
    "false_positives": 2,
    "history_findings": 1
  },
  "verified_secrets": [
    {
      "id": 1,
      "type": "AWS Access Key",
      "location": "config/aws.yaml:12",
      "commit": "a1b2c3d",
      "status": "Active",
      "redacted": "AKIA****ABCD",
      "rotation_guide": "references/rotation/aws.md"
    }
  ],
  "placeholders": [
    {"id": 4, "type": "API Key", "location": "tests/fixtures/api_test.py:10", "reason": "test_key_12345"}
  ],
  "false_positives": [
    {"id": 6, "pattern": "Generic API Key", "location": "src/utils/crypto.ts:22", "reason": "UUID"}
  ],
  "history_findings": [
    {
      "id": 8,
      "type": "Slack Webhook",
      "commit": "b7c8d9e",
      "file": "old/notifications.py",
      "status": "Revoked",
      "history_rewrite_required": true,
      "warning": "Requires explicit team approval"
    }
  ],
  "remediation": {
    "immediate": [
      "Rotate AWS Access Key in AWS Console",
      "Rotate GitHub Token in GitHub Settings",
      "Move DATABASE_URL to secret manager"
    ],
    "short_term": [
      "Add gitleaks to pre-commit hook",
      "Add trufflehog to CI pipeline",
      "Set up secret scanning in GitHub/GitLab"
    ],
    "process": [
      "Adopt .secrets.baseline for detect-secrets",
      "Document secret management in CONTRIBUTING.md",
      "Regular secret rotation schedule"
    ]
  }
}
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "It's just a dev key, doesn't matter" | Dev keys often have broader access than needed; attackers pivot from dev to prod. |
| "The repo is private, no one can see it" | Private repos get compromised; insiders leak; supply chain attacks target private deps. |
| "I'll rotate it later" | Later never comes. Rotate now; the scan proves it's exposed. |
| "It's in .gitignore so it's fine" | `.gitignore` doesn't remove from history. If already committed, it's in Git. |
| "TruffleHog didn't verify it, so it's not real" | Verification can fail for network/rate-limit reasons. Treat unverified as suspicious. |
| "This is a false positive, I recognize the pattern" | Document it in baseline/allowlist. Don't just dismiss silently. |
| "History rewrite is too risky" | It is risky. But leaving secrets in history is also risky. Decide explicitly. |

## Red Flags

- Agent says "no secrets found" but didn't run a scanner
- Agent finds secret but doesn't verify with trufflehog
- Agent prints full secret value in report or terminal
- Agent suggests "just delete the file" for history findings
- Agent doesn't check Git history, only working tree
- Agent ignores `.env*` files in scan
- Agent doesn't provide rotation guidance
- Agent recommends history rewrite without warning about SHA changes

## Known Limitations

- Cannot detect secrets in compiled/binary artifacts
- Cannot detect secrets in external secret managers (Vault, AWS Secrets Manager)
- Verification requires network access to target APIs
- Rate limits on verification APIs (GitHub, AWS, etc.)
- Cannot prove a secret was NEVER accessed — only that it's currently valid/invalid
- Large Git history scans can be slow (hours for big repos)
- Encrypted secrets (SOPS, age) appear as false positives unless decrypted
- Placeholder detection is heuristic — may miss custom patterns

## References

- gitleaks: https://github.com/gitleaks/gitleaks
- trufflehog: https://github.com/trufflesecurity/trufflehog
- detect-secrets: https://github.com/Yelp/detect-secrets
- BFG Repo-Cleaner: https://rtyley.github.io/bfg-repo-cleaner/
- git-filter-repo: https://github.com/newren/git-filter-repo
- GitHub Secret Scanning: https://docs.github.com/en/code-security/secret-scanning
- GitLab Secret Detection: https://docs.gitlab.com/ee/user/application_security/secret_detection/
- NIST SP 800-53: IA-5 (Authenticator Management)
- OWASP Secrets Management Cheat Sheet

## Rotation Guides (in references/rotation/)

- `aws.md` — AWS Access Key / Secret Key rotation
- `github.md` — GitHub Personal Access Token / Fine-grained token rotation
- `database.md` — Database credential rotation (PostgreSQL, MySQL, MongoDB)
- `slack.md` — Slack webhook / bot token rotation
- `stripe.md` — Stripe API key rotation
- `sendgrid.md` — SendGrid API key rotation
- `generic.md` — Generic API key rotation procedure