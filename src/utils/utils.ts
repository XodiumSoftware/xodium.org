/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

/// <reference lib="deno.unstable" />

import {cache} from "./cache.ts";
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
 * Specific error class for GitHub API errors
 */
export class GitHubApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
  ) {
    super(`GitHub API error: ${status} ${statusText} - ${message}`);
    this.name = "GitHubApiError";
  }
}

/**
 * Get data from KV cache if valid
 */
async function getFromCache<T>(
  cacheKey: string,
  org: string,
): Promise<T | null> {
  return await cache.get<T>(cacheKey, org);
}

/**
 * Save data to KV cache
 * @template T The type of data to be cached
 * @param {string} cacheKey The key to use for caching in Deno KV.
 * @param {string} org The organization to fetch data from.
 * @param {T} data The data to cache.
 * @param {number} cacheExpiry The cache expiry time in milliseconds.
 * @returns {Promise<void>} A promise that resolves when the data is cached.
 */
async function saveToCache<T>(
  cacheKey: string,
  org: string,
  data: T,
  cacheExpiry: number = GITHUB.api.members.cacheExpiry,
): Promise<void> {
  await cache.set(cacheKey, org, data, { expireIn: cacheExpiry });
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
    const cachedData = await getFromCache<T>(cacheKey, org);
    if (cachedData) return cachedData;

    const data = await fetchFromGitHub<T>(apiEndpoint, token);
    await saveToCache(cacheKey, org, data, cacheExpiry);

    return data;
  } catch (e: unknown) {
    if (e instanceof GitHubApiError) throw e;
    throw new Error(
      `Failed to load organization ${cacheKey}: ${
        e instanceof Error ? e.message : String(e)
      }`,
    );
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
      console.error(`Error in ${dataType} API route:`, e);
      return new Response(e instanceof Error ? e.message : String(e), {
        status: 500,
      });
    }
  };
}

/**
 * Register shutdown hooks to ensure proper resource cleanup
 */
function registerShutdownHooks(): void {
  addEventListener("unload", () => {
    kvStore.close();
  });

  Deno.addSignalListener("SIGINT", () => {
    console.log("Shutting down gracefully...");
    kvStore.close();
    Deno.exit(0);
  });

  Deno.addSignalListener("SIGTERM", () => {
    console.log("Termination signal received, shutting down...");
    kvStore.close();
    Deno.exit(0);
  });
}

registerShutdownHooks();
