export const getBillingFallbackPath = (workspaceId: string, isFeedyRubyCloud: boolean): string => {
  const settingsPath = isFeedyRubyCloud ? "billing" : "enterprise";
  return `/workspaces/${workspaceId}/settings/organization/${settingsPath}`;
};
