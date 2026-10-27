# Test Fixtures for verify-before-finish

## Fixture 1: All Tests Pass (Positive Case)

### Repository Structure
```
test-repo/
├── src/
│   └── calculator.py
├── tests/
│   └── test_calculator.py
├── pyproject.toml
└── README.md
```

### Files

**pyproject.toml**
```toml
[project]
name = "test-calculator"
version = "0.1.0"
dependencies = []

[tool.pytest.ini_options]
testpaths = ["tests"]
```

**src/calculator.py**
```python
def add(a: int, b: int) -> int:
    return a + b

def multiply(a: int, b: int) -> int:
    return a * b
```

**tests/test_calculator.py**
```python
from src.calculator import add, multiply

def test_add():
    assert add(2, 3) == 5
    assert add(-1, 1) == 0
    assert add(0, 0) == 0

def test_multiply():
    assert multiply(3, 4) == 12
    assert multiply(-2, 3) == -6
    assert multiply(0, 5) == 0
```

### Expected Behavior
- Skill runs `pytest` and inspects output
- All 6 tests pass
- Report shows "Verified" for test suite
- Overall status: "Verified"

---

## Fixture 2: One Test Fails (Negative Case)

### Files (same structure, modified test)

**tests/test_calculator.py**
```python
from src.calculator import add, multiply

def test_add():
    assert add(2, 3) == 5
    assert add(-1, 1) == 0
    assert add(0, 0) == 0

def test_multiply():
    assert multiply(3, 4) == 12
    assert multiply(-2, 3) == -6
    assert multiply(0, 5) == 1  # BUG: should be 0
```

### Expected Behavior
- Skill runs `pytest` and inspects output
- 1 test fails (multiply(0, 5) == 1)
- Report shows "Failed" for test suite with failure details
- Overall status: "Failed"

---

## Fixture 3: Tests Cannot Run (Missing Tool)

### Repository Structure (no pyproject.toml, no pytest installed)
```
test-repo/
├── src/
│   └── calculator.py
└── tests/
    └── test_calculator.py
```

### Expected Behavior
- Skill detects pytest not available
- Reports "Not Run — pytest not installed"
- Does not claim tests pass
- Overall status: "Partially Verified" (other checks may pass)

---

## Fixture 4: No Tests Exist

### Repository Structure
```
test-repo/
├── src/
│   └── calculator.py
└── README.md
```

### Expected Behavior
- Skill detects no test files
- Reports "Not Run — no test files found"
- Does not claim "all tests pass"
- Overall status: "Partially Verified"

---

## Fixture 5: Agent Claims Completion Without Evidence

### Scenario
- Agent modifies `src/calculator.py` to add `divide` function
- Agent says "done, tests pass" but doesn't run tests
- No test for divide function exists

### Expected Behavior
- Skill checks git diff for new function
- Finds no corresponding test
- Reports "Failed — new function 'divide' has no test"
- Flags assumption that tests pass without evidence

---

## Fixture 6: Unrelated Files Changed

### Scenario
- Task: Add `subtract` function to calculator
- Agent also modifies `README.md` and `config/unrelated.yaml`

### Expected Behavior
- Skill runs `git diff --stat`
- Detects `config/unrelated.yaml` as unexpected
- Reports "Warning — unrelated changes detected: config/unrelated.yaml"
- Requires explanation or revert

---

## Fixture 7: Behavior Still Broken

### Scenario
- Bug report: `add(2, 3)` returns 6 (should be 5)
- Agent "fixes" by changing test to expect 6
- Source code still broken

### Expected Behavior
- Skill runs tests — they pass (because test was changed)
- Skill inspects source — `add(2, 3)` still returns 6
- Reports "Failed — source code still has bug, test was modified to match"
- Flags test modification as rationalization

---

## Fixture 8: Build Fails

### Repository Structure
```
test-repo/
├── src/
│   └── main.rs
├── Cargo.toml
└── tests/
    └── integration_test.rs
```

**Cargo.toml**
```toml
[package]
name = "test-rust"
version = "0.1.0"
edition = "2021"

[dependencies]
```

**src/main.rs**
```rust
fn main() {
    println!("Hello, world!");
    let x = 5;
    let y = x + ; // SYNTAX ERROR
}
```

### Expected Behavior
- Skill runs `cargo build`
- Build fails with syntax error
- Reports "Failed — build error: expected expression"
- Does not proceed to test verification

---

## Fixture 9: Assumptions Not Verified

### Scenario
- Task: Implement API client
- Agent assumes API returns JSON
- Agent assumes API uses Bearer token auth
- No integration test exists

### Expected Behavior
- Skill identifies assumptions from implementation
- Reports assumptions with "Unknown" status
- "API returns JSON — Unknown (no integration test)"
- "API uses Bearer token — Unknown (no auth test)"
- Recommends integration test for verification

---

## Fixture 10: Missing Acceptance Criteria

### Scenario
- Task: "Make the calculator faster"
- No specific performance targets
- No baseline measurements

### Expected Behavior
- Skill reports "Unknown — no acceptance criteria provided"
- Asks for specific criteria (e.g., "add() < 1ms for 1000 ops")
- Cannot verify completion without criteria