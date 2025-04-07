/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {getOrganizationData} from "../../../../utils/utils.ts";

export interface Repo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
}

/**
 * API route handler for fetching organization projects.
 * @param {Request} request The incoming request.
 * @returns {Promise<Response>} A promise that resolves to a response containing the project data.
 */
export default async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const org = url.searchParams.get("org");

  if (!org) {
    return new Response("Missing 'org' parameter", { status: 400 });
  }

  try {
    const projects = await getOrganizationData<Repo[]>(
      "repos",
      org,
      `/orgs/${org}/repos`,
    );
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
