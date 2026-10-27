---
name: environment-config-safety
description: Helps agents review application and deployment configuration changes before they cause failures or security incidents. Use when reviewing config changes, Docker/Compose files, CI/CD pipelines, environment variables, or before deploying.
license: MIT
allowed-tools: [Read, Write, Edit, Bash, Grep, Glob, Task]
compatibility:
  - claude-code
  - openai-codex
  - cursor
  - generic
---

# Environment Config Safety

## Overview

This skill helps agents review application and deployment configuration changes before they cause failures or security incidents. It covers environment variables, Docker/Compose, CI/CD, application configs, database settings, secret references, environment differences, missing variables, invalid config, destructive commands, drift, runtime assumptions, and rollback considerations. It uses validators and dry-run mechanisms where appropriate, and never treats a successful syntax check as proof that a deployment will work.

## Scope

**Covers:**
- Environment variable validation (required, format, secrets)
- Docker and Docker Compose configuration review
- CI/CD pipeline configuration review
- Application configuration files (YAML, TOML, JSON, INI, .env)
- Database connection settings
- Secret references (not values)
- Development vs staging vs production differences
- Missing required variables
- Invalid configuration syntax
- Destructive deployment commands detection
- Configuration drift detection
- Runtime assumption validation
- Rollback and recovery considerations

**Does NOT cover:**
- Actual deployment execution
- Infrastructure provisioning (Terraform, CloudFormation — use checkov)
- Secret rotation (use `secret-leak-prevention`)
- Runtime monitoring
- Network/security policy validation

## When to Use

**Use when:**
- Reviewing configuration changes in PRs
- Before deploying to any environment
- Adding/modifying environment variables
- Changing Docker/Compose files
- Modifying CI/CD pipelines
- Reviewing database configuration changes
- Onboarding to a new repository (with `repository-onboarding`)

**When NOT to use:**
- For runtime configuration validation
- As a substitute for staging deployment testing
- When user explicitly declines config review

## Prerequisites

**Required tools (as available):**
- `hadolint` — Dockerfile linter: `brew install hadolint`
- `checkov` — IaC scanner: `pip install checkov`
- `docker compose config` — Validate Compose files
- `yamllint` — YAML syntax: `pip install yamllint`
- `jsonlint` / `jq` — JSON validation
- `toml` / `taplo` — TOML validation
- `dotenv-linter` — .env validation: `cargo install dotenv-linter`
- `shellcheck` — Shell script validation: `brew install shellcheck`

**Optional tools:**
- `kubeval` / `kubeconform` — Kubernetes manifests
- `helm lint` — Helm charts
- `terraform validate` — Terraform (if applicable)

**Required context:**
- Repository with configuration files
- Knowledge of target environments (dev/staging/prod)
- Ability to run read-only validation commands

**Required capabilities:**
- File reading
- Command execution
- Diff analysis
- Pattern matching

## Workflow

### Phase 1: Inventory Configuration Files

1. **Find all config files** — Search for:
   - Environment: `.env*`, `.env.*.local`, `config/`, `settings/`, `conf/`
   - Docker: `Dockerfile*`, `docker-compose*.yml`, `docker-compose*.yaml`, `.dockerignore`
   - CI/CD: `.github/workflows/*.yml`, `.gitlab-ci.yml`, `Jenkinsfile`, `.circleci/config.yml`, `azure-pipelines.yml`
   - App: `config/*.yaml`, `config/*.toml`, `config/*.json`, `*.config.js`, `*.config.ts`, `pyproject.toml` `[tool.*]`
   - K8s: `k8s/*.yaml`, `helm/*.yaml`, `charts/*.yaml`
   - Terraform: `*.tf`, `*.tfvars`
2. **Categorize by type and environment** — dev, staging, prod, test

### Phase 2: Validate Syntax and Structure

3. **Validate each file with appropriate linter:**
   - Dockerfile: `hadolint Dockerfile`
   - Docker Compose: `docker compose -f docker-compose.yml config --quiet`
   - YAML: `yamllint -d relaxed config.yaml`
   - JSON: `jq empty config.json`
   - TOML: `taplo check config.toml`
   - .env: `dotenv-linter .env`
   - Shell: `shellcheck script.sh`
   - CI/CD: Platform-specific lint (GitHub Actions: `actionlint`)
4. **Record syntax errors** — File, line, error message

### Phase 3: Check Required Variables

5. **Extract required variables** — From:
   - Application code (config validation libraries: pydantic-settings, viper, convict, zod)
   - Documentation (README, CONTRIBUTING, docs/)
   - Example files (`.env.example`, `.env.template`, `config.example.yaml`)
   - CI/CD workflows (env blocks, secrets references)
6. **Check each environment** — For dev/staging/prod:
   - Variable present?
   - Variable has valid format? (URL, email, integer, enum)
   - Variable references secret? (flag, don't validate value)
7. **Report missing/invalid** — Per environment

### Phase 4: Detect Secret Leaks in Config

6. **Scan config files for hardcoded secrets** — Use patterns:
   - `password\s*[:=]\s*["\']?[^"\'\s]+`
   - `api[_-]?key\s*[:=]\s*["\']?[^"\'\s]+`
   - `secret\s*[:=]\s*["\']?[^"\'\s]+`
   - `token\s*[:=]\s*["\']?[^"\'\s]+`
   - Private key patterns (`-----BEGIN.*PRIVATE KEY-----`)
7. **Check for secret references** — `${{ secrets.* }}`, `${VAR}`, `{{ secret }}`, `vault:`, `sops:`, `age:`
8. **Report findings** — Location, type, redacted (use `secret-leak-prevention` for full scan)

### Phase 5: Analyze Environment Differences

9. **Compare dev/staging/prod configs** — For each variable:
   - Value differs? (Expected for secrets, URLs, replicas)
   - Variable missing in one env?
   - Variable only in one env?
10. **Flag risky differences** —
    - Debug mode enabled in prod
    - Dev database URL in staging/prod
    - Secret values (not refs) in non-dev
    - Replica count = 1 in prod
    - Resource limits missing in prod

### Phase 6: Detect Destructive Commands

11. **Scan deployment scripts/CI/CD for:**
    - `rm -rf /`, `rm -rf *`, `rm -rf .`
    - `drop database`, `drop table`, `truncate`
    - `terraform destroy`, `pulumi destroy`
    - `kubectl delete namespace`, `kubectl delete pv`
    - `docker system prune -a`, `docker volume prune`
    - `npm run clean` / `make clean` in deploy context
    - `migrate down`, `db:rollback` in production pipeline
12. **Flag with context** — File, line, command, environment

### Phase 7: Validate Configuration Drift

13. **If deployed environment accessible:**
    - Compare deployed config vs desired config (git)
    - Tools: `kubectl get configmap -o yaml`, `docker inspect`, `aws ssm get-parameters`
14. **Report drift** — Variable, desired value, actual value, environment

### Phase 8: Validate Runtime Assumptions

15. **Extract assumptions from code/docs** —
    - "Assumes PostgreSQL 14+"
    - "Requires REDIS_URL with TLS"
    - "Expects AWS credentials in env"
    - "Needs /tmp writable"
16. **Check against target environment** —
    - Database version matches?
    - TLS certificates available?
    - Credentials provided via expected mechanism?
    - Filesystem permissions correct?
17. **Report mismatches** — Assumption, expected, actual, risk

### Phase 9: Review Rollback and Recovery

18. **Check for rollback mechanisms:**
    - Blue/green or canary deployment config
    - Database migration rollback scripts (`down` migrations)
    - Config versioning (ConfigMap versions, parameter store versions)
    - Feature flags for quick disable
    - Health checks and readiness probes
19. **Assess recovery time** — Estimated rollback duration
20. **Flag gaps** — No rollback path, irreversible changes

### Phase 10: Dry-Run Validation (If Possible)

21. **Run deployment dry-run:**
    - `docker compose -f docker-compose.yml -f docker-compose.prod.yml config`
    - `kubectl apply --dry-run=client -f k8s/`
    - `helm template release ./chart --dry-run`
    - `terraform plan`
    - CI/CD platform dry-run (GitHub Actions: `act`, GitLab: `gitlab-ci-local`)
22. **Record dry-run result** — Success / Failure / Not Available

### Phase 11: Produce Safety Report

23. **Generate structured report** — Using the reporting format below
24. **Flag items requiring human approval** — Destructive commands, secret changes, prod config changes
25. **Explicit disclaimer** — "Syntax validation passed ≠ deployment will succeed"

## Safety Constraints

- **NEVER** treat syntax check as proof of deployment success
- **NEVER** print full secret values — redact in all reports
- **NEVER** execute deployment commands — dry-run only
- **NEVER** modify configuration files during review
- **NEVER** approve destructive commands without explicit human confirmation
- **NEVER** assume environment parity without verification
- **ALWAYS** require human approval for: prod config changes, secret additions, destructive commands
- **ALWAYS** report when validators unavailable
- **ALWAYS** distinguish syntax validity from semantic correctness

## Error Handling

| Situation | Behavior |
|---|---|
| Validator not installed | Report "Not Run — [tool] not installed"; provide install instructions; continue |
| Validator fails | Report "Failed — [error]"; try alternative; continue |
| No example config | Report "Unknown — no .env.example or docs found"; flag all vars as unverified |
| Cannot access deployed env | Report "Not Run — deployed environment inaccessible"; note drift check skipped |
| Dry-run not supported | Report "Not Run — dry-run not available for [platform]" |
| Config file unreadable | Report "Failed — permission denied"; continue |

## Verification

After completing review:

- [ ] All config files inventoried and categorized
- [ ] Syntax validation run on all files (where tools available)
- [ ] Required variables checked per environment
- [ ] Secret leaks scanned (hardcoded + references)
- [ ] Environment differences analyzed
- [ ] Destructive commands detected
- [ ] Drift checked (if deployed env accessible)
- [ ] Runtime assumptions validated
- [ ] Rollback/recovery reviewed
- [ ] Dry-run attempted (where possible)
- [ ] Report generated (Markdown + JSON)
- [ ] Disclaimer included: "Syntax OK ≠ Deployment OK"

## Reporting Format

### Human-Readable (Markdown)

```markdown
# Environment Config Safety Report

## Review Summary
- **Repository**: /path/to/repo
- **Branch**: feature/config-update
- **Target Environment**: production
- **Review Date**: 2026-10-23T10:30:00Z
- **Validators Available**: hadolint, yamllint, docker compose, checkov, shellcheck
- **Validators Missing**: kubeval, terraform

## File Inventory

| Type | Files | Validated | Errors |
|------|-------|-----------|--------|
| Environment | 4 (.env, .env.prod, .env.example, .env.staging) | 4 | 0 |
| Docker | 3 (Dockerfile, docker-compose.yml, docker-compose.prod.yml) | 3 | 0 |
| CI/CD | 2 (.github/workflows/ci.yml, .github/workflows/deploy.yml) | 2 | 1 |
| Application | 5 (config/*.yaml) | 5 | 0 |

## Syntax Validation

| File | Validator | Status | Details |
|------|-----------|--------|---------|
| Dockerfile | hadolint | ✅ Passed | No issues |
| docker-compose.yml | docker compose config | ✅ Passed | Valid |
| .github/workflows/deploy.yml | actionlint | ⚠️ Warning | Line 45: deprecated action `actions/checkout@v2` |

## Required Variables Check

| Variable | Required By | Dev | Staging | Prod | Format Valid |
|----------|-------------|-----|---------|------|--------------|
| DATABASE_URL | app, migrations | ✅ | ✅ | ✅ | ✅ URL |
| REDIS_URL | app | ✅ | ✅ | ❌ **MISSING** | — |
| API_KEY | app | ✅ (ref) | ✅ (ref) | ✅ (ref) | ✅ Ref |
| DEBUG | app | ✅ true | ✅ false | ❌ **true** | ⚠️ Should be false |

## Secret Leak Scan

| File | Line | Type | Status | Redacted |
|------|------|------|--------|----------|
| .env.prod | 12 | Database Password | **Hardcoded** | `postgres://user:****@host/db` |
| docker-compose.yml | 8 | API Key | Reference | `${{ secrets.API_KEY }}` |

## Environment Differences (Prod vs Staging)

| Variable | Staging | Prod | Risk |
|----------|---------|------|------|
| DEBUG | false | **true** | **HIGH** — Debug in production |
| LOG_LEVEL | info | debug | **MEDIUM** — Verbose logs in prod |
| REPLICAS | 3 | **1** | **HIGH** — No HA in prod |
| DB_POOL_SIZE | 20 | **5** | **MEDIUM** — May bottleneck |

## Destructive Commands Detected

| File | Line | Command | Context | Approval Required |
|------|------|---------|---------|-------------------|
| .github/workflows/deploy.yml | 67 | `terraform destroy -auto-approve` | **Production deploy job** | **YES — CRITICAL** |
| scripts/migrate.sh | 12 | `npm run db:rollback` | Migration script | **YES** |

## Configuration Drift

| Variable | Desired (Git) | Actual (Deployed) | Environment |
|----------|---------------|-------------------|-------------|
| FEATURE_NEW_UI | true | false | Production |

## Runtime Assumptions

| Assumption | Source | Target Env Status | Risk |
|------------|--------|-------------------|------|
| PostgreSQL 15+ | README.md | **PostgreSQL 13** | **HIGH** — Incompatible |
| TLS certs in /etc/ssl/certs | Dockerfile | Not verified | MEDIUM |
| AWS creds via IRSA | deploy.yml | IRSA configured | ✅ OK |

## Rollback & Recovery

| Component | Rollback Mechanism | Estimated Time | Status |
|-----------|-------------------|----------------|--------|
| Application | Blue/green (ArgoCD) | 2 min | ✅ Configured |
| Database | Down migrations | 5 min | ⚠️ Missing for v2.3 |
| Config | ConfigMap versioning | 1 min | ✅ Configured |
| Infra | Terraform state backup | 10 min | ⚠️ No recent backup |

## Dry-Run Results

| Platform | Command | Result | Notes |
|----------|---------|--------|-------|
| Docker Compose | `docker compose -f docker-compose.yml -f docker-compose.prod.yml config` | ✅ Success | Valid merged config |
| Kubernetes | `kubectl apply --dry-run=client -f k8s/` | ❌ Failed | Invalid CPU request format |
| GitHub Actions | `act -j deploy` | Not Run | `act` not installed |

## Items Requiring Human Approval

1. **CRITICAL**: `terraform destroy -auto-approve` in production deploy workflow
2. **HIGH**: DEBUG=true in production environment
3. **HIGH**: REPLICAS=1 in production (no HA)
4. **MEDIUM**: Missing down migration for v2.3 database change
5. **MEDIUM**: PostgreSQL version mismatch (assumes 15+, target is 13)

---

⚠️ **DISCLAIMER**: Syntax validation passed does NOT guarantee deployment will succeed. 
This review covers configuration structure and common issues only. 
Always test in staging before production deployment.
```

### Machine-Readable (JSON)

```json
{
  "metadata": {
    "repository": "/path/to/repo",
    "branch": "feature/config-update",
    "target_environment": "production",
    "timestamp": "2026-10-23T10:30:00Z",
    "validators_available": ["hadolint", "yamllint", "docker-compose", "checkov", "shellcheck"],
    "validators_missing": ["kubeval", "terraform"]
  },
  "file_inventory": [
    {"type": "env", "files": 4, "validated": 4, "errors": 0},
    {"type": "docker", "files": 3, "validated": 3, "errors": 0}
  ],
  "syntax_validation": [
    {"file": "Dockerfile", "validator": "hadolint", "status": "Passed", "details": "No issues"},
    {"file": ".github/workflows/deploy.yml", "validator": "actionlint", "status": "Warning", "details": "deprecated action"}
  ],
  "required_variables": [
    {"variable": "DATABASE_URL", "dev": true, "staging": true, "prod": true, "format_valid": true},
    {"variable": "REDIS_URL", "dev": true, "staging": true, "prod": false, "format_valid": null}
  ],
  "secret_findings": [
    {"file": ".env.prod", "line": 12, "type": "Database Password", "status": "Hardcoded", "redacted": "postgres://user:****@host/db"}
  ],
  "env_differences": [
    {"variable": "DEBUG", "staging": "false", "prod": "true", "risk": "HIGH"},
    {"variable": "REPLICAS", "staging": "3", "prod": "1", "risk": "HIGH"}
  ],
  "destructive_commands": [
    {"file": ".github/workflows/deploy.yml", "line": 67, "command": "terraform destroy -auto-approve", "context": "Production deploy", "approval_required": true}
  ],
  "drift": [
    {"variable": "FEATURE_NEW_UI", "desired": true, "actual": false, "environment": "Production"}
  ],
  "assumptions": [
    {"assumption": "PostgreSQL 15+", "source": "README.md", "target_status": "PostgreSQL 13", "risk": "HIGH"}
  ],
  "rollback": [
    {"component": "Application", "mechanism": "Blue/green", "time": "2 min", "status": "Configured"},
    {"component": "Database", "mechanism": "Down migrations", "time": "5 min", "status": "Missing v2.3"}
  ],
  "dry_run": [
    {"platform": "Docker Compose", "result": "Success"},
    {"platform": "Kubernetes", "result": "Failed", "details": "Invalid CPU request"}
  ],
  "approval_required": [
    {"level": "CRITICAL", "item": "terraform destroy in prod deploy"},
    {"level": "HIGH", "item": "DEBUG=true in prod"}
  ],
  "disclaimer": "Syntax validation passed does NOT guarantee deployment will succeed."
}
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Syntax is valid, so it'll deploy fine" | Syntax ≠ semantics. Valid YAML can reference non-existent secrets, wrong ports, incompatible versions. |
| "It works in dev, so it'll work in prod" | Dev ≠ prod. Different scale, network, secrets, resources, versions. |
| "We have CI, it'll catch problems" | CI validates syntax/tests, not production deployment semantics. |
| "The variable is optional" | If code assumes it exists, it's not optional. Check the code, not the docs. |
| "Secrets are in Vault, so config is safe" | Config may reference wrong secret path, wrong key, or missing secret entirely. |
| "Rollback is just 'git revert'" | Config changes may need DB migration rollback, cache clear, DNS flip — not just code revert. |
| "Dry-run succeeded, so deploy will work" | Dry-run validates API acceptance, not runtime behavior (OOM, timeout, permission). |

## Red Flags

- Agent says "config looks good" without running any validators
- Agent doesn't check for hardcoded secrets in config files
- Agent ignores environment differences (dev vs prod)
- Agent doesn't flag destructive commands in deploy pipelines
- Agent treats missing required variable as "optional"
- Agent assumes secret references are correct without verification
- Agent doesn't check rollback mechanisms
- Agent skips dry-run because "it worked last time"
- Agent doesn't validate runtime assumptions against target environment

## Known Limitations

- Cannot validate runtime behavior (OOM, timeouts, permission errors)
- Cannot verify external service connectivity (DB, Redis, APIs) without network
- Cannot verify secret values — only references and presence
- Drift detection requires access to deployed environment
- Dry-run availability varies by platform (not all support it)
- Assumption extraction from code is heuristic — may miss implicit assumptions
- Cannot assess performance impact of config changes
- Kubernetes/Helm/Terraform validation requires respective CLIs
- Configuration as code (Pulumi, CDK) needs language-specific analysis

## References

- hadolint: https://github.com/hadolint/hadolint
- checkov: https://github.com/bridgecrewio/checkov
- docker compose: https://docs.docker.com/compose/
- yamllint: https://github.com/adrienverge/yamllint
- dotenv-linter: https://github.com/dotenv-linter/dotenv-linter
- shellcheck: https://www.shellcheck.net/
- actionlint: https://github.com/rhysd/actionlint
- kubeval: https://github.com/instrumenta/kubeval
- kubeconform: https://github.com/yannh/kubeconform
- 12-factor app: https://12factor.net/config
- Kubernetes ConfigMap/Secret best practices
- Terraform best practices: https://www.terraform-best-practices.com/