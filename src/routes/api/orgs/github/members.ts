/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

/// <reference lib="deno.unstable" />

import {getOrganizationData} from "../../../../utils/utils.ts";

export interface Member {
  login: string;
  avatar_url: string;
  html_url: string;
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
    const members = await getOrganizationData<Member[]>(
      "members",
      org,
      `/orgs/${org}/members`,
    );
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
