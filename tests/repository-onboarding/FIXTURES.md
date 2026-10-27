# Test Fixtures for repository-onboarding

## Fixture 1: Simple Repository (Positive Case)

### Repository Structure
```
simple-repo/
├── README.md
├── pyproject.toml
├── src/
│   └── myapp/
│       ├── __init__.py
│       ├── main.py
│       └── utils.py
├── tests/
│   └── test_main.py
└── .github/
    └── workflows/
        └── ci.yml
```

### Files

**README.md**
```markdown
# MyApp

A simple Python application.

## Development

```bash
pip install -e .
pytest
```
```

**pyproject.toml**
```toml
[project]
name = "myapp"
version = "0.1.0"
description = "A simple app"
dependencies = ["click>=8.0", "requests>=2.28"]
requires-python = ">=3.9"

[project.optional-dependencies]
dev = ["pytest>=7.0", "ruff>=0.1"]

[tool.pytest.ini_options]
testpaths = ["tests"]

[tool.ruff]
line-length = 100
```

**src/myapp/main.py**
```python
import click
import requests
from .utils import process_data

@click.command()
@click.argument('url')
def main(url):
    """Fetch and process data from URL."""
    response = requests.get(url)
    result = process_data(response.text)
    click.echo(result)

if __name__ == '__main__':
    main()
```

**src/myapp/utils.py**
```python
def process_data(data: str) -> str:
    return data.upper()
```

**tests/test_main.py**
```python
from myapp.utils import process_data

def test_process_data():
    assert process_data("hello") == "HELLO"
```

**.github/workflows/ci.yml**
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -e ".[dev]"
      - run: pytest
      - run: ruff check .
```

### Expected Behavior
- Skill identifies Python project with Click + Requests
- Discovers entry point: `src/myapp/main.py` (CLI)
- Finds test command: `pytest` (verified)
- Finds lint command: `ruff check .` (verified)
- Maps architecture: CLI app with utils module
- Reports documentation: Good (README has dev instructions)
- No security-sensitive files found
- All findings labeled "Observed"

---

## Fixture 2: Monorepo (Edge Case)

### Repository Structure
```
monorepo/
├── README.md
├── package.json
├── pnpm-workspace.yaml
├── apps/
│   ├── web/
│   │   ├── package.json
│   │   ├── next.config.js
│   │   └── src/
│   │       └── app/
│   │           └── page.tsx
│   └── api/
│       ├── package.json
│       ├── pyproject.toml
│       └── src/
│           └── main.py
├── packages/
│   ├── shared/
│   │   ├── package.json
│   │   └── src/
│   │       └── types.ts
│   └── database/
│       ├── package.json
│       └── prisma/
│           └── schema.prisma
├── turbo.json
└── .github/
    └── workflows/
        └── ci.yml
```

### Key Files

**package.json (root)**
```json
{
  "name": "monorepo",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "db:migrate": "turbo run db:migrate"
  },
  "devDependencies": {
    "turbo": "^2.0"
  },
  "packageManager": "pnpm@9.0"
}
```

**pnpm-workspace.yaml**
```yaml
packages:
  - apps/*
  - packages/*
```

**apps/web/package.json**
```json
{
  "name": "@monorepo/web",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "test": "jest",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "18.3.0",
    "@monorepo/shared": "workspace:*"
  }
}
```

**apps/api/pyproject.toml**
```toml
[project]
name = "api"
dependencies = ["fastapi", "uvicorn", "@monorepo/shared"]
```

### Expected Behavior
- Skill detects monorepo (pnpm workspaces + turbo)
- Identifies multiple project types: Next.js web, FastAPI api, shared types, Prisma database
- Maps module relationships: web → shared, api → shared, api → database
- Entry points: web (Next.js), api (FastAPI), CLI (if any)
- Build/test commands from root package.json (turbo)
- Reports partial discovery (sampled packages)
- Documentation: Partial (root README only)

---

## Fixture 3: Missing Documentation (Negative Case)

### Repository Structure
```
undocumented-repo/
├── src/
│   ├── index.js
│   ├── lib/
│   │   └── helper.js
│   └── config.js
├── package.json
└── .gitignore
```

### Files

**package.json**
```json
{
  "name": "undocumented",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "test": "echo 'no tests'"
  },
  "dependencies": {
    "express": "^4.18"
  }
}
```

**src/index.js**
```javascript
const express = require('express');
const { helper } = require('./lib/helper');
const config = require('./config');

const app = express();
app.get('/', (req, res) => res.send(helper(config.message)));
app.listen(config.port, () => console.log(`Running on ${config.port}`));
```

### Expected Behavior
- Skill finds no README.md, CONTRIBUTING.md, ARCHITECTURE.md
- Reports "Missing — no README/CONTRIBUTING found"
- Discovers Express.js from package.json
- Entry point: src/index.js
- Test command exists but does nothing (`echo 'no tests'`)
- Configuration: config.js with port/message
- Documentation assessment: Poor
- Flags missing docs as uncertainty

---

## Fixture 4: Conflicting Documentation (Edge Case)

### Repository Structure
```
conflicting-docs/
├── README.md
├── CONTRIBUTING.md
├── pyproject.toml
├── Makefile
└── src/
    └── main.py
```

**README.md**
```markdown
# Project

## Development
```bash
pip install -r requirements.txt
python -m pytest tests/
```
```

**CONTRIBUTING.md**
```markdown
# Contributing

## Setup
```bash
poetry install
poetry run pytest
```
```

**pyproject.toml**
```toml
[project]
name = "conflicting"
dependencies = ["requests"]

[tool.poetry]
name = "conflicting"
version = "0.1.0"
dependencies = { python = "^3.10", requests = "^2.28" }

[tool.poetry.group.dev.dependencies]
pytest = "^7.0"

[tool.pytest.ini_options]
testpaths = ["tests"]
```

**Makefile**
```makefile
test:
	python -m pytest tests/ -v

install:
	pip install -e ".[dev]"
```

### Expected Behavior
- Skill detects conflict: README says `pip install -r requirements.txt` + `pytest`
- CONTRIBUTING says `poetry install` + `poetry run pytest`
- pyproject.toml shows Poetry configuration
- Makefile has `make test` and `make install`
- Reports "Conflict — README says pip/pytest, CONTRIBUTING says poetry, Makefile says make"
- Recommends verifying which actually works
- Labels as "Conflict" not "Observed"

---

## Fixture 5: Multiple Application Entry Points (Edge Case)

### Repository Structure
```
multi-entry/
├── pyproject.toml
├── cli.py
├── server.py
├── worker.py
├── scheduler.py
└── src/
    └── shared.py
```

**pyproject.toml**
```toml
[project]
name = "multi-entry"
version = "0.1.0"
dependencies = ["click", "fastapi", "uvicorn", "celery", "apscheduler"]
entry-points = """
[console_scripts]
mycli = cli:main
myserver = server:app
myworker = worker:main
myscheduler = scheduler:main
"""

[tool.pytest.ini_options]
testpaths = ["tests"]
```

### Expected Behavior
- Skill discovers 4 entry points:
  1. CLI: `cli.py` (console script `mycli`)
  2. API Server: `server.py` (FastAPI, console script `myserver`)
  3. Worker: `worker.py` (Celery, console script `myworker`)
  4. Scheduler: `scheduler.py` (APScheduler, console script `myscheduler`)
- Reports all entry points with evidence
- Notes complexity: multiple runtime processes

---

## Fixture 6: Sensitive Configuration Files (Security Case)

### Repository Structure
```
sensitive-config/
├── README.md
├── .env.example
├── .env.local
├── .github/
│   └── workflows/
│       └── deploy.yml
├── docker-compose.yml
├── docker-compose.prod.yml
├── k8s/
│   └── deployment.yaml
└── src/
    └── config.py
```

**Key Findings Expected:**
- `.env.local` — contains hardcoded DATABASE_URL, API_KEY (redacted)
- `.github/workflows/deploy.yml` — references `${{ secrets.* }}`
- `docker-compose.prod.yml` — contains hardcoded passwords (redacted)
- `k8s/deployment.yaml` — references secrets via `secretKeyRef`
- `src/config.py` — uses pydantic-settings with env vars

### Expected Behavior
- Skill inventories all config files
- Flags hardcoded secrets in `.env.local` and `docker-compose.prod.yml`
- Notes secret references in CI/CD and K8s (good practice)
- Reports security findings with redaction
- Does NOT print actual secret values

---

## Fixture 7: Incomplete Environment (Edge Case)

### Repository Structure
```
incomplete-env/
├── README.md
├── go.mod
├── go.sum
├── main.go
├── config.yaml
└── .github/
    └── workflows/
        └── test.yml
```

**go.mod**
```go
module example.com/incomplete

go 1.21

require (
    github.com/gin-gonic/gin v1.9.0
    github.com/spf13/viper v1.18.0
)
```

**config.yaml**
```yaml
database:
  host: localhost
  port: 5432
  name: mydb
```

**main.go**
```go
package main

import (
    "github.com/gin-gonic/gin"
    "github.com/spf13/viper"
)

func main() {
    viper.SetConfigFile("config.yaml")
    viper.ReadInConfig()
    
    r := gin.Default()
    r.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{"status": "ok"})
    })
    r.Run(viper.GetString("server.port")) // PANICS: server.port not in config!
}
```

### Expected Behavior
- Skill discovers Go module with Gin + Viper
- Entry point: main.go
- Config file: config.yaml (missing server.port)
- Build command: `go build` (verified)
- Test command: `go test ./...` (from CI)
- Runtime assumption: server.port in config — NOT FOUND
- Reports assumption mismatch as HIGH risk
- Documentation: Partial (README only)

---

## Fixture 8: No Standard Manifest (Edge Case)

### Repository Structure
```
no-manifest/
├── README.md
├── main.py
├── requirements.txt
├── setup.py
└── tests/
    └── test_main.py
```

**requirements.txt**
```
requests==2.28.0
click==8.1.0
```

**setup.py**
```python
from setuptools import setup, find_packages

setup(
    name="no-manifest",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "requests==2.28.0",
        "click==8.1.0",
    ],
    entry_points={
        "console_scripts": [
            "myapp = main:main",
        ],
    },
)
```

### Expected Behavior
- Skill detects no pyproject.toml, but finds setup.py + requirements.txt (legacy Python)
- Reports "Observed — legacy Python packaging (setup.py + requirements.txt)"
- Identifies entry point from setup.py: `main:main`
- Test command: must infer from CI or try `pytest`
- Recommends migrating to pyproject.toml