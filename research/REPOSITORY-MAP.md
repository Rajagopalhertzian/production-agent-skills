# Repository Map

Research conducted: 2026-10-23

## Candidate Repositories

### 1. addyosmani/agent-skills
- **URL**: https://github.com/addyosmani/agent-skills
- **Owner**: addyosmani (Addy Osmani, Google Chrome DevRel)
- **Description**: Production-grade engineering skills for AI coding agents
- **Stars**: 110k (as of 2026-10-23)
- **Forks**: 11.4k
- **Last Activity**: Last week (aeac41d)
- **License**: MIT
- **Commits**: 702
- **Contribution Model**: Open source, community contributions via PRs (61 issues, 87 PRs)
- **Skills Informed**: 
  - `verify-before-finish` — Skill anatomy, verification workflows, common rationalizations pattern
  - `repository-onboarding` — Discovery process, stack identification, project structure
  - `secret-leak-prevention` — Security auditor agent, security checklist references
  - `dependency-risk-assessment` — Dependency scanning references
  - `environment-config-safety` — CI/CD security, configuration validation
  - `universal-project-builder` — Planning, task breakdown, incremental implementation
  - `skill-creator` — Skill anatomy specification, progressive disclosure, writing principles

- **Key Engineering Practices Observed**:
  - YAML frontmatter with name, description (required)
  - Standard sections: Overview, When to Use, Core Process, Common Rationalizations, Red Flags, Verification
  - Progressive disclosure — supporting files in references/ loaded on demand
  - Anti-rationalization tables (excuse → reality)
  - Evidence-based verification checklists
  - Skill directories self-contained under skills/
  - Scripts convention: bash shebang, set -e, stderr for status, stdout for JSON
  - Shared references at repo root (testing-patterns.md, security-checklist.md, etc.)
  - Cross-skill references by name
  - Context efficiency: SKILL.md under 500 lines, load on demand

- **Supporting Files**:
  - docs/skill-anatomy.md — Full skill specification
  - docs/getting-started.md — Installation and usage
  - agents/ — Pre-configured personas (code-reviewer, test-engineer, security-auditor, web-performance-auditor)
  - commands/ — Slash commands for Claude Code
  - evals/ — Evaluation framework with cases, fixtures, skill-impact.md
  - references/ — Shared checklists (testing-patterns.md, performance-checklist.md, security-checklist.md, accessibility-checklist.md, definition-of-done.md, observability-checklist.md, orchestration-patterns.md)

- **Source**: https://github.com/addyosmani/agent-skills, https://raw.githubusercontent.com/addyosmani/agent-skills/main/docs/skill-anatomy.md, https://raw.githubusercontent.com/addyosmani/agent-skills/main/docs/getting-started.md, https://raw.githubusercontent.com/addyosmani/agent-skills/main/skills/test-driven-development/SKILL.md, https://raw.githubusercontent.com/addyosmani/agent-skills/main/agents/security-auditor.md

---

### 2. UnitOneAI/SecuritySkills
- **URL**: https://github.com/UnitOneAI/SecuritySkills
- **Owner**: UnitOneAI
- **Description**: Open-source security skills for AI coding agents grounded in OWASP, NIST, MITRE ATT&CK, CIS
- **Stars**: 90 (as of 2026-10-23)
- **Forks**: 135
- **Last Activity**: 4 months ago (70bc259)
- **License**: MIT
- **Commits**: 51
- **Contribution Model**: Open source, issues (1.3k), PRs (11)
- **Skills Informed**:
  - `secret-leak-prevention` — Roles: appsec-engineer, cloud-security-engineer, security-engineer, soc-analyst, vciso
  - `dependency-risk-assessment` — appsec/dependency-scanning skill
  - `environment-config-safety` — devsecops, cloud skills
  - `verify-before-finish` — Fixer policy, evidence-based findings
  - `repository-onboarding` — Manifest discovery, stack identification

- **Key Engineering Practices Observed**:
  - Roles directory with specialized agent personas
  - Skills organized by domain: appsec, cloud, compliance, devsecops, identity, incident-response, network, secops, vuln-management
  - Schema validation with JSON schemas (schemas/finding.schema.json)
  - SARIF output support
  - Fixer policy with review gates, rollback guidance
  - EPSS + CVSS + CISA KEV triage model for vulnerability prioritization
  - SLSA v1.0 alignment for SBOM generation
  - CycloneDX and SPDX SBOM formats
  - Typosquatting detection patterns
  - License compliance categorization (High/Medium/Low/Unknown)
  - Prompt injection safety notices in every skill
  - Normalized JSON output requirement
  - Escalation rules for high-impact risks
  - tags, role, phase, frameworks, difficulty, time_estimate in frontmatter

- **Supporting Files**:
  - data/ — Framework reference registry
  - docs/ — Documentation
  - examples/ci — CI/CD examples
  - schemas/ — JSON schemas for findings
  - scripts/ — Utility scripts
  - tests/ — Test fixtures

- **Specific Skill: appsec/dependency-scanning**
  - Source: https://raw.githubusercontent.com/UnitOneAI/SecuritySkills/main/skills/appsec/dependency-scanning/SKILL.md
  - Comprehensive vulnerability triage with EPSS, CVSS, CISA KEV
  - License compliance checks for copyleft, permissive, unknown
  - Typosquatting detection patterns
  - SBOM generation tools by ecosystem
  - Structured output template with findings table

---

### 3. NVIDIA/SkillSpector
- **URL**: https://github.com/NVIDIA/SkillSpector
- **Owner**: NVIDIA
- **Description**: Security scanner for AI agent skills — detects vulnerabilities, malicious patterns, security risks, prompt injection, data exfiltration, supply-chain risks
- **Stars**: 21k (as of 2026-10-23)
- **Forks**: 1.8k
- **Last Activity**: 19 hours ago (d7338f5)
- **License**: Apache-2.0
- **Commits**: 1,698
- **Contribution Model**: Open source, issues (77), PRs (87), discussions
- **Skills Informed**:
  - `verify-before-finish` — Skill security scanning, validation
  - `secret-leak-prevention` — Detects prompt injection, data exfiltration, excessive permissions
  - `skill-creator` — Skill security review step in development process

- **Key Engineering Practices Observed**:
  - Scans Claude Code, Codex, and MCP skills before installation
  - Detects: vulnerabilities, malicious patterns, prompt injection, data exfiltration, supply-chain risks
  - Extensions system for custom analyzers
  - OpenCode extension, PI (prompt injection) extension
  - Batch scan capability
  - OSV live vulnerability lookups (SC4-osv-live-vulnerability-lookups.md)
  - MCP least privilege, tool poisoning analysis
  - Nested artifact inspection
  - Self-references analysis
  - Dependency source redirection detection
  - Suppression mechanism for false positives
  - Scan completeness metrics
  - Evaluation datasets
  - Inference usage tracking
  - LLM analyzer base guide

- **Relevant Docs**:
  - docs/SC4-osv-live-vulnerability-lookups.md
  - docs/B.3.1-mcp-least-privilege.md
  - docs/B.3.2-mcp-tool-poisoning.md
  - docs/DEPENDENCY_SOURCE_REDIRECTION.md
  - docs/NESTED_ARTIFACT_INSPECTION.md
  - docs/SUPPRESSION.md
  - docs/scan-completeness.md
  - docs/EVAL_DATASETS.md
  - docs/AS3_SELF_REFERENCES.md

---

### 4. cisco-ai-defense/skill-scanner
- **URL**: https://github.com/cisco-ai-defense/skill-scanner
- **Owner**: cisco-ai-defense
- **Description**: Security Scanner for Agent Skills
- **Stars**: 2.6k (as of 2026-10-23)
- **Forks**: 336
- **Last Activity**: Yesterday (de5fcf0)
- **License**: Unknown (need to verify)
- **Commits**: 150
- **Contribution Model**: Open source, issues, PRs (2)
- **Skills Informed**:
  - `verify-before-finish` — Skill security validation
  - `secret-leak-prevention` — Credential detection in skills

- **Key Engineering Practices Observed**:
  - Written in Python (skill_scanner directory)
  - CLI tool with evals, examples, tests
  - CEL (Common Expression Language) runtime for rules
  - Multiple agent integrations: .cursor/rules, .devin, .windsurf/rules
  - GitHub Actions integration
  - Formula for Homebrew
  - docs-site for documentation

---

### 5. domehahn/skil
- **URL**: https://github.com/domehahn/skil
- **Owner**: domehahn
- **Description**: Vendor-neutral security, verification, and enforcement framework for AI agent skills
- **Stars**: 1 (as of 2026-10-23)
- **Forks**: 2
- **Last Activity**: Last month (9016d9a)
- **License**: Unknown (need to verify)
- **Commits**: 130
- **Contribution Model**: Open source, issues, PRs (6)
- **Skills Informed**:
  - `verify-before-finish` — Assurance framework, verification, enforcement
  - `skill-creator` — Skill structure validation, capability analysis

- **Key Engineering Practices Observed**:
  - Vendor-neutral framework
  - Security, verification, enforcement for skills
  - Compatibility layer (compat/)
  - Benchmarking system
  - CLI tool (cmd/skil)
  - Schemas for validation
  - Rules engine
  - ADR (Architecture Decision Records) in docs/adr/
  - Assurance closure documentation
  - Attestations support
  - Adversarial testing
  - Airgap support
  - Behavioral testing
  - Capabilities analysis
  - CI integration
  - Derived security views
  - External scanner feature parity
  - Glossary

- **Relevant Docs**:
  - docs/architecture.md
  - docs/assurance-closure.md
  - docs/attestations.md
  - docs/behavioral-testing.md
  - docs/capabilities.md
  - docs/ci-integration.md
  - docs/derived-security-views.md
  - docs/adversarial-testing.md

---

### 6. gitleaks/gitleaks
- **URL**: https://github.com/gitleaks/gitleaks
- **Owner**: gitleaks
- **Description**: Find secrets with Gitleaks
- **Stars**: 30.3k (as of 2026-10-23)
- **Forks**: 2.3k
- **Last Activity**: 3 months ago (b58d3f1)
- **License**: MIT
- **Commits**: 1,291
- **Contribution Model**: Open source, issues (280), PRs (232), discussions
- **Skills Informed**:
  - `secret-leak-prevention` — Core secret detection engine

- **Key Engineering Practices Observed**:
  - Go-based secret scanner
  - Configurable rules in config/
  - Detect/ directory for detection logic
  - Regexp/ for pattern matching
  - Logging infrastructure
  - 191 releases (mature)
  - Recursive decoding support
  - Looker client ID/secret rules

---

### 7. trufflesecurity/trufflehog
- **URL**: https://github.com/trufflesecurity/trufflehog
- **Owner**: trufflesecurity
- **Description**: Find, verify, and analyze leaked credentials
- **Stars**: 28.7k (as of 2026-10-23)
- **Forks**: 2.7k
- **Last Activity**: 4 hours ago (d6ea4a5)
- **License**: Unknown (need to verify)
- **Commits**: 4,674
- **Contribution Model**: Open source, issues (286), PRs (298)
- **Skills Informed**:
  - `secret-leak-prevention` — Credential verification, not just detection

- **Key Engineering Practices Observed**:
  - Verifies leaked credentials (not just detects)
  - GitHub Action available on Marketplace
  - 372 releases (very active)
  - .claude/skills and .codex/skills for agent integration
  - Assets, docs, internal packages
  - Captain integration
  - Jenkins scanning support

---

### 8. google/osv-scanner
- **URL**: https://github.com/google/osv-scanner
- **Owner**: google
- **Description**: Vulnerability scanner using OSV.dev data
- **Stars**: 11.2k (as of 2026-10-23)
- **Forks**: 819
- **Last Activity**: 10 hours ago (0c8f9eb)
- **License**: Apache-2.0 (Google)
- **Commits**: 2,086
- **Contribution Model**: Open source, issues (85), PRs (17), discussions
- **Skills Informed**:
  - `dependency-risk-assessment` — Authoritative vulnerability database

- **Key Engineering Practices Observed**:
  - Uses OSV.dev (Open Source Vulnerabilities) database
  - Go-based
  - Actions for CI/CD
  - Internal packages for vulnerability handling
  - License summary output
  - Grouper for dependency grouping

---

### 9. semgrep/semgrep
- **URL**: https://github.com/semgrep/semgrep
- **Owner**: semgrep
- **Description**: Lightweight static analysis for many languages
- **Stars**: 17.2k (as of 2026-10-23)
- **Forks**: 1.1k
- **Last Activity**: Yesterday (087e93b)
- **License**: Unknown (need to verify - likely LGPL or similar)
- **Commits**: 10,406
- **Contribution Model**: Open source, issues (889), PRs (64), discussions
- **Skills Informed**:
  - `secret-leak-prevention` — Pattern-based detection
  - `environment-config-safety` — Configuration validation
  - `verify-before-finish` — Static analysis verification

- **Key Engineering Practices Observed**:
  - Pattern-based static analysis (code-like patterns)
  - Multi-language support
  - CLI with develop branch (active development)
  - 2158 branches (highly active)
  - Proprietary and open source versions
  - Interfaces for integration
  - Flake8 plugins

---

### 10. bridgecrewio/checkov
- **URL**: https://github.com/bridgecrewio/checkov
- **Owner**: bridgecrewio
- **Description**: Prevent cloud misconfigurations and find vulnerabilities in IaC, container images, packages
- **Stars**: 9.1k (as of 2026-10-23)
- **Forks**: Not visible
- **Last Activity**: 2 days ago (811d068)
- **License**: Unknown (need to verify)
- **Commits**: 17,473
- **Contribution Model**: Open source, issues (82), PRs (128)
- **Skills Informed**:
  - `environment-config-safety` — IaC validation, Docker, Kubernetes
  - `dependency-risk-assessment` — SCA (Software Composition Analysis)

- **Key Engineering Practices Observed**:
  - Python-based
  - Terraform, CloudFormation, Kubernetes, Dockerfile, Helm, ARM, Bicep support
  - SCA for open source packages
  - Secrets detection
  - CDK integration tests
  - Dogfood tests
  - Flake8 plugins
  - 3908 releases (very mature)

---

### 11. hadolint/hadolint
- **URL**: https://github.com/hadolint/hadolint
- **Owner**: hadolint
- **Description**: Dockerfile linter, validate inline bash, written in Haskell
- **Stars**: 12.5k (as of 2026-10-23)
- **Forks**: 510
- **Last Activity**: 4 days ago (1d901b9)
- **License**: Unknown (need to verify)
- **Commits**: 1,442
- **Contribution Model**: Open source, issues (174), PRs (11), wiki
- **Skills Informed**:
  - `environment-config-safety` — Dockerfile validation

- **Key Engineering Practices Observed**:
  - Haskell implementation
  - 94 releases
  - Contrib for community rules
  - Wasm32-wasi support
  - PECL package pinning rules
  - Docker directory for containerized builds

---

### 12. renovatebot/renovate
- **URL**: https://github.com/renovatebot/renovate
- **Owner**: renovatebot (Mend.io)
- **Description**: Cross-platform Dependency Automation
- **Stars**: 22.9k (as of 2026-10-23)
- **Forks**: 3.4k
- **Last Activity**: 27 minutes ago (f847006)
- **License**: Unknown (need to verify)
- **Commits**: 28,014
- **Contribution Model**: Open source, issues (1k), PRs (490), discussions, security (25)
- **Skills Informed**:
  - `dependency-risk-assessment` — Automated dependency updates, compatibility
  - `environment-config-safety` — CI/CD integration

- **Key Engineering Practices Observed**:
  - TypeScript-based
  - 12,570 releases (extremely active)
  - .claude directory for agent integration
  - Devcontainer support
  - Husky for commit hooks
  - Renovate base image updates
  - Agent integration (ci(agents): extend AGENTS.md)

---

## Summary: Which Repositories Inform Each Skill

| Skill | Primary Sources | Secondary Sources |
|-------|-----------------|-------------------|
| verify-before-finish | addyosmani/agent-skills (skill-anatomy, TDD), domehahn/skil (assurance), NVIDIA/SkillSpector (scanning) | UnitOneAI/SecuritySkills (fixer policy), cisco-ai-defense/skill-scanner |
| repository-onboarding | addyosmani/agent-skills (discovery process, stack identification), UnitOneAI/SecuritySkills (manifest discovery) | - |
| secret-leak-prevention | gitleaks/gitleaks, trufflesecurity/trufflehog, UnitOneAI/SecuritySkills (appsec roles), semgrep/semgrep, addyosmani/agent-skills (security auditor) | NVIDIA/SkillSpector (prompt injection), cisco-ai-defense/skill-scanner |
| dependency-risk-assessment | google/osv-scanner, UnitOneAI/SecuritySkills (dependency-scanning), renovatebot/renovate, semgrep/semgrep, bridgecrewio/checkov | NVIDIA/SkillSpector (OSV lookups) |
| environment-config-safety | hadolint/hadolint, bridgecrewio/checkov, semgrep/semgrep, addyosmani/agent-skills (CI/CD security), renovatebot/renovate | - |
| universal-project-builder | addyosmani/agent-skills (planning, incremental implementation, spec-driven-development) | - |
| skill-creator | addyosmani/agent-skills (skill-anatomy, writing principles), domehahn/skil (capabilities, validation), NVIDIA/SkillSpector (security review) | - |

## License Summary

| Repository | License | Notes |
|------------|---------|-------|
| addyosmani/agent-skills | MIT | Permissive, allows reuse with attribution |
| UnitOneAI/SecuritySkills | MIT | Permissive |
| NVIDIA/SkillSpector | Apache-2.0 | Permissive, patent grant |
| cisco-ai-defense/skill-scanner | TBD | Need to verify |
| domehahn/skil | TBD | Need to verify |
| gitleaks/gitleaks | MIT | Permissive |
| trufflesecurity/trufflehog | TBD | Need to verify |
| google/osv-scanner | Apache-2.0 | Permissive, patent grant |
| semgrep/semgrep | TBD | Likely LGPL — may have copyleft implications |
| bridgecrewio/checkov | TBD | Need to verify |
| hadolint/hadolint | TBD | Need to verify |
| renovatebot/renovate | TBD | Need to verify |

**Recommendation**: Prefer independently written instructions. Do not copy large sections of SKILL.md or source code. Describe concepts in original language. For tools (gitleaks, trufflehog, osv-scanner, hadolint, checkov, semgrep), reference them as external dependencies rather than bundling.