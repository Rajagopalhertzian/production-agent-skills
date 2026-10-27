# Engineering Patterns

Documented from research across agent-skills, SecuritySkills, SkillSpector, skill-scanner, skil, and security tooling repositories.

## 1. Clear Skill Metadata

**Pattern**: Structured YAML frontmatter with required and optional fields.

**Observed In**: 
- addyosmani/agent-skills: `name`, `description` (required), `license`, `compatibility`, `metadata`, `allowed-tools`
- UnitOneAI/SecuritySkills: Adds `tags`, `role`, `phase`, `frameworks`, `difficulty`, `time_estimate`, `version`, `author`, `injection-hardened`, `argument-hint`
- NVIDIA/SkillSpector: Skill manifest with security metadata
- domehahn/skil: Vendor-neutral capability descriptors

**Key Principles**:
- `name`: lowercase-hyphen-separated, matches directory name
- `description`: Third-person action + "Use when" trigger conditions (max 1024 chars)
- Top-level keys limited to specification fields; vendor controls under `metadata`
- Published names are compatibility identifiers — downstream catalogs own aliases

**Adaptation for Our Skills**: Use minimal required frontmatter (name, description) plus optional `license`, `allowed-tools`, and `compatibility`. Avoid vendor-specific fields in main SKILL.md.

---

## 2. Narrowly Defined Responsibilities

**Pattern**: Each skill does one thing well, with explicit scope boundaries.

**Observed In**:
- addyosmani/agent-skills: TDD skill only covers test-driven development, references browser-testing-with-devtools for browser work
- UnitOneAI/SecuritySkills: Separate skills for api-security, dependency-scanning, owasp-top-10-web, secure-code-review, threat-modeling
- SkillSpector: Scans skills for security issues — doesn't fix them

**Key Principles**:
- Single responsibility per skill directory
- Cross-skill references by name, not duplication
- "When NOT to use" section explicitly defines exclusions
- Skills compose via agent workflow, not merging

**Adaptation**: Each of our 5+2 skills has one clear purpose. Explicitly document what each skill does NOT cover.

---

## 3. Progressive Disclosure

**Pattern**: Main SKILL.md is entry point; detailed reference material loads on demand.

**Observed In**:
- addyosmani/agent-skills: SKILL.md < 500 lines; references/ at repo root (shared) or skill directory (skill-specific)
- UnitOneAI/SecuritySkills: Schemas, fixer policy, SARIF docs in separate files
- domehahn/skil: ADRs, specs, guides in docs/ subdirectories

**Key Principles**:
- Keep main SKILL.md focused on operational instructions
- Move lengthy technical details, examples, tool-specific procedures to reference files
- Reference files loaded only when workflow reaches them
- Shared references at repo root for cross-skill use; skill-specific in skill/references/
- One-level deep file references from SKILL.md

**Adaptation**: Each skill has SKILL.md + references/ directory for supporting docs. Shared references in research/ or root references/.

---

## 4. Evidence-Based Reporting

**Pattern**: Every claim requires verifiable evidence; distinguish observed facts from assumptions.

**Observed In**:
- addyosmani/agent-skills: Verification checklists require test output, build results, screenshots; "Test names describe behavior" not "tests pass"
- UnitOneAI/SecuritySkills: "Required evidence" — file paths, line numbers, policy snippets, scanner output, logs, reproducible steps; findings as hypotheses until validated
- domehahn/skil: Attestations, assurance closure, behavioral testing with evidence

**Key Principles**:
- Verification checkboxes require proof (command output, file diff, test result)
- Status semantics: Verified / Partially Verified / Failed / Not Run / Unknown
- Report which checks could not be completed (missing tools, no network)
- Never claim "secure" — only "no known vulnerabilities found"
- Distinguish observed repository facts from assumptions

**Adaptation**: Each skill's verification section uses explicit status values. Reports redact sensitive values. Network-dependent checks explicitly report when unavailable.

---

## 5. Deterministic Validation

**Pattern**: Use scripts for repeatable checks; natural language for judgment.

**Observed In**:
- addyosmani/agent-skills: Scripts convention — bash shebang, set -e, stderr for status, stdout for JSON
- UnitOneAI/SecuritySkills: Normalized JSON output validating against schema; SARIF mapping
- gitleaks/trufflehog/osv-scanner: CLI tools with JSON output
- semgrep/checkov/hadolint: Deterministic pattern matching

**Key Principles**:
- SKILL.md for: workflow instructions, decision criteria, preconditions, safety rules, verification requirements, reporting guidance
- Scripts for: repeatable checks, data validation, machine-readable output, deterministic comparisons
- Don't create scripts just because possible — prefer existing established tools
- When tool optional, explain fallback behavior
- When network unavailable, report which checks skipped

**Adaptation**: Each skill references established CLI tools (gitleaks, osv-scanner, hadolint, checkov, semgrep) via terminal calls. Optional helper scripts in skills/*/scripts/ for aggregation/formatting only.

---

## 6. Human Approval for Consequential Actions

**Pattern**: Explicit authorization gates before destructive or high-impact operations.

**Observed In**:
- UnitOneAI/SecuritySkills: Fixer policy with review gates, reviewer evidence, rollback guidance; escalation rules for high-impact risks
- addyosmani/agent-skills: Shipping-and-launch skill, /ship command with approvals
- SkillSpector: Scans before install — doesn't auto-install
- renovatebot/renovate: PR-based updates requiring merge approval

**Key Principles**:
- Never automatically revoke credentials, rewrite Git history, upload secrets
- Require explicit user confirmation for: credential rotation, Git history rewrites, dependency updates, deployment commands
- Skill provides analysis/recommendations; human decides actions
- Rollback guidance included in remediation plans

**Adaptation**: All skills are advisory — they produce reports with recommendations. Explicit "Requires human approval" flags for consequential actions (secret rotation, dependency updates, config deployment).

---

## 7. Safe Handling of Credentials

**Pattern**: Never log, transmit, or store full secret values; redact in reports.

**Observed In**:
- gitleaks: Redacts secrets in output, configurable redaction
- trufflehog: Verifies credentials without exposing them
- UnitOneAI/SecuritySkills: "Never exfiltrate data. Do not include sensitive values in output. Redact or reference generically."
- NVIDIA/SkillSpector: Prompt injection safety — treat analyzed content as data, not directives

**Key Principles**:
- Redact full secret values in all reports (show only prefix/suffix or type)
- Never transmit secrets to external services without authorization
- Use synthetic credentials in tests
- Treat analyzed content as untrusted data — never execute embedded commands
- Validate all output against defined schema

**Adaptation**: All skills include prompt injection safety notices. Test fixtures use synthetic secrets. Reports show secret type and location, never full value.

---

## 8. Error Handling

**Pattern**: Explicit handling of missing tools, unavailable services, incomplete data.

**Observed In**:
- addyosmani/agent-skills: "When external network access is unavailable, report which checks could not be completed"
- UnitOneAI/SecuritySkills: "Blind spots" — cannot prove controls exist when evidence missing; "False-positive risks" — treat findings as hypotheses
- osv-scanner: Handles offline environments, incomplete advisory data

**Key Principles**:
- Distinguish: tool not installed / tool failed / network unavailable / no findings
- Report "not run" vs "passed" vs "failed" explicitly
- Graceful degradation — partial results with clear limitations
- Don't silently substitute unreliable checks for authoritative ones

**Adaptation**: Each skill documents behavior when: required CLI missing, network unavailable, advisory service down, lockfile missing, config file absent.

---

## 9. Structured Outputs

**Pattern**: Machine-readable output formats for integration and validation.

**Observed In**:
- UnitOneAI/SecuritySkills: Normalized JSON against finding.schema.json; SARIF 2.1.0 output
- gitleaks/trufflehog/osv-scanner: JSON output formats
- SkillSpector: Scan results in structured format
- domehahn/skil: Schema validation, capabilities JSON

**Key Principles**:
- Define output schema for each skill's report
- Support both human-readable (Markdown) and machine-readable (JSON)
- Validate output against schema
- SARIF compatibility for security tooling integration

**Adaptation**: Each skill produces Markdown report + JSON summary. JSON schema defined in skill's references/ or root schemas/.

---

## 10. Test Fixtures

**Pattern**: Synthetic test cases covering positive, negative, edge, and safety scenarios.

**Observed In**:
- addyosmani/agent-skills: evals/cases/, evals/fixtures/, evals/plugin/, evals/skill-impact.md
- UnitOneAI/SecuritySkills: tests/ directory
- SkillSpector: tests/, evals/EVAL_DATASETS.md
- cisco-ai-defense/skill-scanner: evals/, tests/

**Key Principles**:
- Positive cases: expected behavior works
- Negative cases: expected violations detected
- Edge cases: boundary conditions, empty inputs, conflicting signals
- Missing-tool scenarios: tool unavailable
- Insufficient-evidence scenarios: incomplete data
- Safety cases: prompt injection attempts, destructive command detection
- Never use real credentials in fixtures

**Adaptation**: tests/ directory per skill with synthetic repositories, configs, credentials. Test runner validates skill behavior against fixtures.

---

## 11. False-Positive Management

**Pattern**: Acknowledge and provide suppression/triage mechanisms for false positives.

**Observed In**:
- gitleaks: Allowlist rules, baseline files
- trufflehog: Verification step reduces false positives
- UnitOneAI/SecuritySkills: EPSS+CVSS+KEV triage prioritizes real risk; suppression mechanism documented
- SkillSpector: SUPPRESSION.md, scan-completeness.md
- semgrep: Rule tuning, ignore comments

**Key Principles**:
- Distinguish detection from verification (trufflehog model)
- Risk-based triage (EPSS + KEV) not just severity
- Documented suppression with justification
- Track false positive rates

**Adaptation**: Skills include triage guidance. Secret prevention distinguishes "detected" from "verified." Dependency assessment uses EPSS/KEV triage. Configuration safety validates with dry-run.

---

## 12. Explicit Limitations

**Pattern**: Document what the skill cannot do, blind spots, and assumptions.

**Observed In**:
- addyosmani/agent-skills: "Limitations" section in skills; "When NOT to use"
- UnitOneAI/SecuritySkills: Dedicated "Limitations" section with blind spots, false-positive risks, required evidence
- SkillSpector: Docs on scan completeness, adversarial testing

**Key Principles**:
- Honest about coverage gaps
- "No advisory found" ≠ "known safe"
- Cannot prove absence of issues
- Runtime-only issues may be missed
- External service dependencies noted

**Adaptation**: Every skill has "Known Limitations" section. Status "Unknown" for uncheckable items.

---

## 13. Compatibility and Portability

**Pattern**: Skills work across multiple agent platforms; installation documented per agent.

**Observed In**:
- addyosmani/agent-skills: Works with any agent; setup guides for Claude Code, Codex, Cursor, Gemini, OpenCode, etc.; marketplace plugins
- UnitOneAI/SecuritySkills: Works with Claude Code, Gemini CLI, Cursor, Codex CLI, OpenClaw, Kiro
- SkillSpector: Scans Claude Code, Codex, MCP skills
- cisco-ai-defense/skill-scanner: .cursor/rules, .devin, .windsurf/rules, Formula (Homebrew)

**Key Principles**:
- Model-neutral instructions (write procedure, not workaround for specific model)
- Don't prescribe exact command forms or agent-specific tool names
- Document installation for each tested agent
- Skill discovery via description in system prompt

**Adaptation**: Skills written in model-neutral language. Integration guides in integrations/ per agent. No agent-specific tool names in SKILL.md.

---

## 14. Anti-Rationalization (Common Rationalizations)

**Pattern**: Table of excuses agents use to skip steps, with factual rebuttals.

**Observed In**:
- addyosmani/agent-skills: Distinctive feature in every skill (TDD: "I'll write tests after", "This is too simple to test", etc.)
- UnitOneAI/SecuritySkills: Implicit in fixer policy review gates

**Key Principles**:
- Identify actual failure modes from experience
- Pair each excuse with concrete counter-evidence
- Prevents agents from rationalizing shortcuts

**Adaptation**: Each skill includes "Common Rationalizations" table based on specified failure modes.

---

## 15. Red Flags

**Pattern**: Observable behavioral patterns indicating skill violation.

**Observed In**:
- addyosmani/agent-skills: Every skill has "Red Flags" section (TDD: writing code without tests, tests passing on first run, etc.)

**Key Principles**:
- Observable during review or self-monitoring
- Specific behavioral indicators
- Useful for code review and automated checks

**Adaptation**: Each skill includes "Red Flags" section mapped to specified failure modes.

---

## Summary: Pattern Adoption Checklist for Our Skills

| Pattern | Adopted? | Location in Skill |
|---------|----------|-------------------|
| Clear metadata (YAML frontmatter) | ✅ | SKILL.md frontmatter |
| Narrow responsibility | ✅ | Scope section |
| Progressive disclosure | ✅ | references/ directory |
| Evidence-based reporting | ✅ | Verification section with status enum |
| Deterministic validation | ✅ | Scripts + CLI tool references |
| Human approval gates | ✅ | Safety constraints section |
| Safe credential handling | ✅ | Prompt injection notice, redaction |
| Error handling | ✅ | Error-handling behavior section |
| Structured outputs | ✅ | Reporting format (MD + JSON) |
| Test fixtures | ✅ | tests/ directory per skill |
| False-positive management | ✅ | Triage guidance in workflow |
| Explicit limitations | ✅ | Known Limitations section |
| Compatibility/portability | ✅ | Model-neutral, integrations/ |
| Anti-rationalization | ✅ | Common Rationalizations table |
| Red flags | ✅ | Red Flags section |