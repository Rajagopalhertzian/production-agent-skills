# Test Fixtures for environment-config-safety

## Fixture 1: Missing Required Environment Variable (Negative Case)

### Repository Structure
```
missing-env-test/
├── .env.example
├── .env.development
├── .env.staging
├── .env.production
├── docker-compose.yml
├── docker-compose.prod.yml
├── src/
│   ├── config.py
│   └── app.py
└── .github/
    └── workflows/
        └── deploy.yml
```

### Files

**.env.example**
```env
# Required
DATABASE_URL=
REDIS_URL=
API_KEY=

# Optional
LOG_LEVEL=info
DEBUG=false
```

**.env.development**
```env
DATABASE_URL=postgresql://dev:dev@localhost:5432/devdb
REDIS_URL=redis://localhost:6379
API_KEY=dev_key_123
LOG_LEVEL=debug
DEBUG=true
```

**.env.staging**
```env
DATABASE_URL=postgresql://staging:secret@staging-db:5432/stagingdb
REDIS_URL=redis://staging-redis:6379
API_KEY=${{ secrets.STAGING_API_KEY }}
LOG_LEVEL=info
DEBUG=false
```

**.env.production** (MISSING REDIS_URL)
```env
DATABASE_URL=postgresql://prod:secret@prod-db:5432/proddb
API_KEY=${{ secrets.PROD_API_KEY }}
LOG_LEVEL=warn
DEBUG=false
```

**src/config.py**
```python
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    database_url: str
    redis_url: str
    api_key: str
    log_level: str = "info"
    debug: bool = False
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
```

**src/app.py**
```python
from .config import settings
import redis

def get_redis():
    return redis.from_url(settings.redis_url)
```

### Expected Behavior
- Skill inventories 4 env files + docker-compose + CI/CD
- Required variable check:
  - development: All present ✅
  - staging: All present (API_KEY is secret ref) ✅
  - production: **REDIS_URL MISSING** ❌
- Reports: "HIGH — REDIS_URL missing in production environment"
- Code references `settings.redis_url` — will crash at runtime

---

## Fixture 2: Leaked Synthetic Secret (Security Case)

### Repository Structure
```
leaked-secret-test/
├── .env.production
├── docker-compose.prod.yml
├── kubernetes/
│   └── secret.yaml
├── src/
│   └── config.py
└── .github/
    └── workflows/
        └── deploy.yml
```

**.env.production**
```env
DATABASE_URL=postgresql://admin:SuperSecretProdPassword123!@prod-db:5432/proddb
STRIPE_SECRET_KEY=sk_live_testexamplekey1234567890abcdef
JWT_SECRET=my-super-secret-jwt-signing-key-12345
```

**docker-compose.prod.yml**
```yaml
version: '3.8'
services:
  app:
    image: myapp:latest
    environment:
      - DATABASE_PASSWORD=SuperSecretProdPassword123!
      - STRIPE_KEY=sk_live_testexamplekey1234567890abcdef
      - JWT_SECRET=my-super-secret-jwt-signing-key-12345
    deploy:
      replicas: 3
```

**kubernetes/secret.yaml**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
stringData:
  database-password: "SuperSecretProdPassword123!"
  stripe-key: "sk_live_testexamplekey1234567890abcdef"
  jwt-secret: "my-super-secret-jwt-signing-key-12345"
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
      - name: Deploy to Kubernetes
        env:
          KUBECONFIG: ${{ secrets.KUBECONFIG }}
        run: |
          kubectl apply -f kubernetes/
```

### Expected Behavior
- Secret scan finds hardcoded secrets in:
  - .env.production (3 secrets)
  - docker-compose.prod.yml (3 secrets in environment)
  - kubernetes/secret.yaml (3 secrets in stringData — still hardcoded in Git!)
- Good practice: GitHub Actions uses secret references
- **Critical finding**: Kubernetes secret.yaml commits secrets to Git
- Report shows all with redacted values
- Rotation guides for PostgreSQL, Stripe, JWT

---

## Fixture 3: Invalid Configuration Syntax (Negative Case)

### Repository Structure
```
invalid-syntax-test/
├── config.yaml
├── config.json
├── config.toml
├── docker-compose.yml
├── Dockerfile
└── .github/
    └── workflows/
        └── ci.yml
```

**config.yaml** (INVALID - missing colon)
```yaml
database:
  host: localhost
  port 5432  # MISSING COLON
  name: mydb
redis:
  url: redis://localhost:6379
```

**config.json** (INVALID - trailing comma)
```json
{
  "database": {
    "host": "localhost",
    "port": 5432,
  },
  "redis": {
    "url": "redis://localhost:6379"
  }
}
```

**config.toml** (INVALID - unclosed string)
```toml
[database]
host = "localhost
port = 5432
name = "mydb"

[redis]
url = "redis://localhost:6379"
```

**docker-compose.yml** (INVALID - invalid YAML)
```yaml
version: '3.8'
services:
  app:
    image: myapp:latest
    environment:
      - INVALID_ENV_VAR  # Missing value
    ports:
      - "8080:8080
```

**Dockerfile** (hadolint warning)
```dockerfile
FROM python:3.11
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
CMD ["python", "app.py"]
# Missing: HEALTHCHECK, non-root user, pinned base image tag
```

### Expected Behavior
- yamllint catches config.yaml error (line 3)
- jq catches config.json error (trailing comma)
- taplo catches config.toml error (unclosed string)
- docker compose config catches docker-compose.yml error
- hadolint catches Dockerfile warnings (DL3007, DL3008, etc.)
- Report lists all syntax errors with file, line, message
- Overall: Multiple syntax failures

---

## Fixture 4: Valid Syntax but Runtime Failure (Edge Case)

### Repository Structure
```
runtime-failure-test/
├── .env.production
├── docker-compose.prod.yml
├── src/
│   ├── config.py
│   └── database.py
└── kubernetes/
    └── deployment.yaml
```

**.env.production**
```env
DATABASE_URL=postgresql://user:pass@prod-db:5432/proddb
REDIS_URL=redis://prod-redis:6379
```

**docker-compose.prod.yml**
```yaml
version: '3.8'
services:
  app:
    image: myapp:latest
    environment:
      - DATABASE_URL=postgresql://user:pass@prod-db:5432/proddb
      - REDIS_URL=redis://prod-redis:6379
    deploy:
      resources:
        limits:
          memory: 64M  # TOO SMALL - OOM at startup
        reservations:
          memory: 32M
```

**src/config.py**
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    redis_url: str
    db_pool_size: int = 100  # Default large pool
    
    class Config:
        env_file = ".env.production"

settings = Settings()
```

**src/database.py**
```python
from sqlalchemy import create_engine
from .config import settings

# Creates pool of 100 connections but container limited to 64MB
engine = create_engine(
    settings.database_url,
    pool_size=settings.db_pool_size,
    max_overflow=20
)
```

**kubernetes/deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: app
        image: myapp:latest
        resources:
          limits:
            memory: "64Mi"
            cpu: "100m"
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 10
```

### Expected Behavior
- Syntax validation: All PASS (valid YAML, JSON, TOML, Dockerfile)
- **Runtime assumption check**:
  - Assumption: Database pool size 100 fits in memory
  - Reality: 64MB limit → OOM with 100 connections
  - Assumption: Redis available at prod-redis:6379
  - Reality: Not verified (network check skipped)
  - Assumption: PostgreSQL accepts 120 concurrent connections
  - Reality: Default max_connections=100
- Readiness probe: 5s delay but app needs 30s to init pool
- Report: "Syntax OK ≠ Deployment OK" disclaimer highlighted
- Flags: Memory limit too low, pool size mismatch, probe timing

---

## Fixture 5: Potentially Destructive Deployment Command (Security Case)

### Repository Structure
```
destructive-cmd-test/
├── scripts/
│   ├── deploy.sh
│   ├── migrate.sh
│   └── cleanup.sh
├── .github/
    └── workflows/
        ├── deploy.yml
        └── cleanup.yml
├── terraform/
    └── main.tf
└── kubernetes/
    └── namespace.yaml
```

**scripts/deploy.sh**
```bash
#!/bin/bash
set -e

echo "Deploying to production..."

# DANGEROUS: Auto-approve destroy
terraform -chdir=../terraform destroy -auto-approve

# DANGEROUS: Force delete namespace
kubectl delete namespace production --grace-period=0 --force

# Deploy new
terraform -chdir=../terraform apply -auto-approve
kubectl apply -f ../kubernetes/
```

**scripts/migrate.sh**
```bash
#!/bin/bash
set -e

# DANGEROUS: Runs down migration in production deploy
npm run db:migrate:down
npm run db:migrate:up
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
        run: ./scripts/deploy.sh
```

**.github/workflows/cleanup.yml**
```yaml
name: Cleanup
on:
  workflow_dispatch:
jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Cleanup old resources
        run: |
          # DANGEROUS: Broad cleanup
          docker system prune -a --volumes -f
          kubectl delete pvc --all -n production
```

**terraform/main.tf**
```hcl
resource "aws_db_instance" "main" {
  identifier = "prod-db"
  engine     = "postgres"
  # No deletion_protection = true
}
```

### Expected Behavior
- Destructive command scan finds:
  1. `terraform destroy -auto-approve` in deploy.sh (CRITICAL)
  2. `kubectl delete namespace --force` in deploy.sh (CRITICAL)
  3. `npm run db:migrate:down` in migrate.sh (HIGH)
  4. `docker system prune -a --volumes -f` in cleanup.yml (HIGH)
  5. `kubectl delete pvc --all` in cleanup.yml (HIGH)
  6. Terraform resource without deletion_protection (MEDIUM)
- All flagged with **Approval Required: YES**
- Report recommends: Manual approval gates, removal of -auto-approve, confirmation prompts

---

## Fixture 6: Validator Unavailable (Error Handling)

### Repository Structure
```
missing-validator-test/
├── docker-compose.yml
├── Dockerfile
├── kubernetes/
│   └── deployment.yaml
├── helm/
│   └── chart/
│       ├── Chart.yaml
│       └── values.yaml
└── .github/
    └── workflows/
        └── ci.yml
```

### Environment
- hadolint: NOT INSTALLED
- kubeval: NOT INSTALLED
- helm: NOT INSTALLED
- checkov: INSTALLED
- yamllint: INSTALLED
- docker compose: AVAILABLE

### Expected Behavior
- Skill detects missing validators
- Reports:
  - Dockerfile: "Not Run — hadolint not installed" (install: `brew install hadolint`)
  - kubernetes/deployment.yaml: "Not Run — kubeval/kubeconform not installed"
  - helm/chart: "Not Run — helm not installed"
- Runs available validators:
  - docker compose config: ✅
  - yamllint on .github/workflows: ✅
  - checkov on kubernetes/: ✅
- Does not claim full validation passed

---

## Fixture 7: Development vs Production Configuration Difference (Edge Case)

### Repository Structure
```
env-diff-test/
├── .env.development
├── .env.staging
├── .env.production
├── docker-compose.yml
├── docker-compose.staging.yml
├── docker-compose.prod.yml
├── kubernetes/
│   ├── base/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   ├── overlays/
│   │   ├── development/
│   │   │   └── kustomization.yaml
│   │   ├── staging/
│   │   │   └── kustomization.yaml
│   │   └── production/
│   │       └── kustomization.yaml
└── src/
    └── config.py
```

### Key Differences

| Variable | Development | Staging | Production | Risk |
|----------|-------------|---------|------------|------|
| DEBUG | true | false | **true** | HIGH |
| LOG_LEVEL | debug | info | **debug** | MEDIUM |
| REPLICAS | 1 | 2 | **1** | HIGH |
| DB_POOL_SIZE | 5 | 10 | **5** | MEDIUM |
| CACHE_TTL | 300 | 600 | **60** | MEDIUM |
| TLS_VERIFY | false | true | **false** | CRITICAL |

### Kubernetes Overlays
**production/kustomization.yaml**
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - ../../base
patches:
  - patch: |-
      apiVersion: apps/v1
      kind: Deployment
      metadata:
        name: app
      spec:
        replicas: 1  # Should be 3+
        template:
          spec:
            containers:
            - name: app
              resources:
                limits:
                  memory: "128Mi"  # Too low
```

### Expected Behavior
- Skill compares all three environments
- Flags critical differences:
  - DEBUG=true in production (CRITICAL)
  - TLS_VERIFY=false in production (CRITICAL)
  - REPLICAS=1 in production (HIGH)
  - DB_POOL_SIZE=5 in production (MEDIUM)
  - Memory limit 128Mi (LOW)
- Notes: Kustomize overlays used correctly but values wrong
- Recommends: Production values review, separate prod config audit

---

## Fixture 8: Configuration Drift (Edge Case)

### Scenario
- Git (desired state): FEATURE_NEW_UI=true, REPLICAS=3
- Deployed (actual state): FEATURE_NEW_UI=false, REPLICAS=2
- Target environment: Production
- Access: kubectl available

### Expected Behavior
- Skill runs drift detection:
  - `kubectl get configmap app-config -o yaml` → FEATURE_NEW_UI=false
  - `kubectl get deployment app -o jsonpath='{.spec.replicas}'` → 2
- Reports drift:
  - FEATURE_NEW_UI: desired=true, actual=false
  - REPLICAS: desired=3, actual=2
- Flags as MEDIUM risk (feature flag off, under-replicated)

---

## Fixture 9: Runtime Assumption Validation (Edge Case)

### Repository Structure
```
assumption-test/
├── README.md
├── docker-compose.yml
├── src/
│   ├── config.py
│   └── services/
│       ├── database.py
│       └── cache.py
└── kubernetes/
    └── deployment.yaml
```

**README.md**
```markdown
# Requirements

- PostgreSQL 15+ (uses JSONB features)
- Redis 7+ (uses JSON.SET)
- AWS credentials via IRSA (IAM Roles for Service Accounts)
- Writable /tmp for uploads
- TLS certificates in /etc/ssl/certs
```

**src/services/database.py**
```python
import asyncpg

async def connect():
    # Assumes PostgreSQL 15+ for JSONB_PATH_QUERY
    conn = await asyncpg.connect(os.getenv("DATABASE_URL"))
    await conn.execute("SELECT jsonb_path_query('{}', '$.key')")
    return conn
```

**src/services/cache.py**
```python
import redis

def get_redis():
    # Assumes Redis 7+ for JSON.SET
    r = redis.from_url(os.getenv("REDIS_URL"))
    r.json().set("key", "$", {"value": "data"})  # RedisJSON module
    return r
```

**kubernetes/deployment.yaml**
```yaml
spec:
  template:
    spec:
      serviceAccountName: app-sa  # IRSA configured
      volumes:
      - name: tmp
        emptyDir: {}  # Writable /tmp
      - name: certs
        hostPath:
          path: /etc/ssl/certs  # TLS certs
      containers:
      - name: app
        volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: certs
          mountPath: /etc/ssl/certs
```

### Target Environment Actuals
- PostgreSQL: 13.12 (NOT 15+)
- Redis: 6.2 (NOT 7+, no JSON module)
- IRSA: Configured ✅
- /tmp: Writable ✅
- /etc/ssl/certs: Exists ✅

### Expected Behavior
- Skill extracts assumptions from README + code
- Validates against target:
  - PostgreSQL 15+: **FAIL** (13.12) — CRITICAL (JSONB_PATH_QUERY fails)
  - Redis 7+: **FAIL** (6.2, no JSON module) — CRITICAL
  - IRSA: PASS
  - /tmp writable: PASS
  - TLS certs: PASS
- Reports assumption mismatches with CRITICAL risk
- Recommends: Upgrade PostgreSQL/Redis or refactor code

---

## Fixture 10: Rollback and Recovery Review (Edge Case)

### Repository Structure
```
rollback-test/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── kubernetes/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── rollout.yaml
├── database/
│   ├── migrations/
│   │   ├── 001_create_users.up.sql
│   │   ├── 001_create_users.down.sql
│   │   ├── 002_add_posts.up.sql
│   │   └── 002_add_posts.down.sql  # MISSING for v2.3
│   └── migration_runner.py
├── terraform/
│   └── main.tf
└── scripts/
    └── rollback.sh
```

**kubernetes/rollout.yaml**
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: app
spec:
  replicas: 3
  strategy:
    blueGreen:
      activeService: app-blue
      previewService: app-green
      autoPromotionEnabled: false
```

**database/migrations/002_add_posts.up.sql**
```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255),
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
```

**scripts/rollback.sh**
```bash
#!/bin/bash
# Manual rollback script
kubectl argo rollouts abort rollout/app
kubectl argo rollouts undo rollout/app
# Database rollback not automated
```

### Expected Behavior
- Rollback review finds:
  - Application: Blue/green via Argo Rollouts ✅ (2 min)
  - Database v2.3: **MISSING down migration** ⚠️
  - Infrastructure: Terraform state backup? **Not verified** ⚠️
  - Config: ConfigMap versioning? **Not found** ⚠️
  - Automated rollback script: Exists but incomplete
- Reports gaps with estimated recovery times
- Flags: No automated DB rollback for v2.3 = manual intervention required