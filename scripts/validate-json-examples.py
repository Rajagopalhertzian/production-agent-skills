#!/usr/bin/env python3
"""
Validate JSON examples in SKILL.md files against schemas.
"""

import os
import sys
import json
import re
from pathlib import Path

SKILLS_DIR = Path("skills")

def extract_json_examples(content):
    """Extract JSON code blocks from markdown."""
    examples = []
    # Find ```json ... ``` blocks
    blocks = re.findall(r'```json\n(.*?)\n```', content, re.DOTALL)
    for block in blocks:
        try:
            examples.append(json.loads(block))
        except json.JSONDecodeError:
            pass  # Skip invalid JSON
    return examples

def validate_against_schema(data, schema_path):
    """Validate JSON against schema if schema exists."""
    if not schema_path.exists():
        return True, None
    try:
        import jsonschema
        schema = json.loads(schema_path.read_text())
        jsonschema.validate(data, schema)
        return True, None
    except jsonschema.ValidationError as e:
        return False, str(e)
    except Exception as e:
        return False, f"Schema validation error: {e}"

def main():
    errors = []
    
    skill_dirs = sorted([d for d in SKILLS_DIR.iterdir() if d.is_dir()])
    
    for skill_dir in skill_dirs:
        skill_file = skill_dir / "SKILL.md"
        if not skill_file.exists():
            continue
        
        content = skill_file.read_text(encoding='utf-8')
        examples = extract_json_examples(content)
        
        # Check for schema file
        schema_file = skill_dir / "schemas" / f"{skill_dir.name}.schema.json"
        
        for i, example in enumerate(examples):
            ok, err = validate_against_schema(example, schema_file)
            if not ok:
                errors.append(f"{skill_file}: JSON example #{i+1} validation failed: {err}")
    
    if errors:
        print("JSON VALIDATION ERRORS:")
        for err in errors:
            print(f"  ❌ {err}")
        return 1
    else:
        print("✅ All JSON examples valid!")
        return 0

if __name__ == "__main__":
    sys.exit(main())