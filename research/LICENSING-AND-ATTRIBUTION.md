# Licensing and Attribution

Research conducted: 2026-10-23

## Repository Licenses

| Repository | License | SPDX Identifier | Permissive? | Copyleft? | Patent Grant? |
|------------|---------|-----------------|-------------|-----------|---------------|
| addyosmani/agent-skills | MIT | MIT | ✅ | ❌ | ❌ |
| UnitOneAI/SecuritySkills | MIT | MIT | ✅ | ❌ | ❌ |
| NVIDIA/SkillSpector | Apache-2.0 | Apache-2.0 | ✅ | ❌ | ✅ |
| cisco-ai-defense/skill-scanner | TBD | TBD | TBD | TBD | TBD |
| domehahn/skil | TBD | TBD | TBD | TBD | TBD |
| gitleaks/gitleaks | MIT | MIT | ✅ | ❌ | ❌ |
| trufflesecurity/trufflehog | TBD | TBD | TBD | TBD | TBD |
| google/osv-scanner | Apache-2.0 | Apache-2.0 | ✅ | ❌ | ✅ |
| semgrep/semgrep | TBD (likely LGPL) | LGPL-2.1-or-later | ❌ | ✅ (weak) | ❌ |
| bridgecrewio/checkov | TBD | TBD | TBD | TBD | TBD |
| hadolint/hadolint | TBD | TBD | TBD | TBD | TBD |
| renovatebot/renovate | TBD | TBD | TBD | TBD | TBD |

## License Implications for Our Project

### MIT Licensed (addyosmani/agent-skills, UnitOneAI/SecuritySkills, gitleaks/gitleaks)
- **Permits**: Commercial use, modification, distribution, private use
- **Requires**: License and copyright notice preservation
- **Our use**: Can freely reference concepts, patterns, structures; must not copy large sections verbatim without attribution
- **Attribution**: Include original copyright notice if adapting substantial portions

### Apache-2.0 Licensed (NVIDIA/SkillSpector, google/osv-scanner)
- **Permits**: Commercial use, modification, distribution, private use, patent use
- **Requires**: License notice, state changes, preserve NOTICE file if present
- **Patent grant**: Contributors grant patent license
- **Our use**: Can reference concepts; patent grant useful if we implement similar scanning logic

### LGPL Likely (semgrep/semgrep)
- **Weak copyleft**: Linking to LGPL library requires LGPL compliance
- **Our use**: Do NOT bundle semgrep code; reference as external dependency only
- **If we copy patterns**: Must be careful — LGPL may apply to derivative works

### Unknown Licenses (cisco-ai-defense, domehahn, trufflehog, checkov, hadolint, renovate)
- **Risk**: Cannot assume permissive; must verify before any code reuse
- **Our approach**: Reference as external tools only; do not copy source code

## Our Repository License Decision

**Recommended: MIT License**

Rationale:
- Maximum compatibility with all referenced projects
- Permissive for commercial and open source use
- Simple, well-understood
- Aligns with addyosmani/agent-skills and UnitOneAI/SecuritySkills

### License File Content

```
MIT License

Copyright (c) 2026 production-agent-skills contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Attribution Requirements

### For Concepts and Patterns (No Code Copying)
- **No formal attribution required** for ideas, patterns, workflows described in original language
- **Good practice**: Reference in README or documentation: "Inspired by patterns from addyosmani/agent-skills, UnitOneAI/SecuritySkills, NVIDIA/SkillSpector, and others"

### For Direct Text Adaptation (If Any)
If we adapt specific text (e.g., frontmatter structure, section names):
- Add comment in file: `// Adapted from addyosmani/agent-skills (MIT)`
- Include in NOTICE file if we create one

### For Tool Integration (No Code Copying)
- Reference tools as external dependencies
- Document installation: `brew install gitleaks`, `go install github.com/google/osv-scanner/cmd/osv-scanner@latest`, etc.
- No license conflict — we're calling CLIs, not linking libraries

## What We Must NOT Do

1. **Do not copy large sections** of SKILL.md files from other repositories
2. **Do not bundle** semgrep, checkov, hadolint, trufflehog, or renovate source code
3. **Do not assume** unknown licenses are permissive
4. **Do not remove** license headers from any referenced files we might include (e.g., schemas)

## What We CAN Do

1. **Independently write** all SKILL.md files using patterns as inspiration
2. **Reference external tools** by name and installation command
3. **Create original test fixtures** with synthetic data
4. **Document compatibility** with agent platforms
5. **Create our own schemas** for JSON output (inspired by but not copied from UnitOneAI)
6. **Adapt frontmatter structure** (name, description are generic concepts)

## Third-Party Tool Licenses (For Integration Documentation)

| Tool | License | Integration Type |
|------|---------|------------------|
| gitleaks | MIT | CLI call |
| trufflehog | TBD | CLI call |
| osv-scanner | Apache-2.0 | CLI call |
| semgrep | LGPL | CLI call (no linking) |
| checkov | TBD | CLI call |
| hadolint | TBD | CLI call |
| renovate | TBD | CLI call / GitHub App |
| BFG Repo-Cleaner | BSD-3-Clause | CLI call |
| git-filter-repo | MIT | CLI call |
| sigstore/cosign | Apache-2.0 | CLI call |

**Key Principle**: All integrations are via CLI subprocess calls — no library linking, no license contamination.

## Contributor License Agreement

For external contributions to our repository:
- All contributions accepted under MIT License
- Contributors retain copyright but grant project the rights per MIT
- No separate CLA required for MIT (implicit in PR submission)
- Document in CONTRIBUTING.md

## Compliance Checklist for Release

- [ ] LICENSE file at root with MIT license
- [ ] No verbatim copies of >50 lines from other projects
- [ ] All adapted text attributed in comments
- [ ] External tools referenced only via CLI, not bundled
- [ ] Test fixtures contain only synthetic data
- [ ] No proprietary code included
- [ ] NOTICE file if we adapt Apache-2.0 licensed content substantially
- [ ] CONTRIBUTING.md states MIT license for contributions

## Unresolved License Questions

1. **cisco-ai-defense/skill-scanner license**: Need to verify before referencing any code
2. **domehahn/skil license**: Need to verify before referencing any code
3. **trufflesecurity/trufflehog license**: Need to verify
4. **bridgecrewio/checkov license**: Need to verify
5. **hadolint/hadolint license**: Need to verify
6. **renovatebot/renovate license**: Need to verify
7. **semgrep/semgrep exact license**: Need to confirm LGPL version

**Action**: Verify unknown licenses before any code-level integration. For now, treat as external CLI tools only.

## Summary

Our skills will be **originally written** in MIT-licensed repository. We reference patterns from MIT/Apache-2.0 projects freely (with attribution for substantial adaptation). We integrate external security tools via CLI only — no license risk. Unknown-license tools are referenced as "install separately" dependencies only.