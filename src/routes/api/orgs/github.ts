/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

/// <reference lib="deno.unstable" />

import { github } from "../../../utils/constants.ts";

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
 * getOrganizationMembers function to fetch organization members.
 * @param {string} org The organization to fetch members from.
 * @param {string | undefined} token The GitHub token to use.
 * @returns {Promise<Member[]>} Promise<Member[]>
 */
export async function getOrganizationMembers(
  org: string,
  token: string | undefined,
): Promise<Member[]> {
  try {
    const kv = await Deno.openKv();
    const cachedData = await kv.get<CachedMembers>(["members"]);

    if (
      cachedData.value &&
      Date.now() - cachedData.value.timestamp < github.api.members.cacheExpiry
    ) {
      console.log("Using cached data");
      kv.close();
      return cachedData.value.members;
    } else {
      console.log("Fetching data from GitHub");
      const headers = new Headers({
        "User-Agent": "XodiumSoftware/xodium.org",
        ...(token ? { Authorization: `token ${token}` } : {}),
        "X-GitHub-Api-Version": "2022-11-28",
      });

      const response = await fetch(
        `${github.api.url}/orgs/${org}/members`,
        { headers },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch organization members: ${response.status} ${response.statusText}`,
        );
      }

      const fetchedMembers: Member[] = await response.json();

      const dataToStore: CachedMembers = {
        members: fetchedMembers,
        timestamp: Date.now(),
      };
      await kv.set(["members"], dataToStore);
      kv.close();
      return fetchedMembers;
    }
  } catch (e) {
    console.error("Error fetching or caching organization members:", e);
    throw new Error("Failed to load team members.");
  }
}

export default async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const org = url.searchParams.get("org");

  if (!org) {
    return new Response("Missing 'org' parameter", { status: 400 });
  }

  try {
    const members = await getOrganizationMembers(org, undefined);
    return new Response(JSON.stringify(members), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return new Response(error.message, { status: 500 });
  }
};
