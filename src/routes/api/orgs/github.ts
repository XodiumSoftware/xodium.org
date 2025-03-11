/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

export interface Member {
  login: string;
  avatar_url: string;
  html_url: string;
}

export async function getOrganizationMembers(
  org: string,
  githubToken: string | undefined,
): Promise<Member[]> {
  const url = `https://api.github.com/orgs/${org}/members`;
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (githubToken) {
    headers["Authorization"] = `Bearer ${githubToken}`;
  } else {
    console.warn(
      "GITHUB_TOKEN environment variable not set.  Using unauthenticated requests, which are subject to stricter rate limits.",
    );
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    console.error(
      `GitHub API error: ${response.status} ${response.statusText}`,
    );
    throw new Error("Failed to fetch organization members");
  }

  const members: Member[] = await response.json();
  return members;
}
