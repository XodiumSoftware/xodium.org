/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

/// <reference lib="deno.unstable" />

import { GITHUB } from "../../../../utils/constants.ts";
import { fetchFromGitHub } from "../../../../utils/utils.ts";

export interface Repo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
}

interface CachedRepos {
  repos: Repo[];
  timestamp: number;
}

/**
 * Gets organization projects (repositories), using cached data if available and valid.
 * @param {string} org The organization to fetch projects from.
 * @param {string | undefined} token The GitHub token to use.
 * @returns {Promise<Repo[]>} A promise that resolves to an array of repositories.
 */
async function getOrganizationProjects(
  org: string,
  token?: string,
): Promise<Repo[]> {
  try {
    const kv = await Deno.openKv();
    try {
      const cachedData = await kv.get<CachedRepos>(["repos", org]);
      if (
        cachedData.value &&
        Date.now() - cachedData.value.timestamp < GITHUB.api.members.cacheExpiry
      ) {
        console.log(`Using cached projects for org: ${org}`);
        return cachedData.value.repos;
      }

      console.log(`Fetching projects from GitHub for org: ${org}`);
      const repos = await fetchFromGitHub<Repo[]>(`/orgs/${org}/repos`, token);
      const dataToStore: CachedRepos = {
        repos,
        timestamp: Date.now(),
      };
      await kv.set(["repos", org], dataToStore);
      return repos;
    } finally {
      kv.close();
    }
  } catch (e) {
    console.error("Error fetching or caching organization projects:", e);
    throw new Error("Failed to load organization projects.");
  }
}

/**
 * API route handler for fetching organization projects.
 * @param {Request} request The incoming request.
 * @returns {Promise<Response>} A promise that resolves to a response containing the projects data.
 */
export default async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const org = url.searchParams.get("org");

  if (!org) {
    return new Response("Missing 'org' parameter", { status: 400 });
  }

  try {
    const projects = await getOrganizationProjects(org);
    return new Response(JSON.stringify(projects), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    let message = "An unexpected error occurred.";
    if (e instanceof Error) {
      message = e.message;
      console.error("Error in projects API route:", e);
    } else {
      console.error("An unknown error occurred:", e);
    }
    return new Response(message, { status: 500 });
  }
};
