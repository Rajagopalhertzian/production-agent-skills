#!/usr/bin/env python3
"""
Validate test fixtures exist and have correct format.
"""

import os
import sys
from pathlib import Path

SKILLS_DIR = Path("skills")
TESTS_DIR = Path("tests")

REQUIRED_CATEGORIES = [
    "positive",
    "negative", 
    "edge",
    "missing-tool",
    "insufficient-evidence",
    "safety"
]

def main():
    errors = []
    warnings = []
    
    skill_dirs = sorted([d for d in SKILLS_DIR.iterdir() if d.is_dir()])
    
    for skill_dir in skill_dirs:
        skill_name = skill_dir.name
        test_dir = TESTS_DIR / skill_name
        
        if not test_dir.exists():
            errors.append(f"{skill_name}: Missing test directory")
            continue
        
        fixtures_file = test_dir / "FIXTURES.md"
        if not fixtures_file.exists():
            errors.append(f"{skill_name}: Missing FIXTURES.md")
            continue
        
        content = fixtures_file.read_text(encoding='utf-8')
        
        # Check for required categories
        for category in REQUIRED_CATEGORIES:
            # Look for category header or mention
            patterns = [
                rf'#{1,3}\s+Fixture\s+\d+:\s+.*{category}',
                rf'{category}\s+(case|test)',
                rf'###\s+{category}',
            ]
            found = False
            for pattern in patterns:
                if re.search(pattern, content, re.IGNORECASE):
                    found = True
                    break
            
            if not found:
                warnings.append(f"{skill_name}: May be missing {category} test case")
        
        # Check for synthetic data notice
        if 'synthetic' not in content.lower() and 'fake' not in content.lower() and 'test_' not in content.lower():
            warnings.append(f"{skill_name}: No indication of synthetic/fake test data")
        
        # Check for expected behavior section
        if 'Expected Behavior' not in content and 'expected behavior' not in content.lower():
            warnings.append(f"{skill_name}: No 'Expected Behavior' sections in fixtures")
    
    if errors:
        print("FIXTURE ERRORS:")
        for err in errors:
            print(f"  ❌ {err}")
    
    if warnings:
        print("WARNINGS:")
        for warn in warnings:
            print(f"  ⚠️ {warn}")
    
    if not errors and not warnings:
        print("✅ All test fixtures validated!")
    
    return 1 if errors else 0

if __name__ == "__main__":
    import re
    sys.exit(main())