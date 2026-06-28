import "server-only";
import FeedyRubyHub from "@feedyruby/hub";
import { env } from "@/lib/env";

const globalForHub = globalThis as unknown as {
  feedyrubyHubClient: FeedyRubyHub | undefined;
};

/**
 * Returns a shared FeedyRuby Hub API client when HUB_API_KEY is set.
 * Uses a global singleton so the same instance is reused across the process
 * (and across Next.js HMR in development). When the key is not set, returns
 * null and does not cache that result so a later call with the key set
 * can create the client.
 */
export const getHubClient = (): FeedyRubyHub | null => {
  if (globalForHub.feedyrubyHubClient) {
    return globalForHub.feedyrubyHubClient;
  }
  const apiKey = env.HUB_API_KEY;
  if (!apiKey) return null;
  const client = new FeedyRubyHub({ apiKey, baseURL: env.HUB_API_URL });
  globalForHub.feedyrubyHubClient = client;
  return client;
};
