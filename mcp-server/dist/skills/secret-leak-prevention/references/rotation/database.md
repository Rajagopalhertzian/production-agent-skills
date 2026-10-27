# Database Credential Rotation Guide

## Overview
This guide covers rotating database credentials (username/password) for common databases.

## When to Rotate
- Credentials exposed in code/repository (immediate)
- Regular rotation schedule (every 90 days recommended)
- Employee offboarding
- Suspected compromise
- Compliance requirements

## Rotation Steps (General)

### 1. Create New Credentials
```sql
-- PostgreSQL
CREATE USER new_user WITH PASSWORD 'new_secure_password';
GRANT ALL PRIVILEGES ON DATABASE mydb TO new_user;

-- MySQL
CREATE USER 'new_user'@'%' IDENTIFIED BY 'new_secure_password';
GRANT ALL PRIVILEGES ON mydb.* TO 'new_user'@'%';
FLUSH PRIVILEGES;

-- MongoDB
use admin
db.createUser({
  user: "new_user",
  pwd: "new_secure_password",
  roles: [{ role: "readWrite", db: "mydb" }]
})
```

### 2. Update Applications
- Update secret manager (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault, etc.)
- Update CI/CD pipeline secrets
- Update Kubernetes secrets
- Update local development environments
- Update connection poolers (PgBouncer, ProxySQL, etc.)

### 3. Test New Credentials
```bash
# PostgreSQL
psql "postgresql://new_user:new_secure_password@host:5432/mydb" -c "SELECT 1"

# MySQL
mysql -u new_user -p'new_secure_password' -h host -e "SELECT 1"

# MongoDB
mongosh "mongodb://new_user:new_secure_password@host:27017/mydb" --eval "db.runCommand({ping: 1})"
```

### 4. Deploy with New Credentials
- Rolling restart of applications
- Verify all services connect successfully
- Monitor for connection errors

### 5. Revoke Old Credentials
```sql
-- PostgreSQL
DROP USER old_user;

-- MySQL
DROP USER 'old_user'@'%';
FLUSH PRIVILEGES;

-- MongoDB
use admin
db.dropUser("old_user")
```

## Zero-Downtime Rotation (Advanced)

### Dual-Credential Approach
1. Create new user with same permissions
2. Update applications one at a time to use new credentials
3. Verify each service works
4. Remove old user after all migrated

### Connection Pool Considerations
- PgBouncer: Reload config without restart
- ProxySQL: Runtime credential update
- Application-level: Graceful connection refresh

## Cloud-Managed Databases

### AWS RDS
```bash
# Generate new password
aws rds modify-db-instance \
  --db-instance-identifier mydb \
  --master-user-password new_secure_password \
  --apply-immediately
```

### Google Cloud SQL
```bash
# Update user password
gcloud sql users set-password new_user \
  --instance=mydb \
  --password=new_secure_password
```

### Azure Database
```bash
# Update password
az postgres server configuration set \
  --resource-group mygroup \
  --server-name myserver \
  --name password \
  --value new_secure_password
```

## Automation
- Use cloud provider rotation APIs
- Implement with Terraform/CloudFormation
- Schedule with cron/EventBridge/Cloud Scheduler

## References
- PostgreSQL: https://www.postgresql.org/docs/current/sql-createuser.html
- MySQL: https://dev.mysql.com/doc/refman/8.0/en/create-user.html
- MongoDB: https://www.mongodb.com/docs/manual/reference/method/db.createUser/
- AWS RDS: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ResetMasterUserPassword.html