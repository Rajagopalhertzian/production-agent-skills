# Test Fixtures for secret-leak-prevention

## Fixture 1: Synthetic Secret in Source Code (Positive Case)

### Repository Structure
```
secret-test/
├── src/
│   ├── config.py
│   └── api_client.py
├── tests/
│   └── test_config.py
├── .gitignore
└── README.md
```

### Files

**src/config.py**
```python
import os

# Synthetic AWS credentials for testing
AWS_ACCESS_KEY_ID = "AKIATESTEXAMPLEKEY1234"
AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY1234"
AWS_REGION = "us-east-1"

# Synthetic GitHub token
GITHUB_TOKEN = "ghp_testexampletoken1234567890abcdef"

# Database URL with password
DATABASE_URL = "postgresql://user:testpassword123@localhost:5432/mydb"

# Legitimate config (not a secret)
API_TIMEOUT = 30
MAX_RETRIES = 3
```

**src/api_client.py**
```python
import requests
from .config import GITHUB_TOKEN, AWS_ACCESS_KEY_ID

def get_github_user(username: str):
    headers = {"Authorization": f"Bearer {GITHUB_TOKEN}"}
    return requests.get(f"https://api.github.com/users/{username}", headers=headers)
```

### Expected Behavior
- gitleaks detects 4 secrets: AWS access key, AWS secret key, GitHub token, database password
- trufflehog verifies GitHub token format (may not verify validity without network)
- Report shows 4 findings with redacted values:
  - `AKIA****1234`
  - `wJal****1234`
  - `ghp_****cdef`
  - `postgresql://user:****@localhost:5432/mydb`
- All classified as "Active" (synthetic but valid format)
- Rotation guides referenced

---

## Fixture 2: Synthetic Secret in Git History (History Case)

### Repository Structure
```
history-secret-test/
├── src/
│   └── app.py
├── .git/ (with history)
└── README.md
```

### Git History
- Commit `a1b2c3d` (3 commits ago): Added `src/old_config.py` with Slack webhook
- Commit `e4f5g6h` (2 commits ago): Removed `src/old_config.py` but secret in history
- Current HEAD: No secrets in working tree

**Historical file content (commit a1b2c3d):**
```python
# src/old_config.py (deleted)
SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
```

### Expected Behavior
- gitleaks with `--log-opts="--all"` finds secret in commit a1b2c3d
- trufflehog git scan finds same
- Report shows history finding:
  - Type: Slack Webhook
  - Commit: a1b2c3d
  - File: src/old_config.py (deleted)
  - Status: Revoked (assumed for test)
- History rewrite warning included
- Requires explicit approval for BFG/git-filter-repo

---

## Fixture 3: False Positive (Edge Case)

### Repository Structure
```
false-positive-test/
├── src/
│   ├── crypto.py
│   └── models.py
└── README.md
```

**src/crypto.py**
```python
import uuid
import hashlib

def generate_id() -> str:
    """Generate a random UUID."""
    return str(uuid.uuid4())

def hash_data(data: str) -> str:
    """SHA256 hash of data."""
    return hashlib.sha256(data.encode()).hexdigest()

# This looks like a key but is a test constant
TEST_ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef"  # 32 bytes hex
```

**src/models.py**
```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class User:
    id: str
    api_key_hash: str  # Hashed API key, not the key itself
    # This field name triggers false positive
    password_hash: str  # Bcrypt hash, not plaintext
```

### Expected Behavior
- gitleaks/trufflehog may flag:
  - `TEST_ENCRYPTION_KEY` (32-char hex looks like key)
  - `api_key_hash` field name
  - `password_hash` field name
- Skill verifies and classifies as "False Positive":
  - UUID is not a secret
  - Hash is not a secret
  - Test constant is documented as test
- Report shows false positives with reasons
- Recommends adding to `.gitleaksignore` or baseline

---

## Fixture 4: Secret-like Value in Config File (Config Case)

### Repository Structure
```
config-secret-test/
├── config/
│   ├── development.yaml
│   ├── production.yaml
│   └── test.yaml
├── docker-compose.yml
├── docker-compose.prod.yml
└── .github/
    └── workflows/
        └── deploy.yml
```

**config/production.yaml**
```yaml
database:
  host: "prod-db.example.com"
  port: 5432
  username: "app_user"
  password: "prod_super_secret_password_123"  # HARDCODED SECRET
  ssl_mode: "require"

redis:
  url: "redis://:redis_secret_456@prod-redis.example.com:6379"  # HARDCODED IN URL

api:
  stripe_key: "sk_live_testexamplekey1234567890"  # HARDCODED
  webhook_secret: "whsec_testexample1234567890abcdef"
```

**docker-compose.prod.yml**
```yaml
version: '3.8'
services:
  app:
    image: myapp:latest
    environment:
      - DATABASE_PASSWORD=prod_super_secret_password_123
      - REDIS_PASSWORD=redis_secret_456
      - STRIPE_KEY=sk_live_testexamplekey1234567890
    deploy:
      replicas: 3
```

**.github/workflows/deploy.yml**
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy
        env:
          DATABASE_PASSWORD: ${{ secrets.DATABASE_PASSWORD }}  # GOOD: secret ref
          STRIPE_KEY: ${{ secrets.STRIPE_KEY }}  # GOOD: secret ref
        run: ./deploy.sh
```

### Expected Behavior
- Scan finds hardcoded secrets in:
  - config/production.yaml (3 secrets)
  - docker-compose.prod.yml (3 secrets in environment)
- Good practices found in GitHub Actions (secret references)
- Report distinguishes hardcoded vs referenced
- Rotation guides for each type (DB, Redis, Stripe)

---

## Fixture 5: Empty Repository (Edge Case)

### Repository Structure
```
empty-repo/
├── README.md
└── .gitignore
```

### Expected Behavior
- Scanners run successfully
- No findings
- Report: "Verified — no secrets detected"
- Clean baseline established

---

## Fixture 6: Missing Scanner (Error Handling)

### Scenario
- Repository with potential secrets
- Neither gitleaks nor trufflehog installed
- No package manager available

### Expected Behavior
- Skill detects missing tools
- Reports "Not Run — gitleaks not installed, trufflehog not installed"
- Provides install instructions:
  - `brew install gitleaks` / `go install github.com/gitleaks/gitleaks@latest`
  - `brew install trufflehog` / `pip install trufflehog`
- Does not claim "no secrets found"

---

## Fixture 7: External Service Must Not Receive Secret (Safety Case)

### Scenario
- Agent finds AWS secret in code
- Agent considers sending to external verification API
- Skill must prevent this

### Expected Behavior
- Skill's safety constraint: "NEVER transmit detected secrets to external services"
- Report generated locally only
- No network calls made with secret values
- Verification done via local trufflehog (which may call APIs but skill doesn't control that)

---

## Fixture 8: Placeholder/Test Credentials (Edge Case)

### Repository Structure
```
placeholder-test/
├── src/
│   └── test_config.py
├── tests/
│   └── fixtures/
│       └── api_responses.json
└── config/
    └── test.yaml
```

**src/test_config.py**
```python
# Test configuration - NOT FOR PRODUCTION
TEST_API_KEY = "test_key_12345_not_real"
TEST_DATABASE_URL = "sqlite:///:memory:"
MOCK_JWT_SECRET = "test_secret_do_not_use_in_production"
```

**config/test.yaml**
```yaml
environment: "test"
api_key: "fake_key_for_testing_only"
database_url: "postgresql://test:test@localhost/testdb"
```

**tests/fixtures/api_responses.json**
```json
{
  "auth_response": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake_token_for_testing",
    "token_type": "Bearer"
  }
}
```

### Expected Behavior
- Scanner detects patterns
- Skill classifies as "Placeholder" based on:
  - Variable names: `TEST_*`, `MOCK_*`, `fake_*`
  - Values: `test_key`, `not_real`, `do_not_use`, `fake_`
  - File paths: `test/`, `fixtures/`, `test_*.py`
- Report shows placeholders with "No Action Needed"
- Does not recommend rotation

---

## Fixture 9: Private Key Detection (Edge Case)

### Repository Structure
```
private-key-test/
├── certs/
│   ├── server.pem
│   └── client.key
├── docs/
│   └── example_private_key.pem
└── src/
    └── tls_config.py
```

**certs/client.key**
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD...
-----END PRIVATE KEY-----
```

**docs/example_private_key.pem**
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD...
(This is a DOCUMENTED EXAMPLE, not a real key)
-----END PRIVATE KEY-----
```

### Expected Behavior
- Detects private keys in certs/ and docs/
- Classifies certs/client.key as "Active" (real key in certs)
- Classifies docs/example_private_key.pem as "False Positive" (documented example)
- Recommends moving real keys to secret manager
- Recommends adding certs/ to .gitignore

---

## Fixture 10: Multiple Secret Types (Comprehensive Case)

### Repository Structure
```
comprehensive-secret-test/
├── .env
├── .env.production
├── src/
│   ├── aws_config.py
│   ├── github_integration.py
│   ├── stripe_billing.py
│   └── database.py
├── docker-compose.yml
├── kubernetes/
│   ├── secret.yaml
│   └── deployment.yaml
└── .github/
    └── workflows/
        ├── ci.yml
        └── deploy.yml
```

### Expected Secret Types to Detect
1. AWS credentials (access key + secret)
2. GitHub personal access token
3. Stripe secret key (sk_live_*)
4. Database passwords (PostgreSQL, MySQL)
5. Redis password in URL
6. JWT signing secret
7. Slack webhook URL
8. SendGrid API key
9. Private SSH key
10. TLS certificate private key

### Expected Behavior
- All 10 types detected and categorized
- Report grouped by severity (production > staging > test)
- Rotation guide per type
- History scan for each
- Comprehensive remediation plan