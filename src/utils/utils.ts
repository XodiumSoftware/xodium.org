/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import { GITHUB } from "./constants.ts";

/**
 * Convert hours to milliseconds.
 * @param hours The number of hours to convert.
 * @returns The number of milliseconds in the given number of hours.
 */
export function hoursToMilliseconds(hours: number): number {
  return hours * 60 * 60 * 1000;
}

/**
 * Fetch data from the GitHub API.
 * @param endpoint The GitHub API endpoint (starting with a slash, e.g. `/orgs/{org}/members`).
 * @param token Optional GitHub token for authentication.
 * @returns A promise resolving with the parsed JSON data from GitHub.
 */
export const fetchFromGitHub = async <T>(
  endpoint: string,
  token?: string,
): Promise<T> => {
  const headers = new Headers({
    "User-Agent": GITHUB.org.user_agent,
    "X-GitHub-Api-Version": GITHUB.api.version,
    ...(token ? { Authorization: `token ${token}` } : {}),
  });
  const res = await fetch(`${GITHUB.api.url}${endpoint}`, { headers });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `GitHub API error: ${res.status} ${res.statusText} - ${errorText}`,
    );
  }
  return res.json();
};

/**
 * Generic function to fetch and cache GitHub organization data.
 * @param resourceType The resource type (e.g., "members", "repos")
 * @param resourceName Display name of the resource for error messages
 * @param org The organization to fetch data from
 * @param endpoint The GitHub API endpoint (e.g., "members" or "repos")
 * @param cacheExpiry Time in milliseconds before cache expires
 * @param token Optional GitHub token for authentication
 * @returns A promise resolving to the fetched data
 */
export async function fetchAndCacheOrgData<T>(
  resourceType: string,
  resourceName: string,
  org: string,
  endpoint: string,
  cacheExpiry: number,
  token?: string,
): Promise<T[]> {
  interface CachedData {
    data: T[];
    timestamp: number;
  }

  try {
    const kv = await Deno.openKv();
    try {
      const cachedData = await kv.get<CachedData>([resourceType, org]);
      if (
        cachedData.value &&
        Date.now() - cachedData.value.timestamp < cacheExpiry
      ) {
        console.log(`Using cached ${resourceType} for org: ${org}`);
        return cachedData.value.data;
      }

      console.log(`Fetching ${resourceType} from GitHub for org: ${org}`);
      const data = await fetchFromGitHub<T[]>(
        `/orgs/${org}/${endpoint}`,
        token,
      );
      const dataToStore: CachedData = {
        data,
        timestamp: Date.now(),
      };
      await kv.set([resourceType, org], dataToStore);
      return data;
    } finally {
      kv.close();
    }
  } catch (e) {
    console.error(`Error fetching or caching organization ${resourceType}:`, e);
    throw new Error(`Failed to load ${resourceName}.`);
  }
}
