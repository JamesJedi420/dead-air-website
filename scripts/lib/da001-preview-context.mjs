export const validateDa001PreviewContext = ({ manifest, env, reportFailure }) => {
  const expectedBranch = env.DA001_PRIVATE_PREVIEW_BRANCH ?? manifest.preview?.branch;

  if (env.CONTEXT !== "deploy-preview") {
    reportFailure(
      `DA-001 private preview requires deploy-preview context, received ${env.CONTEXT ?? "missing"}.`,
    );
  }

  if (!expectedBranch || env.HEAD !== expectedBranch) {
    reportFailure(
      `DA-001 private preview requires head branch ${expectedBranch ?? "missing"}, received ${env.HEAD ?? "missing"}.`,
    );
  }

  return expectedBranch;
};
