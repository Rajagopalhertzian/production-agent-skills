# AWS Key Rotation Guide

## Overview
This guide covers rotating AWS Access Keys (Access Key ID + Secret Access Key).

## When to Rotate
- Key exposed in code/repository (immediate)
- Regular rotation schedule (every 90 days recommended)
- Employee offboarding
- Suspected compromise

## Rotation Steps

### 1. Create New Access Key
```bash
# Via AWS CLI
aws iam create-access-key --user-name <username>

# Via AWS Console
# IAM > Users > [username] > Security credentials > Create access key
```

### 2. Update Applications
- Update secret manager (AWS Secrets Manager, HashiCorp Vault, etc.)
- Update CI/CD pipeline secrets (GitHub Actions, GitLab CI, etc.)
- Update local development environments
- Update any deployed applications

### 3. Verify New Key Works
```bash
aws sts get-caller-identity
```

### 4. Deactivate Old Key
```bash
aws iam update-access-key --access-key-id <OLD_KEY_ID> --status Inactive --user-name <username>
```

### 5. Delete Old Key (After Verification)
```bash
aws iam delete-access-key --access-key-id <OLD_KEY_ID> --user-name <username>
```

## Automation
Consider using AWS IAM Access Analyzer or custom Lambda for automated rotation.

## References
- AWS Documentation: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html
- AWS Security Best Practices: https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html