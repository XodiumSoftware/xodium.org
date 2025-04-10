/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

/// <reference lib="deno.unstable" />

import {GITHUB} from "./constants.ts";

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
 * Generic function to get organization data with caching.
 * @template T The type of data to be returned
 * @param {string} cacheKey The key to use for caching in Deno KV.
 * @param {string} org The organization to fetch data from.
 * @param {string} apiEndpoint The GitHub API endpoint to fetch data from.
 * @param {string | undefined} token The GitHub token to use.
 * @param {number} cacheExpiry The cache expiry time in milliseconds.
 * @returns {Promise<T>} A promise that resolves to the fetched data.
 */
export async function getOrganizationData<T>(
  cacheKey: string,
  org: string,
  apiEndpoint: string,
  token?: string,
  cacheExpiry: number = GITHUB.api.members.cacheExpiry,
): Promise<T> {
  try {
    const kv = await Deno.openKv();
    try {
      const cachedData = await kv.get<{ data: T; timestamp: number }>([
        cacheKey,
        org,
      ]);

      if (
        cachedData.value &&
        Date.now() - cachedData.value.timestamp < cacheExpiry
      ) {
        console.log(`Using cached data for ${cacheKey}: ${org}`);
        return cachedData.value.data;
      }

      console.log(`Fetching data from GitHub for ${cacheKey}: ${org}`);
      const data = await fetchFromGitHub<T>(apiEndpoint, token);
      const dataToStore = { data, timestamp: Date.now() };
      await kv.set([cacheKey, org], dataToStore);
      return data;
    } finally {
      kv.close();
    }
  } catch (e) {
    console.error(`Error fetching or caching organization ${cacheKey}:`, e);
    throw new Error(`Failed to load organization ${cacheKey}.`);
  }
}

/**
 * Creates a generic API route handler for fetching different types of organization data.
 *
 * @param {string} dataType The type of data being fetched (for caching purposes)
 * @param {string} endpoint The GitHub API endpoint path to call (without the org part)
 * @returns {(request: Request) => Promise<Response>} A reusable API route handler
 */
export function createOrgDataHandler<T>(
  dataType: string,
  endpoint: string,
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const org = url.searchParams.get("org");

    if (!org) return new Response("Missing 'org' parameter", { status: 400 });

    try {
      const data = await getOrganizationData<T>(
        dataType,
        org,
        endpoint.replace("{org}", org),
      );
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (e: unknown) {
      let message = "An unexpected error occurred.";
      if (e instanceof Error) {
        message = e.message;
        console.error(`Error in ${dataType} API route:`, e);
      } else {
        console.error(`An unknown error occurred in ${dataType} API route:`, e);
      }
      return new Response(message, { status: 500 });
    }
  };
}
