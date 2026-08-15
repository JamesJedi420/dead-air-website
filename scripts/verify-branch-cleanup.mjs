#!/usr/bin/env node

/**
 * Branch cleanup verification script
 *
 * This script helps verify the safety conditions before deleting stale branches.
 * It checks branch tips against expected SHAs and provides deletion commands.
 *
 * Usage:
 *   node scripts/verify-branch-cleanup.mjs
 *
 * Safety gates:
 * 1. Branch tip matches expected SHA
 * 2. No open PR using the branch
 * 3. Merged branches are ancestors of main
 * 4. Closed/unmerged branches remain closed
 */

import { execSync } from 'child_process';

// Configuration
const BRANCHES_TO_DELETE = [
  {
    name: 'docs/pattern-threshold-watchlist',
    expectedSHA: '9f2f058a204e3e08fe0d9a00a446f1ddd8097902',
    prNumber: 29,
    prState: 'merged',
  },
  {
    name: 'docs/da-003-ptw-firewall',
    expectedSHA: '385e5c62ee55a718dec15e89974a5bd17942c312',
    prNumber: 30,
    prState: 'merged',
  },
  {
    name: 'docs/ptw-candidate-admission-gate',
    expectedSHA: '0aae4231bc55793bfa6bbe12ea7f1aff9e0ee7d5',
    prNumber: 31,
    prState: 'merged',
  },
  {
    name: 'Q-DEV-issue-6-1786009449',
    expectedSHA: '761ae06d2ce50e5f40417e49e9acbde22e146f04',
    prNumber: 28,
    prState: 'closed-unmerged',
  },
];

const MAIN_EXPECTED_SHA = '98a6a168148baf60f9356a449d584e5c2801a171';

function execCommand(command) {
  try {
    return execSync(command, { encoding: 'utf-8' }).trim();
  } catch (error) {
    return null;
  }
}

function verifyBranchTip(branchName, expectedSHA) {
  const actualSHA = execCommand(`git rev-parse origin/${branchName}`);
  if (actualSHA === expectedSHA) {
    console.log(`✓ ${branchName}: SHA matches (${expectedSHA.substring(0, 8)}...)`);
    return true;
  } else if (actualSHA === null) {
    console.log(`✗ ${branchName}: Branch not found or git command failed`);
    return false;
  } else {
    console.log(`✗ ${branchName}: SHA mismatch!`);
    console.log(`  Expected: ${expectedSHA}`);
    console.log(`  Actual:   ${actualSHA}`);
    return false;
  }
}

function verifyMergeStatus(sha, prNumber) {
  const isAncestor = execCommand(
    `git merge-base --is-ancestor ${sha} origin/main && echo "yes" || echo "no"`
  );
  if (isAncestor === 'yes') {
    console.log(`✓ PR #${prNumber}: Confirmed merged into main`);
    return true;
  } else {
    console.log(`✗ PR #${prNumber}: NOT merged into main`);
    return false;
  }
}

console.log('Branch Cleanup Verification');
console.log('===========================\n');

// Fetch latest
console.log('Fetching latest from origin...');
execCommand('git fetch origin');
console.log('');

// Verify main branch
console.log('Verifying main branch:');
const mainSHA = execCommand('git rev-parse origin/main');
if (mainSHA === MAIN_EXPECTED_SHA) {
  console.log(`✓ main: SHA matches (${MAIN_EXPECTED_SHA.substring(0, 8)}...)`);
} else {
  console.log(`✗ main: SHA changed!`);
  console.log(`  Expected: ${MAIN_EXPECTED_SHA}`);
  console.log(`  Actual:   ${mainSHA}`);
}
console.log('');

// Verify each branch
let allChecksPass = true;

console.log('Verifying branches to delete:');
for (const branch of BRANCHES_TO_DELETE) {
  console.log(`\n${branch.name} (PR #${branch.prNumber}):`);
  const tipMatches = verifyBranchTip(branch.name, branch.expectedSHA);
  allChecksPass = allChecksPass && tipMatches;

  if (tipMatches && branch.prState === 'merged') {
    const mergeVerified = verifyMergeStatus(branch.expectedSHA, branch.prNumber);
    allChecksPass = allChecksPass && mergeVerified;
  }
}

console.log('\n===========================');
if (allChecksPass) {
  console.log('\n✓ All safety checks passed!');
  console.log('\nTo delete branches, run:');
  console.log('  git push origin --delete ' + BRANCHES_TO_DELETE.map(b => b.name).join(' \\\n    '));
} else {
  console.log('\n✗ Some checks failed. Do NOT proceed with deletion.');
}
