/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

/// <reference lib="deno.unstable" />

import {GITHUB, kvStore} from "./constants.ts";
import {Octokit} from "@octokit/core";

/**
 * Fetch data from GitHub API
 * @template T The type of data to be fetched
 * @param {string} endpoint The GitHub API endpoint to fetch data from.
 * @param {string | undefined} token The GitHub token to use.
 * @returns {Promise<T>} A promise that resolves to the fetched data.
 */
async function fetchFromGitHub<T>(
  endpoint: string,
  token?: string,
): Promise<T> {
  return (await new Octokit({
    userAgent: GITHUB.org.user_agent,
    baseUrl: GITHUB.api.url,
    headers: { "X-GitHub-Api-Version": GITHUB.api.version },
  }).request(`GET ${endpoint}`, {
    headers: token ? { authorization: `token ${token}` } : {},
  })).data as T;
}

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
    const result = await kvStore.getItem<T>([cacheKey, org]);
    if (result.value && Date.now() - result.value.timestamp < cacheExpiry) {
      console.log(`Using cached data for ${cacheKey}: ${org}`);
      return result.value.data;
    }

    console.log(`Fetching data from GitHub for ${cacheKey}: ${org}`);
    const data = await fetchFromGitHub<T>(apiEndpoint, token);
    await kvStore.setItem([cacheKey, org], data);

    return data;
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
    } catch (e) {
      console.error(`Error in ${dataType} API route:`, e);
      return new Response(e instanceof Error ? e.message : String(e), {
        status: 500,
      });
    }
  };
}
