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
