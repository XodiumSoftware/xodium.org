/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

/// <reference lib="deno.unstable" />

import { GITHUB } from "../../../../utils/constants.ts";

export interface Member {
  login: string;
  avatar_url: string;
  html_url: string;
}

interface CachedMembers {
  members: Member[];
  timestamp: number;
}

/**
 * Fetches organization members from GitHub API, with caching.
 * @param {string} org The organization to fetch members from.
 * @param {string | undefined} token The GitHub token to use for authentication.
 * @returns {Promise<Member[]>} A promise that resolves to an array of members.
 */
async function fetchOrganizationMembers(
  org: string,
  token?: string,
): Promise<Member[]> {
  const headers = new Headers({
    "User-Agent": GITHUB.org.user_agent,
    "X-GitHub-Api-Version": GITHUB.api.version,
    ...(token ? { Authorization: `token ${token}` } : {}),
  });

  const response = await fetch(`${GITHUB.api.url}/orgs/${org}/members`, {
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `GitHub API error: ${response.status} ${response.statusText}`,
      errorText,
    );
    throw new Error(
      `Failed to fetch organization members: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  return await response.json();
}

/**
 * Gets organization members, using cached data if available and valid.
 * @param {string} org The organization to fetch members from.
 * @param {string | undefined} token The GitHub token to use.
 * @returns {Promise<Member[]>} A promise that resolves to an array of members.
 */
async function getOrganizationMembers(
  org: string,
  token?: string,
): Promise<Member[]> {
  try {
    const kv = await Deno.openKv();
    try {
      const cachedData = await kv.get<CachedMembers>(["members", org]);
      if (
        cachedData.value &&
        Date.now() - cachedData.value.timestamp <
          GITHUB.api.members.cacheExpiry
      ) {
        console.log(`Using cached data for org: ${org}`);
        return cachedData.value.members;
      }

      console.log(`Fetching data from GitHub for org: ${org}`);
      const members = await fetchOrganizationMembers(org, token);
      const dataToStore: CachedMembers = {
        members,
        timestamp: Date.now(),
      };
      await kv.set(["members", org], dataToStore);
      return members;
    } finally {
      kv.close();
    }
  } catch (e) {
    console.error("Error fetching or caching organization members:", e);
    throw new Error("Failed to load team members.");
  }
}

/**
 * API route handler for fetching organization members.
 * @param {Request} request The incoming request.
 * @returns {Promise<Response>} A promise that resolves to a response.
 */
export default async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const org = url.searchParams.get("org");

  if (!org) {
    return new Response("Missing 'org' parameter", { status: 400 });
  }

  try {
    const members = await getOrganizationMembers(org);
    return new Response(JSON.stringify(members), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    let message = "An unexpected error occurred.";
    if (e instanceof Error) {
      message = e.message;
      console.error("Error in API route:", e);
    } else {
      console.error("An unknown error occurred:", e);
    }
    return new Response(message, { status: 500 });
  }
};
