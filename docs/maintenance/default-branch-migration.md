# Default Branch Migration — 2026-08-04

This document records the repository hygiene follow-up to align GitHub's default branch setting with the production branch configuration.

## Current State

- **GitHub default branch**: `feature/site-foundation` (requires manual change)
- **Production branch**: `main`
- **Branch status**: `main` is 13 commits ahead of `feature/site-foundation` and 0 commits behind
- **Unique commits**: `feature/site-foundation` has no unique commits relative to `main`

## Repository Artifacts Status

All code and configuration files are already correctly configured for `main`:

| File | Status | Notes |
| --- | --- | --- |
| `.github/workflows/validate.yml` | ✅ Correct | Triggers on `main` branch (lines 5-9) |
| `.coderabbit.yaml` | ✅ Correct | Base branch set to `main` (line 7) |
| `README.md` | ✅ Correct | Documents `main` as production branch (lines 92-94) |
| `netlify.toml` | ✅ Correct | Branch-agnostic deployment configuration |
| Release documentation | ✅ Correct | References `main` as production target |

No references to `feature/site-foundation` found in any repository files.

## Required Manual Actions

GitHub default branch settings cannot be changed programmatically. The following manual steps are required:

### 1. Change Default Branch

1. Navigate to repository Settings on GitHub
2. Go to the "General" section
3. Under "Default branch", click the switch/edit button
4. Select `main` as the new default branch
5. Confirm the change

### 2. Verify Configuration

After changing the default branch, verify:

- New pull requests default to target `main`
- Clone instructions reference `main`
- Code search and navigation use `main` as the default context
- Branch protection rules apply to `main`
- Review bots (CodeRabbit, etc.) evaluate `main` by default

### 3. Clean Up Feature Branch

After verification and confirmation that all changes are working correctly:

1. Review `feature/site-foundation` to confirm it has no unique work
2. Delete `feature/site-foundation` branch if it is no longer needed
3. Update branch audit documentation if additional cleanup is performed
