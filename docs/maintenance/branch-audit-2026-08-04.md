# Branch audit — 2026-08-04

This audit compares every non-`main` branch present after the DA-001 release cleanup against `main`, its pull-request history, and its current branch tip.

## Deletion criteria

A branch is eligible for deletion only when:

1. it has no open pull request;
2. its current tip matches the audited SHA below;
3. its work is already represented in `main`, a merged pull request, or a later merged branch; and
4. no post-merge or otherwise active commits exist on the branch.

## Confirmed obsolete branches

| Branch | Audited tip | Evidence |
| --- | --- | --- |
| `agent/about-page-rewrite` | `aa7360f834863bf15ab836e06f61c95c6c79fb83` | Unchanged head of merged PR #7. |
| `agent/da-002-manuscript-import` | `f25656240872bbb48876d90892b48ab5e660e7dc` | Ancestor of `feature/da-002-private-preview`, whose PR #3 was merged; no independent later work. |
| `agent/homepage-live-copy` | `e85ec644c5c6a92478130d766811a632e0f29b89` | Unchanged head of merged PR #9. |
| `agent/narrative-timeline-standard` | `663742b285dd6e874cf6ead1b9624c0d44987d3a` | Unchanged head of merged PR #10. |
| `agent/numbered-story-sections` | `d3b65dca9c0f2be76f43a47816cc3613bbf9f2da` | Unchanged head of merged PR #8. |
| `agent/publish-the-building-keeps-the-hour` | `33dbe4588b6b085a4b39ccac97f54de93cbcbd78` | Direct ancestor of `main`; zero commits ahead of `main`. |
| `agent/standardize-story-source-note` | `74ddc6049505c36b7059d9035396d679047c3231` | Unchanged head of merged PR #5. |
| `agent/switch-default-to-main` | `e37812392f19a07e7d079fe96d91fdb432e9081d` | Closed superseded PR #25; branch is identical to `main` at audit time. |
| `feature/da-002-private-preview` | `59f28464e82e9e950b32ceb9c6a8d74a73ab5093` | Unchanged head of merged PR #3. |
| `release/da-002-freeze` | `9d665e0083f72f39d10d04c1a4d608555cb97fa5` | Unchanged head of merged PR #4. |

## Preserved branches

No other non-`main` branch was present at audit time. The cleanup workflow also verifies open pull requests and exact branch tips immediately before deletion, so any branch that changes after this audit is preserved by failing the cleanup.
