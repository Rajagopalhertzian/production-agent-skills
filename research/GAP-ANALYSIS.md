# Gap Analysis

For each proposed skill, identifies existing solutions, strengths, limitations, and what our skill should do differently.

---

## Skill 1: verify-before-finish

### Existing Solutions

| Solution | Source | Scope |
|----------|--------|-------|
| TDD skill verification | addyosmani/agent-skills | Test-focused verification |
| Security auditor agent | addyosmani/agent-skills | Security review checklist |
| Code reviewer agent | addyosmani/agent-skills | 5-axis code review |
| SkillSpector scanner | NVIDIA/SkillSpector | Pre-install skill security scan |
| skill-scanner | cisco-ai-defense/skill-scanner | Skill security validation |
| skil assurance framework | domehahn/skil | Verification, enforcement, attestations |

### Strengths of Existing Solutions

1. **addyosmani/agent-skills**: Excellent verification checklists with evidence requirements; anti-rationalization tables; red flags for behavioral monitoring; status semantics (verified/failed/not run)
2. **UnitOneAI/SecuritySkills**: Fixer policy with review gates, reviewer evidence, rollback guidance; normalized JSON + SARIF output; escalation rules
3. **NVIDIA/SkillSpector**: Comprehensive skill security scanning (prompt injection, data exfiltration, supply-chain); evaluation datasets; behavioral testing
4. **domehahn/skil**: Vendor-neutral assurance; attestations; capabilities analysis; CI integration; adversarial testing

### Limitations of Existing Solutions

1. **addyosmani/agent-skills**: Verification scattered across skills (TDD, code-review, security-auditor); no single "verify completion" skill; focuses on code quality not task completion verification
2. **SkillSpector/skill-scanner**: Scan skills for security, don't verify task completion; pre-install only
3. **skil**: Framework for skill verification, not application task verification; early stage (1 star)
4. **All**: No unified "did I actually complete the task correctly?" workflow that combines: acceptance criteria checking, diff inspection, test verification, unrelated file detection, assumption vs fact distinction

### What Our Skill Should Reuse Conceptually

- Evidence-based verification checklists (addyosmani)
- Anti-rationalization tables for common completion excuses (addyosmani)
- Status semantics: Verified / Partially Verified / Failed / Not Run / Unknown (addyosmani)
- Red flags for behavioral patterns (addyosmani)
- Structured output with JSON + Markdown (UnitOneAI)
- Human approval gates for consequential claims (UnitOneAI fixer policy)

### What Our Skill Should Do Differently

1. **Unified completion verification**: Single workflow that checks ALL aspects — acceptance criteria, diff, tests, unrelated changes, assumptions
2. **Task-centric not skill-centric**: Takes original task + acceptance criteria as input, not just code changes
3. **Assumption tracking**: Explicitly identify and verify assumptions made during implementation
4. **Diff inspection requirement**: Mandatory final diff review with checklist
5. **Unrelated file detection**: Flag modifications outside task scope
6. **Test result verification**: Actually run and inspect test output, don't trust "tests pass" claims
7. **Missing check reporting**: Explicitly report what could NOT be verified (missing tools, no network, etc.)

### Testable Improvements

- [ ] Acceptance criteria → verification mapping
- [ ] Diff inspection checklist with evidence
- [ ] Test execution + output inspection (not just exit code)
- [ ] Unrelated file detection (git diff --stat analysis)
- [ ] Assumption register with verification status
- [ ] "Could not verify" explicit reporting

### Out of Scope

- Pre-install skill security scanning (SkillSpector covers this)
- Runtime application monitoring
- Performance benchmarking
- Full security audit (separate skills exist)

---

## Skill 2: repository-onboarding

### Existing Solutions

| Solution | Source | Scope |
|----------|--------|-------|
| TDD "Discover the Stack First" | addyosmani/agent-skills | Test stack discovery |
| SecuritySkills manifest discovery | UnitOneAI/SecuritySkills | Package manifest location |
| General agent onboarding | Various | Project exploration |

### Strengths of Existing Solutions

1. **addyosmani/agent-skills**: Explicit "Discover the Stack First" section in TDD skill; lists manifest files per ecosystem; prefers checked-in wrappers; documents conventions discovery
2. **UnitOneAI/SecuritySkills**: Systematic manifest identification across ecosystems; lockfile analysis for transitive dependencies

### Limitations of Existing Solutions

1. **addyosmani/agent-skills**: Only covers test stack discovery, not full repository understanding; no architecture discovery, entry-point mapping, security-sensitive file identification
2. **UnitOneAI/SecuritySkills**: Focused on security manifests only; not general onboarding
3. **No existing skill**: Comprehensive repository onboarding covering architecture, entry points, module relationships, build/test commands, config conventions, security-sensitive areas, documentation gaps

### What Our Skill Should Reuse Conceptually

- Manifest discovery patterns per ecosystem (addyosmani, UnitOneAI)
- Checked-in wrapper preference (./gradlew, ./mvnw, make test)
- Convention discovery from existing files (README, CONTRIBUTING, CI)

### What Our Skill Should Do Differently

1. **Holistic repository understanding**: Architecture, entry points, modules, dependencies, build/test, config, security, docs
2. **Evidence-based overview**: Produce concise report with observed facts vs assumptions
3. **Security-sensitive discovery**: Identify .env, secrets, keys, configs, CI/CD with credentials
4. **Uncertainty handling**: Explicitly flag missing/conflicting documentation
5. **Non-invasive**: No file changes during discovery unless explicitly requested
6. **Progressive depth**: Quick scan → deep dive based on task needs

### Testable Improvements

- [ ] Architecture diagram generation (ASCII/text)
- [ ] Entry point discovery with evidence
- [ ] Module relationship mapping
- [ ] Build/test command verification (actually run them)
- [ ] Security-sensitive file inventory
- [ ] Documentation gap report
- [ ] Assumption vs fact labeling

### Out of Scope

- Code modification during onboarding
- Dependency vulnerability scanning (separate skill)
- Secret scanning (separate skill)
- Full code review

---

## Skill 3: secret-leak-prevention

### Existing Solutions

| Solution | Source | Scope |
|----------|--------|-------|
| gitleaks | gitleaks/gitleaks | Git history + working tree secret detection |
| trufflehog | trufflesecurity/trufflehog | Detect + verify leaked credentials |
| SecuritySkills appsec roles | UnitOneAI/SecuritySkills | Security engineer personas, secret handling |
| semgrep | semgrep/semgrep | Pattern-based detection (secrets, config) |
| Security auditor agent | addyosmani/agent-skills | Secret in env vars, not code |
| SkillSpector | NVIDIA/SkillSpector | Prompt injection, data exfiltration in skills |

### Strengths of Existing Solutions

1. **gitleaks**: Mature (30.3k stars, 191 releases); configurable rules; baseline support; recursive decoding; Git history scanning
2. **trufflehog**: Verifies credentials (not just detects); 28.7k stars, 372 releases; GitHub Action; agent integrations
3. **UnitOneAI/SecuritySkills**: Comprehensive secret handling in appsec roles; prompt injection safety notices; redaction requirements
4. **semgrep**: Pattern-based, multi-language, configurable rules

### Limitations of Existing Solutions

1. **gitleaks/trufflehog**: Tools only — no workflow for remediation, rotation, Git history rewrite guidance, false positive management
2. **No unified skill**: Combines detection + verification + remediation guidance + rotation + history remediation + safe reporting
3. **SkillSpector**: Scans skills for prompt injection, not application code for secrets
4. **All tools**: Need wrapper for agent-friendly workflow with structured output, redaction, human approval gates

### What Our Skill Should Reuse Conceptually

- gitleaks/trufflehog as detection engines (call via terminal)
- Verification before reporting (trufflehog model)
- Redaction in all outputs (UnitOneAI, gitleaks)
- Prompt injection safety (NVIDIA, UnitOneAI)
- EPSS-like triage for secret severity (type, context, exposure window)

### What Our Skill Should Do Differently

1. **End-to-end workflow**: Detect → Verify → Assess → Remediate → Rotate → History cleanup
2. **Agent-friendly structured output**: JSON + Markdown with redaction
3. **False positive management**: Verification step, allowlisting, baseline
4. **Rotation guidance**: Per-secret-type rotation procedures
5. **Git history remediation**: BFG, git-filter-repo guidance with warnings
6. **Never auto-remediate**: Human approval for all consequential actions
7. **External service protection**: Never send secrets to external APIs

### Testable Improvements

- [ ] Synthetic secret detection in source, history, config
- [ ] Verification step (trufflehog-style)
- [ ] Redacted report output
- [ ] Rotation procedure per secret type
- [ ] History rewrite guidance (with warnings)
- [ ] False positive suppression workflow
- [ ] Prompt injection resistance testing

### Out of Scope

- Actual credential revocation (requires auth)
- Git history rewriting (requires auth + warning)
- Real production credential testing
- Secret storage/management (vaults)

---

## Skill 4: dependency-risk-assessment

### Existing Solutions

| Solution | Source | Scope |
|----------|--------|-------|
| dependency-scanning skill | UnitOneAI/SecuritySkills | Vulnerabilities, licenses, supply chain, SBOM |
| osv-scanner | google/osv-scanner | OSV.dev vulnerability database |
| renovatebot | renovatebot/renovate | Automated dependency updates |
| checkov | bridgecrewio/checkov | SCA + IaC + container scanning |
| semgrep | semgrep/semgrep | Pattern-based dependency analysis |
| SecuritySkills dependency-scanning | UnitOneAI/SecuritySkills | EPSS+CVSS+KEV triage, license compliance, typosquatting |

### Strengths of Existing Solutions

1. **UnitOneAI/SecuritySkills**: Most comprehensive — EPSS+CVSS+KEV triage, license categorization, typosquatting patterns, SBOM generation (CycloneDX/SPDX), SLSA alignment, structured output template
2. **osv-scanner**: Authoritative OSV.dev data; Go-based; active (11.2k stars)
3. **renovate**: Automated updates with PRs; 22.9k stars; extremely active
4. **checkov**: SCA + IaC + containers; 17k+ commits

### Limitations of Existing Solutions

1. **UnitOneAI**: Skill is comprehensive but tied to SecuritySkills framework; no standalone agent skill
2. **osv-scanner/renovate/checkov**: Tools only — no agent workflow for assessment, decision-making, human approval
3. **No unified skill**: Combines vulnerability scanning + license check + supply chain + compatibility + breaking changes + lockfile consistency + unnecessary deps + offline handling
4. **Breaking change analysis**: Renovate does this but not as assessment skill
5. **Offline/incomplete advisory handling**: Not well addressed

### What Our Skill Should Reuse Conceptually

- EPSS + CVSS + CISA KEV triage matrix (UnitOneAI)
- License risk categories (High/Medium/Low/Unknown) (UnitOneAI)
- Typosquatting detection patterns (UnitOneAI)
- SBOM formats: CycloneDX, SPDX (UnitOneAI)
- SLSA v1.0 alignment concept (UnitOneAI)
- OSV.dev as authoritative source (osv-scanner)
- Lockfile consistency checking

### What Our Skill Should Do Differently

1. **Assessment not automation**: Produce risk report with recommendations; human decides updates
2. **Breaking change analysis**: Compare changelogs, semver, test results for proposed updates
3. **Compatibility matrix**: Runtime + dependency version compatibility
4. **Unnecessary dependency detection**: Unused, duplicate, replaceable with stdlib
5. **Offline mode**: Clear reporting when advisory data unavailable
6. **Supply chain provenance**: Sigstore, provenance attestations awareness
7. **Decision framework**: Structured decision matrix for each risk type

### Testable Improvements

- [ ] Known advisory detection (CVE via OSV)
- [ ] No-advisory ≠ safe reporting
- [ ] License conflict detection
- [ ] Typosquatting pattern matching
- [ ] Lockfile vs manifest consistency
- [ ] Breaking change assessment for version bumps
- [ ] Unnecessary dependency identification
- [ ] Offline mode behavior

### Out of Scope

- Automated dependency updates (renovate)
- Actual package installation
- Runtime vulnerability scanning (container/image)
- Custom vulnerability database hosting

---

## Skill 5: environment-config-safety

### Existing Solutions

| Solution | Source | Scope |
|----------|--------|-------|
| hadolint | hadolint/hadolint | Dockerfile linting |
| checkov | bridgecrewio/checkov | IaC (Terraform, K8s, Docker, Helm), SCA, secrets |
| semgrep | semgrep/semgrep | Config pattern validation |
| SecuritySkills cloud/devsecops | UnitOneAI/SecuritySkills | Cloud security, DevSecOps practices |
| Security auditor agent | addyosmani/agent-skills | Security headers, CORS, secrets in env |

### Strengths of Existing Solutions

1. **hadolint**: Specialized Dockerfile linter (12.5k stars); Haskell; 94 releases; inline bash validation
2. **checkov**: Comprehensive IaC coverage (Terraform, CloudFormation, K8s, Dockerfile, Helm, ARM, Bicep); SCA; secrets; 17k+ commits
3. **semgrep**: Pattern-based, multi-language config validation
4. **UnitOneAI**: Cloud/security engineer personas with config review scope

### Limitations of Existing Solutions

1. **hadolint**: Dockerfile only; no env vars, docker-compose, CI/CD, app config
2. **checkov**: Tool only — no agent workflow for review process, diff analysis, deployment safety
3. **No unified skill**: Combines env vars + Docker/Compose + CI/CD + app config + DB config + secret refs + dev/stage/prod diff + missing vars + invalid config + destructive commands + drift + runtime assumptions + rollback
4. **Syntax check ≠ runtime success**: All tools validate syntax; none verify deployment will work

### What Our Skill Should Reuse Conceptually

- hadolint for Dockerfile validation (call via terminal)
- checkov for IaC validation (call via terminal)
- semgrep for custom config patterns
- Dev/stage/prod difference awareness (UnitOneAI)
- Secret reference detection (UnitOneAI, checkov)

### What Our Skill Should Do Differently

1. **Holistic config review**: All config types in one workflow
2. **Diff-based analysis**: Review CHANGES not full configs
3. **Deployment safety**: Dry-run, plan, preview before apply
4. **Destructive command detection**: Identify `rm -rf`, `drop database`, `terraform destroy`
5. **Runtime assumption validation**: Check assumptions against actual environment
6. **Configuration drift detection**: Compare deployed vs desired
7. **Rollback/recovery consideration**: Document rollback path for each change
8. **Syntax check disclaimer**: Explicit "syntax OK ≠ deployment works"

### Testable Improvements

- [ ] Missing required env var detection
- [ ] Synthetic secret leak detection
- [ ] Invalid config syntax (with actual validators)
- [ ] Valid syntax but runtime failure scenarios
- [ ] Destructive command identification
- [ ] Validator unavailable handling
- [ ] Dev vs prod config diff analysis

### Out of Scope

- Actual deployment execution
- Infrastructure provisioning
- Secret rotation (separate skill)
- Runtime monitoring

---

## Skill 6: universal-project-builder

### Existing Solutions

| Solution | Source | Scope |
|----------|--------|-------|
| spec-driven-development | addyosmani/agent-skills | Spec → plan → tasks |
| planning-and-task-breakdown | addyosmani/agent-skills | Task decomposition |
| incremental-implementation | addyosmani/agent-skills | Step-by-step building |
| shipping-and-launch | addyosmani/agent-skills | Pre-deploy verification |
| code-review-and-quality | addyosmani/agent-skills | Quality gates |

### Strengths of Existing Solutions

1. **addyosmani/agent-skills**: Complete lifecycle — spec → plan → build → review → ship; slash commands for each phase; task artifacts (SPEC.md, tasks/plan.md, tasks/todo.md); context-aware loading; agents for specialized review

### Limitations of Existing Solutions

1. **Tied to agent-skills ecosystem**: Assumes specific commands (/spec, /plan, /build, /review, /ship)
2. **No single "build anything" skill**: Workflow split across 5+ skills
3. **Language/framework agnostic but process-heavy**: May be overkill for simple scripts
4. **No template/project scaffolding**: Focuses on process not project generation

### What Our Skill Should Reuse Conceptually

- Spec-driven development (requirements first)
- Task breakdown with acceptance criteria
- Incremental implementation with verification
- Definition of done checklist
- Context-aware skill loading

### What Our Skill Should Do Differently

1. **Unified "build anything" workflow**: Single skill from idea → working project
2. **Project type detection**: Auto-detect or select project type (API, CLI, web, script, automation)
3. **Template/scaffold selection**: Starter templates per project type
4. **Toolchain discovery**: Auto-detect or select language, framework, build tools
5. **Minimal viable process**: Scale process to project complexity
6. **Integration with other skills**: Calls verify-before-finish, repository-onboarding, etc.

### Testable Improvements

- [ ] Project type classification
- [ ] Template selection and customization
- [ ] Toolchain setup verification
- [ ] Incremental build with verification checkpoints
- [ ] Cross-skill integration

### Out of Scope

- Actual code generation (agent does this)
- Deployment (environment-config-safety)
- Full specification writing (user provides requirements)

---

## Skill 7: skill-creator

### Existing Solutions

| Solution | Source | Scope |
|----------|--------|-------|
| skill-anatomy.md | addyosmani/agent-skills | Skill specification, writing principles |
| skil framework | domehahn/skil | Skill validation, capabilities, assurance |
| SkillSpector | NVIDIA/SkillSpector | Skill security scanning |
| skill-scanner | cisco-ai-defense/skill-scanner | Skill security validation |

### Strengths of Existing Solutions

1. **addyosmani/agent-skills**: Comprehensive skill anatomy spec; writing principles (process over knowledge, specific over general, evidence over assumption, anti-rationalization, progressive disclosure, token-conscious, model-neutral); "Write the Procedure, Not the Workaround"
2. **domehahn/skil**: Vendor-neutral validation; capabilities analysis; assurance closure; behavioral testing
3. **SkillSpector/skill-scanner**: Security review for skills

### Limitations of Existing Solutions

1. **addyosmani**: Specification only — no skill for CREATING skills; writing principles but no guided creation workflow
2. **skil**: Validation framework, not creation guidance
3. **SkillSpector/scanner**: Security review only, not creation
4. **No existing skill**: Guided skill creation from requirements → spec → implementation → validation → testing

### What Our Skill Should Reuse Conceptually

- Skill anatomy frontmatter + sections (addyosmani)
- Writing principles (addyosmani)
- Progressive disclosure (addyosmani)
- Model-neutral procedures (addyosmani)
- Capabilities analysis (skil)
- Security review integration (SkillSpector)

### What Our Skill Should Do Differently

1. **Guided creation workflow**: Requirements → spec → SKILL.md → references → tests → validation
2. **Template-based**: Starter templates for common skill patterns
3. **Validation checklist**: Structure, completeness, safety, testability
4. **Security review integration**: Run SkillSpector/scanner as part of creation
5. **Test generation**: Create test fixtures alongside skill
6. **Documentation generation**: README, examples from skill content
7. **Compatibility checking**: Verify against target agent platforms

### Testable Improvements

- [ ] Requirements gathering for new skill
- [ ] SKILL.md generation from template
- [ ] Reference file creation
- [ ] Test fixture generation
- [ ] Structure validation
- [ ] Security scan integration
- [ ] Compatibility verification

### Out of Scope

- Skill distribution/publishing
- Agent platform-specific packaging
- Runtime skill execution engine

---

## Cross-Cutting Gaps

| Gap | Skills Affected | Resolution |
|-----|----------------|------------|
| No unified status semantics | All | Define Verified/Partial/Failed/NotRun/Unknown per skill |
| No standard JSON schema for reports | All | Create schemas/ per skill or shared |
| No test runner framework | All | Create test runner in tools/ |
| No installation verification | All | Add to integrations/ per agent |
| Prompt injection safety | All | Standard notice in every skill |
| License compliance for bundled content | All | Document in LICENSING-AND-ATTRIBUTION.md |