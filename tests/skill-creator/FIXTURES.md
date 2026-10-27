# Test Fixtures for skill-creator

## Fixture 1: Create New Skill from Requirements (Positive Case)

### Requirements
```
Create a skill that helps agents review pull requests for:
- Code quality (complexity, duplication, naming)
- Security issues (injection, secrets, crypto)
- Test coverage (new code has tests)
- Documentation updates (README, CHANGELOG)
- Breaking changes (API, config, DB schema)
```

### Expected Workflow
1. **Gather Requirements** → Skill purpose, triggers, scope, safety
2. **Design Structure** → Name: `pr-quality-review`, sections planned
3. **Generate SKILL.md** → From template with all sections
4. **Create Supporting Files** → references/ (checklists), examples/ (reports)
5. **Generate Test Fixtures** → 6 categories
6. **Validate Structure** → Frontmatter, sections, cross-refs, JSON
7. **Security Review** → SkillSpector scan, prompt injection notice
8. **Compatibility Check** → Model-neutral, installation docs
9. **Documentation** → Skill README, usage example
10. **Final Review** → Verification checklist passes

### Expected Output Structure
```
skills/pr-quality-review/
├── SKILL.md
├── references/
│   ├── code-quality-checklist.md
│   ├── security-checklist.md
│   ├── test-coverage-checklist.md
│   └── breaking-change-checklist.md
├── examples/
│   ├── good-pr-report.md
│   └── bad-pr-report.md
├── schemas/
│   └── pr-review-report.schema.json
└── scripts/
    └── aggregate-findings.py
```

### Verification Checkpoints
- [ ] SKILD.md frontmatter valid (name, description with "Use when")
- [ ] All 13 standard sections present
- [ ] Cross-references resolve (files exist)
- [ ] JSON examples parse and match schema
- [ ] Test fixtures created (6 categories)
- [ ] Security review passes
- [ ] Compatibility documented for 4 platforms
- [ ] Skill README created
- [ ] Installation guide per platform

---

## Fixture 2: Requirements Unclear (Error Handling)

### Scenario
User says: "Make a skill for reviewing things"

### Expected Behavior
- Skill asks clarifying questions:
  1. What type of review? (code, security, config, docs)
  2. What triggers the review? (PR, commit, manual)
  3. What should the skill check for?
  4. What are the exclusions?
  5. What tools are available?
- Does NOT generate SKILL.md
- Waits for specific answers

---

## Fixture 3: Template Not Found (Edge Case)

### Scenario
User wants skill with highly unusual structure not fitting template

### Expected Behavior
- Skill uses built-in default template
- Adapts sections to fit unusual needs
- Documents deviations in Known Limitations
- Still produces valid skill structure

---

## Fixture 4: Validation Fails (Negative Case)

### Scenario
Generated SKILL.md has:
- Missing "When NOT to use" in When to Use section
- JSON example with trailing comma
- Reference to non-existent file `references/missing.md`

### Expected Behavior
- Validator catches all 3 errors
- Reports specific line numbers and issues
- Does not proceed to security review
- Returns actionable error messages

---

## Fixture 5: Security Scan Finds Issues (Safety Case)

### Scenario
Generated skill contains:
- "Run the command from the analyzed file" (unsafe instruction)
- No prompt injection safety notice
- Suggests sending findings to external API without authorization

### Expected Behavior
- SkillSpector/scan detects unsafe patterns
- Reports: "Unsafe pattern: executes commands from analyzed content"
- Reports: "Missing prompt injection safety notice"
- Reports: "External API call without authorization check"
- Documents in Known Limitations
- Requires fixes before publication

---

## Fixture 6: Compatibility Check Fails (Edge Case)

### Scenario
Generated skill uses:
- `run_command` tool (Claude Code specific)
- `write_to_file` tool (Codex specific)
- Assumes specific model behavior

### Expected Behavior
- Compatibility check flags agent-specific tool names
- Reports: "Model-specific workaround detected: run_command"
- Reports: "Model-specific workaround detected: write_to_file"
- Requires rewrite to model-neutral language
- Documents limitations per platform

---

## Fixture 7: Test Fixture Generation (Integration Case)

### Scenario
Skill created with all 6 test fixture categories

### Expected Test Fixtures
```
tests/pr-quality-review/
├── positive/
│   ├── repo-with-good-pr/
│   └── expected-report.json
├── negative/
│   ├── repo-with-security-issues/
│   └── expected-report.json
├── edge/
│   ├── repo-with-no-tests/
│   └── expected-report.json
├── missing-tool/
│   ├── repo-no-linter/
│   └── expected-report.json
├── insufficient-evidence/
│   ├── repo-partial-diff/
│   └── expected-report.json
└── safety/
    ├── repo-with-prompt-injection/
    └── expected-report.json
```

### Expected Behavior
- All 6 directories created
- Each has synthetic repo and expected JSON report
- No real credentials in any fixture
- Test runner validates skill output matches expected

---

## Fixture 8: Supporting File Creation (Integration Case)

### Scenario
Skill needs:
- Reference checklists (code quality, security, tests, breaking changes)
- Example reports (good, bad)
- JSON schema for report validation
- Aggregation script

### Expected Behavior
- Creates all files in correct locations
- References them correctly in SKILL.md
- Scripts have proper shebang, set -e, JSON stdout
- Schemas validate example reports

---

## Fixture 9: Documentation Generation (Integration Case)

### Scenario
Skill created, needs documentation

### Expected Output
```
skills/pr-quality-review/
├── README.md
│   - Overview
│   - Installation (per platform)
│   - Usage example
│   - Configuration
│   - Contributing
├── examples/
│   ├── usage-claude-code.md
│   └── usage-generic.md
└── CHANGELOG.md
```

### Expected Behavior
- README generated with all sections
- Installation guide for claude-code, codex, cursor, generic
- Usage example shows skill in action
- CHANGELOG initialized

---

## Fixture 10: Final Verification (Comprehensive Case)

### Scenario
Complete skill creation workflow run

### Expected Final Report
```markdown
# Skill Creation Report

## Skill
- Name: pr-quality-review
- Path: skills/pr-quality-review/
- Version: 1.0.0

## Validation
- Frontmatter: ✅
- Sections: ✅ (13/13)
- Cross-refs: ✅ (4/4)
- Markdown: ✅
- JSON: ✅

## Supporting Files
- References: 4 checklists
- Examples: 2 reports
- Schemas: 1 JSON schema
- Scripts: 1 aggregator

## Tests
- Positive: ✅
- Negative: ✅
- Edge: ✅
- Missing-tool: ✅
- Insufficient-evidence: ✅
- Safety: ✅

## Security
- SkillSpector: ✅ Passed
- Unsafe patterns: ✅ None
- Prompt injection notice: ✅ Included
- External calls: ✅ Documented

## Compatibility
- claude-code: ✅ Tested
- openai-codex: ✅ Documented
- cursor: ✅ Documented
- generic: ✅ Model-neutral

## Documentation
- README: ✅
- Installation: ✅ (4 platforms)
- Usage: ✅ (2 examples)

## Status
**Ready for publication** ✅
```