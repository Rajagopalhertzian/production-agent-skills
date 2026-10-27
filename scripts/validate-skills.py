#!/usr/bin/env python3
"""
Validate all SKILL.md files in the repository.
Checks frontmatter, required sections, and structure.
"""

import os
import sys
import yaml
import re
from pathlib import Path

SKILLS_DIR = Path("skills")
REQUIRED_SECTIONS = [
    "Overview",
    "Scope",
    "When to Use",
    "Prerequisites",
    "Workflow",
    "Safety Constraints",
    "Error Handling",
    "Verification",
    "Reporting Format",
    "Common Rationalizations",
    "Red Flags",
    "Known Limitations",
    "References"
]

def validate_frontmatter(content, filepath):
    """Validate YAML frontmatter."""
    if not content.startswith('---'):
        return False, f"{filepath}: Missing frontmatter delimiter"
    
    try:
        # Extract frontmatter
        end_idx = content.index('---', 3)
        fm_content = content[3:end_idx].strip()
        fm = yaml.safe_load(fm_content)
    except (ValueError, yaml.YAMLError) as e:
        return False, f"{filepath}: Invalid frontmatter YAML: {e}"
    
    # Required fields
    required_fields = ['name', 'description', 'license', 'allowed-tools', 'compatibility']
    for field in required_fields:
        if field not in fm:
            return False, f"{filepath}: Missing required frontmatter field: {field}"
    
    # Validate name format
    name = fm['name']
    if not re.match(r'^[a-z][a-z0-9-]*$', name):
        return False, f"{filepath}: Invalid name format (must be lowercase-hyphen-separated): {name}"
    
    # Validate description has "Use when"
    desc = fm['description']
    if 'Use when' not in desc and 'use when' not in desc:
        return False, f"{filepath}: Description must include 'Use when' trigger conditions"
    
    # Validate license
    if fm['license'] != 'MIT':
        return False, f"{filepath}: License must be MIT"
    
    # Validate compatibility
    compat = fm['compatibility']
    expected = ['claude-code', 'openai-codex', 'cursor', 'generic']
    for agent in expected:
        if agent not in compat:
            return False, f"{filepath}: Missing compatibility entry: {agent}"
    
    return True, None

def validate_sections(content, filepath):
    """Validate all required sections present."""
    errors = []
    for section in REQUIRED_SECTIONS:
        # Check for ## Section or # Section (case insensitive)
        pattern = rf'^#+\s+{re.escape(section)}\b'
        if not re.search(pattern, content, re.MULTILINE | re.IGNORECASE):
            errors.append(f"{filepath}: Missing required section: {section}")
    return errors

def validate_cross_references(content, filepath):
    """Validate referenced files exist."""
    errors = []
    # Find markdown links to local files
    links = re.findall(r'\[([^\]]+)\]\(([^)]+\.md)\)', content)
    for text, link in links:
        if link.startswith('http') or link.startswith('#'):
            continue
        # Resolve relative to skill directory
        skill_dir = filepath.parent
        target = (skill_dir / link).resolve()
        if not target.exists():
            errors.append(f"{filepath}: Broken reference: {link} (referenced as '{text}')")
    return errors

def validate_json_examples(content, filepath):
    """Validate JSON code blocks parse correctly."""
    errors = []
    # Find JSON code blocks
    json_blocks = re.findall(r'```json\n(.*?)\n```', content, re.DOTALL)
    for i, block in enumerate(json_blocks):
        try:
            import json
            json.loads(block)
        except json.JSONDecodeError as e:
            errors.append(f"{filepath}: JSON example #{i+1} invalid: {e}")
    return errors

def main():
    errors = []
    warnings = []
    
    skill_dirs = sorted([d for d in SKILLS_DIR.iterdir() if d.is_dir()])
    
    if not skill_dirs:
        print("No skill directories found!")
        return 1
    
    for skill_dir in skill_dirs:
        skill_file = skill_dir / "SKILL.md"
        if not skill_file.exists():
            errors.append(f"{skill_dir}: Missing SKILL.md")
            continue
        
        content = skill_file.read_text(encoding='utf-8')
        
        # Validate frontmatter
        ok, err = validate_frontmatter(content, skill_file)
        if not ok:
            errors.append(err)
        
        # Validate sections
        section_errors = validate_sections(content, skill_file)
        errors.extend(section_errors)
        
        # Validate cross-references
        ref_errors = validate_cross_references(content, skill_file)
        errors.extend(ref_errors)
        
        # Validate JSON examples
        json_errors = validate_json_examples(content, skill_file)
        errors.extend(json_errors)
        
        # Check name matches directory
        fm_match = re.search(r'name:\s*([a-z0-9-]+)', content)
        if fm_match:
            fm_name = fm_match.group(1)
            dir_name = skill_dir.name
            if fm_name != dir_name:
                errors.append(f"{skill_file}: Frontmatter name '{fm_name}' != directory name '{dir_name}'")
    
    # Report
    if errors:
        print("VALIDATION ERRORS:")
        for err in errors:
            print(f"  ❌ {err}")
    else:
        print("✅ All skills validated successfully!")
    
    if warnings:
        print("\nWARNINGS:")
        for warn in warnings:
            print(f"  ⚠️ {warn}")
    
    return 1 if errors else 0

if __name__ == "__main__":
    sys.exit(main())