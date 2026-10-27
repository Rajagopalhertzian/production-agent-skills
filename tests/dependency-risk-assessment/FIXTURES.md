# Test Fixtures for dependency-risk-assessment

## Fixture 1: Dependency with Known Advisory (Positive Case)

### Repository Structure
```
vuln-dep-test/
├── package.json
├── package-lock.json
├── pyproject.toml
├── poetry.lock
├── go.mod
├── go.sum
├── Cargo.toml
├── Cargo.lock
└── src/
    └── main.py
```

### Files

**package.json**
```json
{
  "name": "vuln-dep-test",
  "version": "1.0.0",
  "dependencies": {
    "lodash": "4.17.20",
    "express": "4.18.0",
    "requests": "2.28.0"
  },
  "devDependencies": {
    "jest": "29.0.0"
  }
}
```

**package-lock.json** (partial)
```json
{
  "lockfileVersion": 2,
  "packages": {
    "node_modules/lodash": {
      "version": "4.17.20",
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.20.tgz"
    },
    "node_modules/express": {
      "version": "4.18.0",
      "dependencies": {
        "lodash": "4.17.20"
      }
    }
  }
}
```

**pyproject.toml**
```toml
[project]
name = "vuln-dep-test"
version = "1.0.0"
dependencies = [
    "requests==2.28.0",
    "urllib3==1.26.5"
]

[tool.poetry]
name = "vuln-dep-test"
version = "1.0.0"
dependencies = {
    python = "^3.10",
    requests = "2.28.0",
    urllib3 = "1.26.5"
}
```

**go.mod**
```go
module example.com/vuln-dep

go 1.21

require (
    github.com/gin-gonic/gin v1.9.0
    golang.org/x/net v0.10.0
)
```

**Cargo.toml**
```toml
[package]
name = "vuln-dep-test"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = "1.0.150"
reqwest = "0.11.0"
```

### Known Vulnerabilities (for test)
- **lodash 4.17.20**: CVE-2024-1234 (prototype pollution), fixed in 4.17.21, CVSS 7.5, EPSS 0.02, not KEV
- **requests 2.28.0**: GHSA-xxxx-xxxx (cert verification bypass), fixed in 2.31.0, CVSS 9.1, EPSS 0.15, KEV listed
- **urllib3 1.26.5**: CVE-2023-45803 (cookie parsing), fixed in 1.26.18, CVSS 7.5, EPSS 0.08, not KEV
- **golang.org/x/net v0.10.0**: CVE-2023-45290 (HTTP/2), fixed in v0.17.0, CVSS 7.5, EPSS 0.04, not KEV

### Expected Behavior
- osv-scanner finds all 4 vulnerabilities
- Triage matrix applied:
  - requests: P0 (KEV + high EPSS)
  - lodash: P2 (High CVSS, low EPSS, no KEV)
  - urllib3: P3 (Medium CVSS, low EPSS, no KEV)
  - golang.org/x/net: P3 (Medium CVSS, low EPSS, no KEV)
- Report prioritizes requests update immediately
- Transitive lodash (via express) also flagged

---

## Fixture 2: No Advisory Found (Edge Case)

### Repository Structure
```
no-advisory-test/
├── package.json
├── package-lock.json
└── src/
    └── index.js
```

**package.json**
```json
{
  "name": "no-advisory-test",
  "version": "1.0.0",
  "dependencies": {
    "brand-new-package": "1.0.0"
  }
}
```

**package-lock.json**
```json
{
  "lockfileVersion": 2,
  "packages": {
    "node_modules/brand-new-package": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/brand-new-package/-/brand-new-package-1.0.0.tgz"
    }
  }
}
```

### Expected Behavior
- osv-scanner runs, finds no advisories for brand-new-package
- Report: "No known vulnerabilities found for brand-new-package@1.0.0"
- **Critical**: Does NOT say "secure" or "safe"
- States: "Absence of advisory ≠ absence of vulnerability"
- Recommends monitoring

---

## Fixture 3: Incompatible Runtime (Negative Case)

### Repository Structure
```
incompatible-runtime/
├── package.json
├── pyproject.toml
└── src/
    └── main.py
```

**package.json**
```json
{
  "name": "incompatible-runtime",
  "version": "1.0.0",
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "some-package": "2.0.0"
  }
}
```

**pyproject.toml**
```toml
[project]
name = "incompatible-runtime"
version = "1.0.0"
requires-python = ">=3.11"
dependencies = [
    "package-requiring-py311==1.0.0"
]
```

### Environment
- Node.js version: 16.20.0 (does not meet >=18)
- Python version: 3.10 (does not meet >=3.11)

### Expected Behavior
- Skill detects engine/requires-python constraints
- Reports "Failed — Node.js 16.20.0 does not satisfy >=18.0.0"
- Reports "Failed — Python 3.10 does not satisfy >=3.11"
- Recommends runtime upgrade or dependency downgrade

---

## Fixture 4: Lockfile Mismatch (Negative Case)

### Repository Structure
```
lockfile-mismatch/
├── package.json
├── package-lock.json
└── src/
    └── index.js
```

**package.json**
```json
{
  "name": "lockfile-mismatch",
  "version": "1.0.0",
  "dependencies": {
    "lodash": "^4.17.21"
  }
}
```

**package-lock.json** (stale - lodash 4.17.20)
```json
{
  "lockfileVersion": 2,
  "packages": {
    "node_modules/lodash": {
      "version": "4.17.20",
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.20.tgz"
    }
  }
}
```

### Expected Behavior
- `npm ci --dry-run` fails or shows mismatch
- Report: "Failed — package-lock.json has lodash@4.17.20 but package.json allows ^4.17.21"
- Recommends `npm install` to regenerate lockfile

---

## Fixture 5: Unavailable Advisory Service (Error Handling)

### Scenario
- Network blocked / offline
- osv-scanner cannot reach OSV.dev
- npm audit fails with network error

### Expected Behavior
- Skill detects network failure
- Reports "Partially Verified — network unavailable, advisory enrichment skipped"
- Local scans still run (npm audit uses local cache if available)
- Does not substitute cached/stale data silently
- Notes limitation in report

---

## Fixture 6: Uncertain Maintenance Status (Edge Case)

### Repository Structure
```
maintenance-test/
├── package.json
├── package-lock.json
├── pyproject.toml
└── poetry.lock
```

**package.json**
```json
{
  "name": "maintenance-test",
  "version": "1.0.0",
  "dependencies": {
    "active-package": "1.0.0",
    "stale-package": "2.0.0",
    "archived-package": "3.0.0"
  }
}
```

### Package Metadata (simulated)
- **active-package**: Last release 2026-08-01, monthly releases, 50 open issues, 10 closed/month
- **stale-package**: Last release 2022-03-15, no releases in 4 years, 200 open issues, 0 closed/year
- **archived-package**: GitHub repo archived, last release 2020-01-01

### Expected Behavior
- Skill assesses maintenance:
  - active-package: "Active"
  - stale-package: "Unmaintained — no release in 4 years"
  - archived-package: "Archived — repository archived, no future updates"
- Flags stale and archived as supply chain risks
- Recommends alternatives

---

## Fixture 7: Unnecessary Duplicate Dependency (Edge Case)

### Repository Structure
```
duplicate-dep-test/
├── package.json
├── package-lock.json
└── src/
    └── index.js
```

**package.json**
```json
{
  "name": "duplicate-dep-test",
  "version": "1.0.0",
  "dependencies": {
    "lodash": "4.17.21",
    "underscore": "1.13.0",
    "ramda": "0.29.0"
  }
}
```

### Analysis
- lodash, underscore, ramda all provide similar utility functions
- Project only uses `_.map`, `_.filter`, `_.reduce` (lodash style)
- underscore and ramda are unused (verified by depcheck)

### Expected Behavior
- depcheck/equivalent identifies unused: underscore, ramda
- Report: "Medium — 2 potentially unnecessary dependencies (underscore, ramda)"
- Recommends audit and removal
- Notes: False positives possible for conditional imports

---

## Fixture 8: License Conflict (Negative Case)

### Repository Structure
```
license-conflict/
├── package.json
├── package-lock.json
├── pyproject.toml
└── poetry.lock
```

**package.json**
```json
{
  "name": "license-conflict",
  "version": "1.0.0",
  "dependencies": {
    "gpl-library": "1.0.0",
    "apache-library": "2.0.0"
  }
}
```

**pyproject.toml**
```toml
[project]
name = "license-conflict"
dependencies = [
    "agpl-service==1.0.0"
]
```

### License Data
- gpl-library: GPL-2.0-only
- apache-library: Apache-2.0
- agpl-service: AGPL-3.0

### Expected Behavior
- License scan identifies:
  - GPL-2.0-only: High risk (copyleft)
  - Apache-2.0: Low risk (permissive)
  - AGPL-3.0: High risk (network copyleft)
- Conflict check: Apache-2.0 + GPL-2.0-only = INCOMPATIBLE
- AGPL-3.0 in network service = MAY REQUIRE SOURCE DISCLOSURE
- Report flags both issues with High risk

---

## Fixture 9: Typosquatting Detection (Security Case)

### Repository Structure
```
typosquat-test/
├── package.json
├── package-lock.json
└── src/
    └── index.js
```

**package.json**
```json
{
  "name": "typosquat-test",
  "version": "1.0.0",
  "dependencies": {
    "reqeusts": "1.0.0",
    "lodash": "4.17.21",
    "express": "4.18.0"
  }
}
```

### Expected Behavior
- Skill detects "reqeusts" (character swap for "requests")
- Checks npmjs.com: reqeusts exists but 10 downloads/week vs requests 20M/week
- Publisher unknown vs requests (verified publisher)
- Report: "HIGH — Potential typosquat: reqeusts (typo of requests)"
- Recommends immediate removal and audit

---

## Fixture 10: Breaking Change Analysis (Update Case)

### Scenario
- Current: react@18.2.0, react-dom@18.2.0
- Proposed: react@19.0.0, react-dom@19.0.0
- Package.json shows `^18.2.0` (allows minor/patch only, but user wants major)

### Changelog Data (simulated)
- React 19: Removed `createClass`, `PropTypes` moved to separate package
- New concurrent features, `use` hook, `Form` actions
- Migration guide: 2-3 days for medium app

### Expected Behavior
- Skill analyzes semver: Major version bump = breaking changes
- Extracts breaking changes from changelog/GitHub releases
- Identifies deprecated APIs in use (via grep/codemod)
- Report: "High Risk — Major version with breaking changes"
  - Removed: createClass, PropTypes
  - Changed: Event handling, refs
  - Migration effort: Medium
- Recommends test suite run before merge