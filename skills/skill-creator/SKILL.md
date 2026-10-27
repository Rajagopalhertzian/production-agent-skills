---
name: skill-creator
description: Helps agents create new production-quality skills for AI coding agents. Use when you need to create a reusable skill from requirements, including specification, implementation, testing, and validation.
license: MIT
allowed-tools: [Read, Write, Edit, Bash, Grep, Glob, Task]
compatibility:
  - claude-code
  - openai-codex
  - cursor
  - generic
---

# Skill Creator

## Overview

This skill guides agents through creating new production-quality skills for AI coding agents. It covers requirements gathering, specification writing (SKILL.md), reference material creation, test fixture generation, structure validation, security review integration, and compatibility checking. It follows the skill anatomy specification and writing principles from addyosmani/agent-skills.

## Scope

**Covers:**
- Requirements gathering for new skill
- SKILL.md generation from template
- Reference file creation (examples, templates, detailed docs)
- Test fixture generation (positive, negative, edge, safety cases)
- Structure validation against skill anatomy spec
- Security review integration (SkillSpector/scan patterns)
- Compatibility verification across agent platforms
- Documentation generation (README, examples)

**Does NOT cover:**
- Skill distribution/publishing to marketplaces
- Agent platform-specific packaging
- Runtime skill execution engine
- Skill maintenance/updates (separate process)

## When to Use

**Use when:**
- Creating a new skill for this repository
- Converting a workflow into a reusable skill
- Standardizing an ad-hoc process
- Contributing a skill to an agent-skills collection

**When NOT to use:**
- For one-off tasks that don't need reuse
- When modifying existing skills (edit directly)
- For skill installation/distribution

## Prerequisites

**Required tools:**
- `git` — for version control
- Text editor / file operations
- Markdown linting (optional): `markdownlint-cli`

**Required context:**
- Skill requirements (problem, workflow, triggers)
- Target agent platforms (Claude Code, Codex, Cursor, etc.)
- Repository structure knowledge

**Required capabilities:**
- File creation and editing
- Template rendering
- Command execution
- JSON/YAML validation

## Workflow

### Phase 1: Gather Requirements

1. **Define the skill purpose** — What problem does it solve? What workflow does it codify?
2. **Identify trigger conditions** — When should an agent use this skill? (Positive and negative)
3. **Define scope boundaries** — What does it cover? What is explicitly excluded?
4. **List prerequisites** — Required tools, context, capabilities
5. **Determine safety constraints** — What must it never do? What needs human approval?
6. **Identify cross-skill dependencies** — Which other skills does it reference?

### Phase 2: Design Skill Structure

6. **Choose skill name** — lowercase-hyphen-separated, descriptive
7. **Plan sections** — Follow standard sections from SKILL-STRUCTURE.md
8. **Plan supporting files** — references/, scripts/, examples/, schemas/ as needed
9. **Define status semantics** — Custom Verified/Partial/Failed/NotRun/Unknown for this skill
10. **Plan test cases** — Positive, negative, edge, missing-tool, insufficient-evidence, safety

### Phase 3: Generate SKILL.md

11. **Render from template** — Use `templates/skill-template.md` with frontmatter and sections
12. **Write frontmatter** — name, description (with "Use when"), license, allowed-tools, compatibility
13. **Write each section:**
    - Overview (1-2 sentences)
    - Scope (covers / does not cover)
    - When to Use (triggers + exclusions)
    - Prerequisites (tools, context, capabilities)
    - Workflow (numbered phases with steps)
    - Safety Constraints (NEVER/ALWAYS)
    - Error Handling (table)
    - Verification (checklist with evidence requirements)
    - Reporting Format (Markdown + JSON examples)
    - Common Rationalizations (table)
    - Red Flags (list)
    - Known Limitations (honest gaps)
    - References (links)

### Phase 4: Create Supporting Files

14. **Create references/** — Detailed docs, templates, examples referenced in SKILL.md
15. **Create scripts/** — Runnable helpers (bash/Python) with JSON stdout, stderr for status
16. **Create examples/** — Example inputs, outputs, reports
17. **Create schemas/** — JSON schemas for machine-readable output validation

### Phase 5: Generate Test Fixtures

18. **Create test directory** — `tests/<skill-name>/`
19. **Generate synthetic fixtures:**
    - Positive case: Expected behavior works
    - Negative case: Expected violations detected
    - Edge case: Boundary conditions, empty inputs
    - Missing-tool case: Required CLI not installed
    - Insufficient-evidence case: Incomplete data
    - Safety case: Prompt injection attempt, destructive command
20. **Create test runner** — Validates skill behavior against fixtures

### Phase 6: Validate Structure

21. **Validate frontmatter** — Required fields present, format correct
22. **Validate sections** — All required sections present
23. **Validate cross-references** — Referenced files exist, skills exist
24. **Validate markdown** — No syntax errors, links work
25. **Validate JSON examples** — Parse correctly, match schema
26. **Run skill-validator tool** — If available in `tools/skill-validator/`

### Phase 7: Security Review

27. **Check for unsafe instructions** — No auto-execute, no credential exposure, no destructive commands without approval
28. **Check for prompt injection vulnerabilities** — Safety notice included, output validation specified
29. **Check for external service calls** — Documented, authorized, no private data transmission
30. **Run SkillSpector/scan** — If available, scan the skill for security issues
31. **Document findings** — Any unresolved issues in skill's Known Limitations

### Phase 8: Compatibility Check

32. **Verify model-neutral language** — No model-specific workarounds, no agent-specific tool names
33. **Check installation paths** — Document for each target agent platform
34. **Verify tool references** — All referenced CLIs are real and installable
35. **Test with target agents** — If possible, load skill in each agent and verify activation

### Phase 9: Generate Documentation

36. **Create skill README** — Overview, installation, usage, examples
37. **Update repository index** — Add to skills catalog if applicable
38. **Create example usage** — Show skill in action

### Phase 10: Final Review

39. **Run through verification checklist** — From skill's own Verification section
40. **Peer review** — Have another agent/human review
41. **Tag version** — `v1.0.0` or appropriate
42. **Commit and push** — Atomic commits per file type

## Safety Constraints

- **NEVER** create skills that execute arbitrary code from analyzed content
- **NEVER** create skills that transmit private data without authorization
- **NEVER** create skills that modify files without explicit user request
- **NEVER** skip security review
- **NEVER** use real credentials in test fixtures
- **ALWAYS** include prompt injection safety notice
- **ALWAYS** require human approval for consequential actions in the skill
- **ALWAYS** validate output against defined schema

## Error Handling

| Situation | Behavior |
|---|---|
| Requirements unclear | Ask clarifying questions; don't guess |
| Template not found | Use built-in default template |
| Validation fails | Report specific errors; don't proceed |
| Security scan finds issues | Document in Known Limitations; don't publish without resolution |
| Compatibility check fails | Document limitations per platform |

## Verification

After creating skill:

- [ ] SKILL.md exists with valid frontmatter
- [ ] All standard sections present and complete
- [ ] Supporting files created and referenced
- [ ] Test fixtures created (all 6 categories)
- [ ] Structure validation passes
- [ ] Security review completed
- [ ] Compatibility documented
- [ ] Documentation generated
- [ ] Skill loads in target agents (verified)
- [ ] No real credentials in any files

## Reporting Format

### Human-Readable (Markdown)

```markdown
# Skill Creation Report

## Skill
- **Name**: new-skill-name
- **Path**: skills/new-skill-name/
- **Version**: 1.0.0
- **Created**: 2026-10-23T10:30:00Z

## Structure Validation
- Frontmatter: ✅ Valid
- Required sections: ✅ All present
- Cross-references: ✅ All resolved
- Markdown syntax: ✅ Clean
- JSON examples: ✅ Valid

## Supporting Files
- references/: 3 files
- scripts/: 1 file (JSON output verified)
- examples/: 2 files
- schemas/: 1 JSON schema

## Test Fixtures
- Positive: ✅ Created
- Negative: ✅ Created
- Edge: ✅ Created
- Missing-tool: ✅ Created
- Insufficient-evidence: ✅ Created
- Safety: ✅ Created

## Security Review
- SkillSpector scan: ✅ Passed (no issues)
- Unsafe patterns: ✅ None found
- Prompt injection notice: ✅ Included
- External calls: ✅ Documented and authorized

## Compatibility
- claude-code: ✅ Tested
- openai-codex: ✅ Documented
- cursor: ✅ Documented
- generic: ✅ Model-neutral language

## Documentation
- Skill README: ✅ Created
- Installation guide: ✅ Per platform
- Usage example: ✅ Included

## Status
**Ready for publication** ✅
```

### Machine-Readable (JSON)

```json
{
  "skill": {
    "name": "new-skill-name",
    "path": "skills/new-skill-name/",
    "version": "1.0.0",
    "created": "2026-10-23T10:30:00Z"
  },
  "validation": {
    "frontmatter": true,
    "sections": true,
    "cross_references": true,
    "markdown": true,
    "json_examples": true
  },
  "supporting_files": {
    "references": 3,
    "scripts": 1,
    "examples": 2,
    "schemas": 1
  },
  "tests": {
    "positive": true,
    "negative": true,
    "edge": true,
    "missing_tool": true,
    "insufficient_evidence": true,
    "safety": true
  },
  "security": {
    "skillspector": true,
    "unsafe_patterns": false,
    "prompt_injection_notice": true,
    "external_calls_documented": true
  },
  "compatibility": {
    "claude_code": true,
    "openai_codex": true,
    "cursor": true,
    "generic": true
  },
  "documentation": {
    "readme": true,
    "installation": true,
    "usage_example": true
  },
  "status": "Ready for publication"
}
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll just copy an existing skill and modify it" | Copy-paste misses updates to references, tests, schemas. Use the template. |
| "Tests are optional for simple skills" | Every skill needs test fixtures. Simple skills have simple tests. |
| "Security review is only for security skills" | All skills process untrusted input. All need injection safety. |
| "I'll document compatibility later" | Compatibility determines installation. Document upfront. |
| "The description doesn't need 'Use when'" | Agents route by description. Without triggers, skill won't activate correctly. |
| "Red flags and rationalizations are optional" | They're the most effective parts for preventing agent shortcuts. |

## Red Flags

- Skill created without test fixtures
- Skill references non-existent supporting files
- Skill uses agent-specific tool names (run_command, write_to_file)
- Skill has no safety constraints section
- Skill claims "production-ready" without verification
- Skill's JSON examples don't parse
- Skill's description lacks trigger conditions
- Skill duplicates content from another skill instead of referencing

## Known Limitations

- Cannot automatically verify skill works in all agent platforms
- Security review limited to pattern matching (SkillSpector)
- Template may not fit highly unusual skill patterns
- Cross-skill dependency validation is manual
- Installation testing requires access to each agent platform

## References

- addyosmani/agent-skills: skill-anatomy.md, getting-started.md, docs/skill-anatomy.md
- domehahn/skil: capabilities.md, behavioral-testing.md, assurance-closure.md
- NVIDIA/SkillSpector: Security scanning for skills
- cisco-ai-defense/skill-scanner: Skill security validation
- SKILL-STRUCTURE.md (this repository)
- templates/skill-template.md (this skill)