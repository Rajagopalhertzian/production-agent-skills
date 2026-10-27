# Test Fixtures for universal-project-builder

## Fixture 1: New API Service (Positive Case)

### Requirements
```
Build a REST API service for a task management system with:
- CRUD operations for tasks (title, description, status, priority, due_date)
- User authentication (JWT)
- PostgreSQL database
- Input validation
- OpenAPI documentation
- Unit and integration tests
- Docker support
```

### Expected Workflow
1. **Clarify Requirements** → SPEC.md with 8 functional requirements
2. **Classify Project Type** → API Service (REST)
3. **Select Toolchain** → Python 3.11, FastAPI, SQLAlchemy, pytest, ruff, black, mypy
4. **Initialize Project** → Scaffold with proper structure
5. **Task Breakdown** → 6 tasks with acceptance criteria
6. **Incremental Implementation** → Each task verified
7. **Final Verification** → verify-before-finish passes

### Expected Project Structure
```
task-api/
├── SPEC.md
├── tasks/
│   ├── plan.md
│   └── todo.md
├── pyproject.toml
├── README.md
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── src/
│   └── task_api/
│       ├── __init__.py
│       ├── main.py
│       ├── config.py
│       ├── models/
│       │   ├── __init__.py
│       │   └── task.py
│       ├── schemas/
│       │   ├── __init__.py
│       │   └── task.py
│       ├── api/
│       │   ├── __init__.py
│       │   ├── routes/
│       │   │   ├── __init__.py
│       │   │   └── tasks.py
│       │   └── deps.py
│       ├── services/
│       │   ├── __init__.py
│       │   └── task_service.py
│       └── database.py
├── tests/
│   ├── __init__.py
│   ├── unit/
│   │   ├── test_schemas.py
│   │   └── test_service.py
│   └── integration/
│       ├── test_api.py
│       └── conftest.py
└── alembic/
    ├── env.py
    └── versions/
```

### Verification Checkpoints
- [ ] SPEC.md exists with clear requirements
- [ ] pyproject.toml has correct dependencies
- [ ] Dockerfile builds successfully
- [ ] All unit tests pass (pytest tests/unit)
- [ ] All integration tests pass (pytest tests/integration)
- [ ] Lint clean (ruff check .)
- [ ] Format clean (black --check .)
- [ ] Type check clean (mypy src/)
- [ ] OpenAPI docs accessible at /docs
- [ ] verify-before-finish reports Verified

---

## Fixture 2: New CLI Tool (Positive Case)

### Requirements
```
Build a CLI tool for converting CSV files to JSON with:
- Input: CSV file path or stdin
- Output: JSON file path or stdout
- Options: delimiter, header handling, pretty print
- Streaming for large files
- Progress indicator
- Cross-platform (Windows, macOS, Linux)
```

### Expected Workflow
1. **Clarify Requirements** → SPEC.md with 6 functional requirements
2. **Classify Project Type** → CLI Tool
3. **Select Toolchain** → Go 1.22, Cobra CLI, standard library
4. **Initialize Project** → Go module with Cobra scaffold
5. **Task Breakdown** → 5 tasks
6. **Implementation** → Each task verified
7. **Final Verification** → verify-before-finish passes

### Expected Project Structure
```
csv2json/
├── SPEC.md
├── tasks/
│   ├── plan.md
│   └── todo.md
├── go.mod
├── go.sum
├── README.md
├── Dockerfile
├── .goreleaser.yml
├── cmd/
│   └── root.go
├── internal/
│   ├── converter/
│   │   ├── converter.go
│   │   └── converter_test.go
│   └── csv/
│       ├── reader.go
│       └── reader_test.go
├── pkg/
│   └── progress/
│       └── progress.go
└── tests/
    └── integration_test.go
```

### Verification Checkpoints
- [ ] SPEC.md exists
- [ ] go mod tidy works
- [ ] go build produces binary
- [ ] Unit tests pass (go test ./...)
- [ ] Integration tests pass
- [ ] Cross-compile works (GOOS=windows GOARCH=amd64)
- [ ] goreleaser config valid
- [ ] verify-before-finish reports Verified

---

## Fixture 3: New Web Application (Positive Case)

### Requirements
```
Build a simple dashboard web app with:
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS
- Pages: Dashboard, Settings, Profile
- Mock API integration
- Unit tests with Vitest
- E2E tests with Playwright
- CI/CD with GitHub Actions
```

### Expected Workflow
1. **Clarify Requirements** → SPEC.md
2. **Classify Project Type** → Web Application
3. **Select Toolchain** → Node 20, pnpm, React, TypeScript, Vite, Tailwind
4. **Initialize Project** → Vite + React + TS template
5. **Task Breakdown** → 7 tasks
6. **Implementation** → Each task verified
7. **Final Verification** → verify-before-finish passes

### Expected Project Structure
```
dashboard-app/
├── SPEC.md
├── tasks/
│   ├── plan.md
│   └── todo.md
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── README.md
├── Dockerfile
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci.yml
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Settings.tsx
│   │   └── Profile.tsx
│   ├── components/
│   │   ├── Layout.tsx
│   │   └── ui/
│   ├── hooks/
│   ├── services/
│   │   └── api.ts
│   └── styles/
│       └── globals.css
├── tests/
│   ├── unit/
│   └── e2e/
└── playwright.config.ts
```

### Verification Checkpoints
- [ ] pnpm install works
- [ ] pnpm build succeeds
- [ ] pnpm test (vitest) passes
- [ ] pnpm test:e2e (playwright) passes
- [ ] pnpm lint passes
- [ ] Docker build works
- [ ] verify-before-finish reports Verified

---

## Fixture 4: Requirements Unclear (Error Handling)

### Scenario
User says: "Build me a thing that does stuff with data"

### Expected Behavior
- Skill asks clarifying questions:
  1. What problem does this solve?
  2. Who are the users?
  3. What are the functional requirements?
  4. What is the target environment?
  5. Any language/framework constraints?
- Does NOT start implementation
- Waits for specific answers
- Creates SPEC.md only after clarity achieved

---

## Fixture 5: Template Not Found (Edge Case)

### Scenario
Project type: "Quantum Computing Simulator" (no template exists)

### Expected Behavior
- Skill detects no matching template
- Generates minimal scaffold from scratch:
  - Basic directory structure
  - Language-appropriate build files
  - Placeholder main entry point
  - Basic test structure
- Documents that template was generated, not selected
- Proceeds with task breakdown

---

## Fixture 6: Toolchain Not Available (Error Handling)

### Scenario
Selected: Python 3.11 + FastAPI
Environment: Only Python 3.9 available, no uv/pip

### Expected Behavior
- Skill detects Python version mismatch
- Reports "Failed — Python 3.9 does not satisfy >=3.11"
- Suggests: Install Python 3.11, or use Python 3.9 compatible framework
- Does not proceed with incompatible toolchain

---

## Fixture 7: Task Verification Fails (Negative Case)

### Scenario
Task 3: "Implement task creation API"
Implementation: Creates endpoint but validation fails
Test: Returns 500 instead of 422 for invalid input

### Expected Behavior
- Skill runs task verification (pytest tests/integration/test_tasks.py::test_create_invalid)
- Test fails
- Skill reports "Failed — validation not working, returns 500"
- Stops; does not proceed to Task 4
- Requires fix before continuing

---

## Fixture 8: Dependency Risk High (Safety Case)

### Scenario
Task 2: "Add authentication"
Agent proposes adding unknown package "super-auth-lib@0.0.1"

### Expected Behavior
- Skill runs dependency-risk-assessment on new dependency
- Finds: No advisory data, unmaintained, no license, typosquat risk
- Reports "High Risk — super-auth-lib has no track record"
- Requires human approval before adding
- Does not silently add dependency

---

## Fixture 9: Cross-Skill Integration (Integration Case)

### Scenario
Building API service with:
- repository-onboarding (if existing repo)
- verify-before-finish (each task)
- dependency-risk-assessment (new deps)
- environment-config-safety (Docker, env config)
- secret-leak-prevention (before commit)

### Expected Behavior
- Skill explicitly calls/invokes other skills at checkpoints
- Each integration point documented in task plan
- Final verify-before-finish runs all sub-skill checks
- Report references sub-skill results

---

## Fixture 10: Simple Script (Minimal Case)

### Requirements
```
Build a Python script that:
- Reads a JSON file
- Filters objects by a field value
- Writes filtered results to new JSON file
- Takes input/output paths as CLI args
```

### Expected Workflow
1. **Clarify Requirements** → SPEC.md (lightweight)
2. **Classify Project Type** → Script/Automation
3. **Select Toolchain** → Python 3.11, stdlib only (argparse, json)
4. **Initialize Project** → Single file or minimal package
5. **Task Breakdown** → 2-3 tasks
6. **Implementation** → Quick verification
7. **Final Verification** → verify-before-finish (light)

### Expected Project Structure
```
json-filter/
├── SPEC.md
├── pyproject.toml (minimal)
├── README.md
├── src/
│   └── json_filter/
│       ├── __init__.py
│       ├── main.py
│       └── filter.py
├── tests/
│   └── test_filter.py
└── scripts/
    └── run_example.sh
```

### Verification Checkpoints
- [ ] Script runs with --help
- [ ] Unit tests pass
- [ ] Example script works
- [ ] No unnecessary dependencies
- [ ] verify-before-finish reports Verified