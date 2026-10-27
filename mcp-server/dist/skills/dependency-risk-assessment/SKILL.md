---
name: dependency-risk-assessment
description: Helps agents assess the risks of adding, removing, or updating software dependencies. Use when evaluating dependency changes, upgrading packages, or auditing supply chain risk.
license: MIT
allowed-tools: [Read, Write, Edit, Bash, Grep, Glob, Task]
compatibility:
  - claude-code
  - openai-codex
  - cursor
  - generic
---

# Dependency Risk Assessment

## Overview

This skill helps agents assess the risks of adding, removing, or updating software dependencies. It covers vulnerability scanning, license compliance, supply chain integrity, version compatibility, maintenance status, and breaking change analysis. It uses authoritative sources (OSV.dev, package registries, vendor advisories) and never claims a dependency is secure merely because no known vulnerability was found.

## Scope

**Covers:**
- Package ecosystem identification
- Direct and transitive dependency inventory
- Known security advisories (OSV, NVD, GHSA, vendor)
- Dependency version compatibility
- Maintenance and release activity
- License metadata and compatibility
- Dependency confusion and typosquatting risks
- Lockfile consistency
- Supply chain provenance (SBOM, sigstore)
- Unnecessary/duplicate dependencies
- Breaking change analysis for updates
- Offline/incomplete advisory data handling

**Does NOT cover:**
- Automated dependency updates (use renovate/dependabot)
- Runtime vulnerability scanning (containers, images)
- Custom vulnerability database hosting
- Actual package installation
- License legal advice (consult legal counsel)

## When to Use

**Use when:**
- Proposing a new dependency addition
- Planning a dependency version upgrade
- Auditing existing dependencies for risk
- Reviewing PRs that change dependencies
- Generating SBOM for compliance
- Evaluating supply chain posture

**When NOT to use:**
- For real-time production monitoring
- As a substitute for CI/CD dependency scanning
- When user explicitly declines assessment

## Prerequisites

**Required tools (at least one):**
- `osv-scanner` — `go install github.com/google/osv-scanner/cmd/osv-scanner@latest`
- `npm audit` / `pnpm audit` / `yarn audit` — for Node.js
- `pip-audit` — `pip install pip-audit` for Python
- `govulncheck` — `go install golang.org/x/vuln/cmd/govulncheck@latest` for Go
- `cargo audit` — `cargo install cargo-audit` for Rust
- `mvn org.owasp:dependency-check-maven:check` for Java/Maven
- `gradle dependencyCheckAnalyze` for Gradle

**Optional tools:**
- `syft` — SBOM generation: `brew install syft`
- `cyclonedx-*` — ecosystem-specific SBOM
- `license-checker` / `pip-licenses` / `go-licenses` / `cargo-license`
- `depcheck` / `unused` / `cargo-udeps` — unused dependency detection

**Required context:**
- Repository with dependency manifests (package.json, pyproject.toml, go.mod, Cargo.toml, pom.xml, etc.)
- Lockfiles (package-lock.json, poetry.lock, go.sum, Cargo.lock, etc.)
- Ability to run read-only scan commands

**Required capabilities:**
- Command execution
- JSON parsing
- File reading

## Workflow

### Phase 1: Identify Ecosystem and Manifests

1. **Detect package ecosystems** — Scan for manifests:
   - Node.js: `package.json`, `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`
   - Python: `pyproject.toml`, `requirements.txt`, `Pipfile.lock`, `poetry.lock`
   - Go: `go.mod`, `go.sum`
   - Rust: `Cargo.toml`, `Cargo.lock`
   - Java: `pom.xml`, `build.gradle`, `build.gradle.kts`
   - Ruby: `Gemfile`, `Gemfile.lock`
   - PHP: `composer.json`, `composer.lock`
   - .NET: `*.csproj`, `packages.lock.json`
2. **Read manifests** — Extract direct dependencies with version ranges
3. **Read lockfiles** — Extract full transitive dependency tree with pinned versions

### Phase 2: Inventory Dependencies

4. **List direct dependencies** — Name, declared version range, source registry
5. **List transitive dependencies** — Name, pinned version, dependency path
6. **Count totals** — Direct vs transitive per ecosystem
7. **Identify duplicates** — Same package at different versions (diamond deps)
8. **Flag unused dependencies** — Run unused dep detector if available

### Phase 3: Vulnerability Assessment

9. **Run ecosystem scanner** — Use appropriate tool per ecosystem:
   - Node: `npm audit --json` or `osv-scanner scan --lockfile package-lock.json`
   - Python: `pip-audit --format json` or `osv-scanner scan --lockfile poetry.lock`
   - Go: `govulncheck ./...` or `osv-scanner scan --lockfile go.sum`
   - Rust: `cargo audit --json` or `osv-scanner scan --lockfile Cargo.lock`
   - Java: `mvn org.owasp:dependency-check-maven:check -Dformat=JSON`
   - Multi: `osv-scanner scan --recursive .` (detects all)
10. **Run osv-scanner as universal fallback** — `osv-scanner scan --recursive . --format json`
11. **Extract findings** — CVE/GHSA ID, affected package, version, fixed version, severity

### Phase 4: Vulnerability Triage (EPSS + CVSS + CISA KEV)

12. **For each CVE, enrich with:**
    - **CVSS** — From advisory (NVD, GHSA, OSV)
    - **EPSS** — Query `https://api.first.org/data/v1/epss?cve=CVE-XXXX-XXXXX`
    - **CISA KEV** — Check `https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json`
13. **Apply triage matrix:**

| CVSS | EPSS | KEV Listed | Priority | Action |
|---|---|---|---|---|
| Critical/High | > 0.1 | Yes | P0 — Immediate | Patch/mitigate within 24-48h |
| Critical/High | > 0.1 | No | P1 — Urgent | Patch within current sprint |
| Critical/High | ≤ 0.1 | No | P2 — Scheduled | Patch in next release cycle |
| Medium | > 0.1 | Yes | P1 — Urgent | Patch within current sprint |
| Medium | ≤ 0.1 | No | P3 — Backlog | Track, remediate opportunistically |
| Low | Any | No | P4 — Monitor | Document, revisit quarterly |

14. **Document each finding** — CVE, package, version, fixed_in, CVSS, EPSS, KEV, priority, recommended fix

### Phase 5: License Compliance

15. **Extract licenses** — From lockfiles or registry metadata:
    - Node: `license-checker --production --json`
    - Python: `pip-licenses --with-system --format=json`
    - Go: `go-licenses check ./... --json`
    - Rust: `cargo license --json`
    - Java: `mvn license:download-licenses`
16. **Classify license risk:**

| Risk Level | Licenses | Concern |
|---|---|---|
| **High - Copyleft** | GPL-2.0, GPL-3.0, AGPL-3.0 | May force open-sourcing proprietary code; AGPL extends to SaaS |
| **Medium - Weak Copyleft** | LGPL-2.1, LGPL-3.0, MPL-2.0, EPL-2.0 | Copyleft on modifications; linking requirements |
| **Low - Permissive** | MIT, Apache-2.0, BSD-2/3, ISC | Attribution only; Apache-2.0 has patent grant |
| **Unknown / None** | NOASSERTION, unlicensed | Default copyright — cannot legally use; treat as High |

17. **Flag specific risks:**
    - AGPL-3.0 in network-accessible code → entire app may need disclosure
    - GPL in statically linked binaries (Go, Rust) → whole binary affected
    - Apache-2.0 + GPL-2.0-only conflict
    - Dual-licensed commercial packages
    - No-license dependencies

### Phase 6: Supply Chain Risk Assessment

18. **Typosquatting check** — For each direct dependency:
    - Verify package name on canonical registry (npmjs.com, pypi.org, crates.io, pkg.go.dev)
    - Check publisher/maintainer matches known entity
    - Flag low download counts for similar names
    - Flag recent packages shadowing established names
    - Inspect install scripts (`preinstall`, `postinstall`)
19. **Dependency confusion** — Check internal package names against public registries
20. **Maintenance status** — For each direct dep:
    - Last release date
    - Release frequency
    - Open issues/PRs ratio
    - Maintainer responsiveness
    - Archived/deprecated status
21. **Provenance** — Check for:
    - Sigstore signatures (cosign, sigstore-python)
    - SLSA provenance attestations
    - Reproducible builds
    - Registry trust (npm provenance, PyPI trusted publishing)

### Phase 7: Lockfile Consistency

22. **Verify lockfile matches manifest** — Run package manager install in dry-run:
    - `npm ci --dry-run` / `pnpm install --frozen-lockfile --dry-run`
    - `pip install --dry-run -r requirements.txt`
    - `go mod verify`
    - `cargo fetch --locked`
23. **Flag discrepancies** — Missing entries, version mismatches, extra packages

### Phase 8: Breaking Change Analysis (For Updates)

24. **For proposed version updates:**
    - Check changelog / release notes / GitHub releases
    - Compare semver: major = breaking, minor = features, patch = fixes
    - Run tests with updated version (if test suite exists)
    - Check for deprecated APIs in use
    - Review migration guides
25. **Assess update risk:** Low / Medium / High / Critical

### Phase 9: Generate Assessment Report

26. **Produce structured report** — Using the reporting format below
27. **Include SBOM** — Generate CycloneDX/SPDX if requested
28. **Flag decisions needed** — Human approval required for updates

## Safety Constraints

- **NEVER** claim a dependency is "secure" — only "no known vulnerabilities found"
- **NEVER** silently make consequential dependency updates
- **NEVER** ignore transitive dependency risks
- **NEVER** treat "no advisory found" as "known safe"
- **NEVER** transmit proprietary dependency data to external services without authorization
- **ALWAYS** require human approval for: adding deps, major version updates, license risk acceptance
- **ALWAYS** report when advisory data is incomplete/unavailable
- **ALWAYS** distinguish direct vs transitive in findings

## Error Handling

| Situation | Behavior |
|---|---|
| No manifest found | Report "Unknown — no standard manifest detected" |
| Scanner not installed | Report "Not Run — [tool] not installed"; provide install instructions |
| Network unavailable (OSV, EPSS, KEV) | Report "Partially Verified — local data only"; note enrichment skipped |
| Lockfile missing | Report "Warning — no lockfile; transitive deps unknown"; suggest generating |
| Scanner fails | Report "Failed — [error]"; try alternative scanner |
| No advisory data for ecosystem | Report "Not Run — no advisory source for [ecosystem]" |
| License detection fails | Report "Unknown — license detection failed" |

## Verification

After completing assessment:

- [ ] All ecosystems identified and manifests parsed
- [ ] Direct and transitive dependencies inventoried
- [ ] Vulnerability scan completed (at least one scanner)
- [ ] Each CVE triaged with CVSS + EPSS + KEV
- [ ] License compliance checked for all direct deps
- [ ] Typosquatting check performed on direct deps
- [ ] Maintenance status assessed for direct deps
- [ ] Lockfile consistency verified
- [ ] Breaking change analysis for proposed updates
- [ ] Report generated (Markdown + JSON)
- [ ] SBOM generated if requested
- [ ] No proprietary data transmitted without authorization

## Reporting Format

### Human-Readable (Markdown)

```markdown
# Dependency Risk Assessment Report

## Project Summary
- **Repository**: /path/to/repo
- **Scan Date**: 2026-10-23T10:30:00Z
- **Ecosystems**: Node.js (npm), Python (pip)
- **Total Dependencies**: 47 direct, 1,234 transitive

## Vulnerability Findings

| # | CVE | Package | Ecosystem | Current | Fixed In | CVSS | EPSS | KEV | Priority | Direct? |
|---|-----|---------|-----------|---------|----------|------|------|-----|----------|---------|
| 1 | CVE-2024-1234 | lodash | npm | 4.17.20 | 4.17.21 | 7.5 | 0.02 | No | P2 | Transitive |
| 2 | GHSA-xxxx-xxxx | requests | pip | 2.28.0 | 2.31.0 | 9.1 | 0.15 | Yes | P0 | Direct |

## License Findings

| # | Package | Version | License | Risk | Action |
|---|---------|---------|---------|------|--------|
| 1 | useful-lib | 1.0.0 | AGPL-3.0 | **High** | Review — network-accessible app |
| 2 | old-utils | 0.5.0 | NOASSERTION | **High** | Replace or get permission |

## Supply Chain Risks

- [ ] Typosquatting risk: `reqeusts` (similar to `requests`) — not in deps
- [ ] Dependency confusion: internal `@company/auth` — claimed on npm
- [ ] Unmaintained: `legacy-parser` — no release in 4 years
- [ ] No provenance: 12 packages lack sigstore signatures

## Lockfile Consistency

- `package-lock.json`: Consistent ✓
- `poetry.lock`: Consistent ✓
- `go.sum`: Consistent ✓

## Maintenance Status (Direct Dependencies)

| Package | Last Release | Frequency | Status |
|---------|--------------|-----------|--------|
| express | 2026-08-15 | Monthly | Active |
| old-lib | 2022-03-10 | None | **Unmaintained** |

## Breaking Change Analysis (Proposed Updates)

| Package | Current → Proposed | Semver | Risk | Migration Effort |
|---------|-------------------|--------|------|------------------|
| react | 18.2.0 → 19.0.0 | Major | **High** | Medium (concurrent features) |
| fastapi | 0.110.0 → 0.115.0 | Minor | Low | None |

## Recommendations

### P0 — Immediate (This Week)
1. Update `requests` to 2.31.0+ (CVE-2024-xxxx, KEV listed)
2. Replace `useful-lib` (AGPL-3.0) with permissive alternative

### P1 — Urgent (This Sprint)
1. Update `lodash` to 4.17.21
2. Investigate `legacy-parser` replacement

### P2 — Scheduled (Next Release)
1. Plan React 19 migration
2. Add sigstore verification to CI

### Process
1. Add osv-scanner to CI pipeline
2. Add license-checker to CI
3. Enable npm/PyPI trusted publishing
```

### Machine-Readable (JSON)

```json
{
  "metadata": {
    "repository": "/path/to/repo",
    "timestamp": "2026-10-23T10:30:00Z",
    "ecosystems": ["npm", "pip"],
    "direct_count": 47,
    "transitive_count": 1234
  },
  "vulnerabilities": [
    {
      "id": 1,
      "cve": "CVE-2024-1234",
      "package": "lodash",
      "ecosystem": "npm",
      "current_version": "4.17.20",
      "fixed_version": "4.17.21",
      "cvss": 7.5,
      "epss": 0.02,
      "kev": false,
      "priority": "P2",
      "direct": false
    }
  ],
  "licenses": [
    {
      "id": 1,
      "package": "useful-lib",
      "version": "1.0.0",
      "license": "AGPL-3.0",
      "risk": "High",
      "action": "Review"
    }
  ],
  "supply_chain": {
    "typosquatting_risk": false,
    "dependency_confusion_risk": true,
    "unmaintained_packages": ["legacy-parser"],
    "no_provenance_count": 12
  },
  "lockfile_consistency": {
    "package-lock.json": true,
    "poetry.lock": true,
    "go.sum": true
  },
  "maintenance": [
    {"package": "express", "last_release": "2026-08-15", "status": "Active"},
    {"package": "old-lib", "last_release": "2022-03-10", "status": "Unmaintained"}
  ],
  "breaking_changes": [
    {"package": "react", "current": "18.2.0", "proposed": "19.0.0", "semver": "major", "risk": "High"}
  ],
  "recommendations": {
    "P0": ["Update requests to 2.31.0+", "Replace useful-lib (AGPL-3.0)"],
    "P1": ["Update lodash to 4.17.21", "Investigate legacy-parser replacement"],
    "P2": ["Plan React 19 migration", "Add sigstore verification to CI"],
    "process": ["Add osv-scanner to CI pipeline", "Add license-checker to CI", "Enable npm/PyPI trusted publishing"]
  }
}
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "No CVE found, so it's safe" | Absence of evidence ≠ evidence of absence. New vulnerabilities discovered daily. |
| "It's just a dev dependency" | Dev deps run in CI, build systems, developer machines. Supply chain attacks target dev deps. |
| "We pin versions, so we're fine" | Pinning prevents accidental updates but doesn't remove existing vulnerabilities. |
| "Transitive deps aren't our problem" | They're in your artifact. `event-stream` incident proved transitive risk. |
| "License is permissive, so no issue" | Permissive ≠ compatible. Apache-2.0 + GPL-2.0-only = conflict. |
| "We'll update later" | Technical debt compounds. Known vulnerabilities are exploit targets NOW. |
| "Internal package, no public risk" | Dependency confusion attacks publish to public registry with your internal name. |

## Red Flags

- Agent says "dependencies look fine" without running a scanner
- Agent only checks direct dependencies
- Agent treats "no vulnerabilities found" as "secure"
- Agent ignores license risk (AGPL, GPL, no license)
- Agent proposes major version update without breaking change analysis
- Agent doesn't check lockfile consistency
- Agent skips typosquatting check for new dependencies
- Agent recommends update without checking test compatibility

## Known Limitations

- Advisory data lag: 24-72h between vulnerability disclosure and database update
- EPSS model predicts exploitation probability, not certainty
- CISA KEV only covers vulnerabilities with *confirmed* exploitation
- Offline environments cannot access live advisory data
- Some ecosystems have poor advisory coverage (smaller registries)
- License detection relies on declared metadata — may be inaccurate
- Typosquatting detection is heuristic — sophisticated attacks may evade
- Unused dependency detection has false positives (conditional imports, plugins)
- Breaking change analysis requires test coverage to be reliable
- Cannot assess risk of proprietary/private dependencies without source access

## References

- OSV.dev: https://osv.dev (Open Source Vulnerabilities database)
- NVD: https://nvd.nist.gov
- GitHub Security Advisories: https://github.com/advisories
- CISA KEV: https://www.cisa.gov/known-exploited-vulnerabilities-catalog
- FIRST EPSS: https://www.first.org/epss/
- SLSA: https://slsa.dev
- CycloneDX: https://cyclonedx.org
- SPDX: https://spdx.dev
- Sigstore: https://sigstore.dev
- OWASP Dependency Check: https://owasp.org/www-project-dependency-check/
- Node.js Security WG: https://github.com/nodejs/security-wg
- Python Safety DB: https://github.com/pyupio/safety-db
- RustSec: https://rustsec.org