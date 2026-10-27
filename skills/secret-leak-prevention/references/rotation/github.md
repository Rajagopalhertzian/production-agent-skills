# GitHub Token Rotation Guide

## Overview
This guide covers rotating GitHub Personal Access Tokens (classic) and Fine-grained Personal Access Tokens.

## When to Rotate
- Token exposed in code/repository (immediate)
- Regular rotation schedule (every 90 days recommended)
- Employee offboarding
- Suspected compromise
- Token permissions changed

## Rotation Steps

### 1. Create New Token

#### Classic Personal Access Token
```bash
# Via GitHub CLI
gh auth token  # Shows current token
# Create new: Settings > Developer settings > Personal access tokens > Tokens (classic) > Generate new token
```

#### Fine-grained Personal Access Token (Recommended)
```bash
# Via GitHub Console
# Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token
# Select specific repositories and permissions
```

### 2. Update Applications
- Update GitHub Actions secrets: Repository > Settings > Secrets and variables > Actions
- Update GitHub Codespaces secrets
- Update local git credential helper
- Update any CI/CD pipelines using the token
- Update Dependabot secrets (if used)

### 3. Verify New Token Works
```bash
# Test API access
curl -H "Authorization: Bearer <NEW_TOKEN>" https://api.github.com/user

# Test git operations
git clone https://<NEW_TOKEN>@github.com/owner/repo.git
```

### 4. Revoke Old Token
```bash
# Via GitHub CLI (for classic tokens)
gh api --method DELETE /applications/<client_id>/token -f access_token=<OLD_TOKEN>

# Via GitHub Console
# Settings > Developer settings > Personal access tokens > [Token] > Delete
```

## GitHub Actions Specific
```yaml
# In .github/workflows/*.yml
# Update the secret in repository settings, not in the workflow file
# The workflow references: ${{ secrets.GITHUB_TOKEN }} (auto-provided) or ${{ secrets.MY_CUSTOM_TOKEN }}
```

## Automation
Consider using GitHub's token rotation APIs or third-party tools for automated rotation.

## References
- GitHub Docs: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
- Fine-grained tokens: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token