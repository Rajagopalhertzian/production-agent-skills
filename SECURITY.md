# Security Policy

## Supported Versions

We release security updates for the following versions:

| Version | Supported |
|---------|-----------|
| 1.x.x   | ✅        |
| < 1.0   | ❌        |

## Reporting a Vulnerability

If you discover a security vulnerability in this repository, please report it responsibly:

### Private Disclosure (Preferred)
1. Email: security@your-org.example (replace with actual contact)
2. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Public Disclosure
If you cannot use private disclosure, create a GitHub Security Advisory:
1. Go to the Security tab
2. Click "Report a vulnerability"
3. Fill in the details

### What to Expect
- Acknowledgment within 48 hours
- Initial assessment within 5 business days
- Regular updates on progress
- Credit in the fix (if desired)

## Scope

This security policy covers:
- The skill definitions (`skills/*/SKILL.md`)
- Supporting scripts and templates
- Test fixtures (synthetic data only)
- Documentation

**Out of scope:**
- External tools referenced by skills (gitleaks, trufflehog, osv-scanner, hadolint, checkov, etc.)
- Agent platforms that run the skills
- User's repositories where skills are applied

## Security Principles in Our Skills

All skills in this repository follow these security principles:

### 1. No Automatic Actions
Skills are **advisory only** — they produce reports with recommendations. They never:
- Automatically modify files
- Automatically revoke or rotate credentials
- Automatically rewrite Git history
- Automatically deploy changes
- Automatically install packages

### 2. Human Approval Required
All consequential actions require explicit human approval:
- Credential rotation
- Git history rewrites
- Dependency additions/updates
- Configuration deployments
- Destructive commands

### 3. Safe Credential Handling
- **Never** print full secret values in reports
- **Never** transmit secrets to external services
- **Always** redact: `AKIA****ABCD` not `AKIAIOSFODNN7EXAMPLE`
- **Always** use synthetic credentials in test fixtures

### 4. Prompt Injection Resistance
All skills include:
- Safety notice prohibiting execution of embedded commands
- Output validation against defined schemas
- Treatment of analyzed content as untrusted data

### 5. Evidence-Based Reporting
- Every finding requires verifiable evidence
- Distinguish: Verified / Partially Verified / Failed / Not Run / Unknown
- Report what could NOT be checked (missing tools, no network)

### 6. Minimal Permissions
Skills only require read access to analyze. They document what they need:
- File system read
- Command execution (read-only scanning commands)
- No network access required (optional for enrichment)

## Vulnerability Categories We Address

Our skills help users detect and prevent:

| Category | Skills |
|----------|--------|
| Secret exposure | `secret-leak-prevention` |
| Vulnerable dependencies | `dependency-risk-assessment` |
| Configuration drift/issues | `environment-config-safety` |
| Unverified deployments | `verify-before-finish`, `environment-config-safety` |
| Supply chain attacks | `dependency-risk-assessment` (typosquatting, provenance) |
| Insecure code patterns | `verify-before-finish` (with security tools) |

## Security Testing

Before release, we:
1. Run SkillSpector/scan on all skills
2. Validate all skills against security checklist
3. Test with synthetic malicious inputs
4. Verify no real credentials in any file
5. Confirm output redaction works

## Disclosure Timeline

- **Day 0**: Vulnerability reported
- **Day 1-2**: Acknowledgment and triage
- **Day 3-10**: Assessment and fix development
- **Day 11-30**: Testing and preparation
- **Day 30+**: Coordinated disclosure (advisory + release)

We aim to fix critical vulnerabilities within 30 days.

## Hall of Fame

We recognize responsible disclosure. Contributors will be listed here (with permission).

---

**Note**: This repository provides workflows (skills) for AI agents. The security of the agent platform itself, the repositories being analyzed, and the external tools used are outside our control. Users are responsible for securing their own environments.