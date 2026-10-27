#!/usr/bin/env python3
"""
Check cross-references in SKILL.md files.
Validates that referenced skills, files, and URLs exist.
"""

import os
import sys
import re
from pathlib import Path

SKILLS_DIR = Path("skills")
ROOT_DIR = Path(".")

def get_all_skills():
    """Get list of all skill names."""
    return sorted([d.name for d in SKILLS_DIR.iterdir() if d.is_dir() and (d / "SKILL.md").exists()])

def validate_skill_references(content, filepath, all_skills):
    """Validate references to other skills."""
    errors = []
    # Find references like `skill-name` or `skill-name` skill
    skill_refs = re.findall(r'`([a-z][a-z0-9-]*)`\s+skill', content, re.IGNORECASE)
    skill_refs += re.findall(r'`([a-z][a-z0-9-]*)`', content)
    
    for ref in skill_refs:
        if ref in all_skills:
            continue
        # Check if it's a known external reference
        known_external = [
            'gitleaks', 'trufflehog', 'osv-scanner', 'semgrep', 'checkov',
            'hadolint', 'renovate', 'dependabot', 'detect-secrets', 'syft',
            'cyclonedx', 'spdx', 'sigstore', 'cosign', 'bfg', 'git-filter-repo',
            # Common CLI tools
            'git', 'find', 'glob', 'npm', 'pnpm', 'yarn', 'pip', 'uv', 'cargo', 'go', 'mvn', 'gradle',
            'make', 'just', 'task', 'python', 'node', 'rust', 'java', 'ruby', 'php',
            'pytest', 'jest', 'vitest', 'ruff', 'black', 'mypy', 'eslint', 'prettier',
            'yamllint', 'jsonlint', 'jq', 'taplo', 'dotenv-linter', 'shellcheck',
            'kubeval', 'kubeconform', 'actionlint', 'ggshield',
            # Package names (common examples)
            'lodash', 'express', 'requests', 'fastapi', 'react', 'django', 'spring',
            'legacy-parser', 'event-stream', 'useful-lib', 'old-lib', 'active-package',
            'stale-package', 'archived-package', 'reqeusts', 'brand-new-package',
            'gpl-library', 'apache-library', 'agpl-service', 'underscore', 'ramda',
            'package-requiring-py311', 'some-package',
            # npm scripts/lifecycle
            'preinstall', 'postinstall', 'clean', 'test', 'build', 'lint', 'db:migrate',
            'db:rollback', 'down', 'truncate', 'drop', 'destroy', 'rm',
            # CI tools
            'act', 'gitlab-ci-local',
            # Linting tools
            'markdownlint-cli',
            # Additional CLI tools referenced in skills
            'pip-audit', 'govulncheck', 'license-checker', 'pip-licenses', 'go-licenses', 'cargo-license',
            'depcheck', 'unused', 'cargo-udeps', 'toml', 'scripts', 'justfile',
            'example', 'dummy', 'fake',
            'planning-and-task-breakdown',
        ]
        if ref in known_external:
            continue
        errors.append(f"{filepath}: Unknown skill reference: `{ref}`")
    return errors

def validate_file_references(content, filepath):
    """Validate references to local files."""
    errors = []
    # Find markdown links
    links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', content)
    for text, link in links:
        if link.startswith('http') or link.startswith('#') or link.startswith('mailto:'):
            continue
        # Resolve relative to skill directory
        skill_dir = filepath.parent
        target = (skill_dir / link).resolve()
        if not target.exists():
            # Check if it's in root references
            root_target = (ROOT_DIR / "references" / link).resolve()
            if not root_target.exists():
                errors.append(f"{filepath}: Broken file reference: {link} (from '{text}')")
    return errors

def validate_url_references(content, filepath):
    """Validate URL references (basic format check)."""
    warnings = []
    urls = re.findall(r'https?://[^\s\)]+', content)
    for url in urls:
        # Basic validation - just check format
        if not re.match(r'^https?://[a-zA-Z0-9.-]+', url):
            warnings.append(f"{filepath}: Suspicious URL format: {url}")
    return warnings

def main():
    all_skills = get_all_skills()
    print(f"Found {len(all_skills)} skills: {', '.join(all_skills)}")
    
    errors = []
    warnings = []
    
    skill_dirs = sorted([d for d in SKILLS_DIR.iterdir() if d.is_dir()])
    
    for skill_dir in skill_dirs:
        skill_file = skill_dir / "SKILL.md"
        if not skill_file.exists():
            continue
        
        content = skill_file.read_text(encoding='utf-8')
        
        # Validate skill references
        skill_errors = validate_skill_references(content, skill_file, all_skills)
        errors.extend(skill_errors)
        
        # Validate file references
        file_errors = validate_file_references(content, skill_file)
        errors.extend(file_errors)
        
        # Validate URLs
        url_warnings = validate_url_references(content, skill_file)
        warnings.extend(url_warnings)
    
    if errors:
        print("CROSS-REFERENCE ERRORS:")
        for err in errors:
            print(f"  ❌ {err}")
    
    if warnings:
        print("\nWARNINGS:")
        for warn in warnings:
            print(f"  ⚠️ {warn}")
    
    if not errors and not warnings:
        print("✅ All cross-references valid!")
    
    return 1 if errors else 0

if __name__ == "__main__":
    sys.exit(main())