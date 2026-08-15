# Branch cleanup — 2025-01

This cleanup targets four stale branches whose associated pull requests are complete and whose work is already fully represented in `main`.

## Scope

Four non-`main` branches remain after their associated work is complete:

- `docs/pattern-threshold-watchlist` — `9f2f058a204e3e08fe0d9a00a446f1ddd8097902` — PR #29 merged
- `docs/da-003-ptw-firewall` — `385e5c62ee55a718dec15e89974a5bd17942c312` — PR #30 merged
- `docs/ptw-candidate-admission-gate` — `0aae4231bc55793bfa6bbe12ea7f1aff9e0ee7d5` — PR #31 merged
- `Q-DEV-issue-6-1786009449` — `761ae06d2ce50e5f40417e49e9acbde22e146f04` — PR #28 closed unmerged as superseded after the default branch migration was already complete

`main` is the protected default branch and currently points to `98a6a168148baf60f9356a449d584e5c2801a171`.

## Safety gates

Before deleting each ref:

1. Confirm the branch tip still exactly matches the SHA listed above.
2. Confirm there is no open PR using that branch as its head.
3. For PR #29–#31 branches, confirm the PR remains merged into `main`.
4. For the PR #28 branch, confirm the only unique content is the superseded default-branch migration documentation and that PR #28 remains closed unmerged.
5. Delete only the named refs; do not alter `main` or force-update any branch.

## Verification procedure

### Step 1: Verify branch tips

```bash
# Fetch latest from remote
git fetch origin

# Verify each branch tip matches expected SHA
git rev-parse origin/docs/pattern-threshold-watchlist
# Expected: 9f2f058a204e3e08fe0d9a00a446f1ddd8097902

git rev-parse origin/docs/da-003-ptw-firewall
# Expected: 385e5c62ee55a718dec15e89974a5bd17942c312

git rev-parse origin/docs/ptw-candidate-admission-gate
# Expected: 0aae4231bc55793bfa6bbe12ea7f1aff9e0ee7d5

git rev-parse origin/Q-DEV-issue-6-1786009449
# Expected: 761ae06d2ce50e5f40417e49e9acbde22e146f04

# Verify main tip
git rev-parse origin/main
# Expected: 98a6a168148baf60f9356a449d584e5c2801a171
```

### Step 2: Verify merge status

```bash
# Check if merged branches are ancestors of main
git merge-base --is-ancestor 9f2f058a204e3e08fe0d9a00a446f1ddd8097902 origin/main && echo "PR #29 merged" || echo "PR #29 NOT merged"
git merge-base --is-ancestor 385e5c62ee55a718dec15e89974a5bd17942c312 origin/main && echo "PR #30 merged" || echo "PR #30 NOT merged"
git merge-base --is-ancestor 0aae4231bc55793bfa6bbe12ea7f1aff9e0ee7d5 origin/main && echo "PR #31 merged" || echo "PR #31 NOT merged"
```

### Step 3: Check for open PRs

Using GitHub CLI:

```bash
# List all open PRs to verify none use these branches
gh pr list --state open --json number,headRefName
```

Or manually check on GitHub:
- Navigate to repository → Pull requests
- Filter by "Open"
- Verify none of the four branches appear as head branches

### Step 4: Verify PR #28 status

```bash
# Verify PR #28 is closed and not merged
gh pr view 28 --json state,merged
# Expected: state: "CLOSED", merged: false
```

### Step 5: Delete branches

**Only proceed if all safety gates pass.**

Using GitHub CLI:

```bash
# Delete each branch from remote
gh api -X DELETE /repos/:owner/:repo/git/refs/heads/docs/pattern-threshold-watchlist
gh api -X DELETE /repos/:owner/:repo/git/refs/heads/docs/da-003-ptw-firewall
gh api -X DELETE /repos/:owner/:repo/git/refs/heads/docs/ptw-candidate-admission-gate
gh api -X DELETE /repos/:owner/:repo/git/refs/heads/Q-DEV-issue-6-1786009449
```

Or using Git:

```bash
git push origin --delete docs/pattern-threshold-watchlist
git push origin --delete docs/da-003-ptw-firewall
git push origin --delete docs/ptw-candidate-admission-gate
git push origin --delete Q-DEV-issue-6-1786009449
```

## Completion verification

After deletion, verify branches are removed:

```bash
# Fetch and prune
git fetch origin --prune

# List remaining remote branches
git branch -r

# Verify only main and any active branches remain
```

This cleanup was performed as a bounded manual operation with exact-SHA verification. No permanent destructive cleanup workflow was created.
