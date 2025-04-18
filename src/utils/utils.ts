/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

/// <reference lib="deno.unstable" />

import {STATUS_CODE} from "$fresh/server.ts";
import {GITHUB, KvData, KvStore} from "./constants.ts";
import {Octokit} from "@octokit/core";
import {getSessionId} from "../plugins/oauth.ts";

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
 * Generic function to get data with caching.
 * @template T The type of data to be returned
 * @param {string} cacheKey The key prefix to use for caching in Deno KV.
 * @param {string} identifier The specific identifier (e.g. org name, username, session ID) for this data.
 * @param {string} identifierType A descriptive name for the identifier type (e.g. "organisation", "user session") used for logging/errors.
 * @param {string} apiEndpoint The GitHub API endpoint to fetch data from.
 * @param {string | undefined} token The GitHub token to use.
 * @param {number} cacheExpiry The cache expiry time in milliseconds.
 * @returns {Promise<T>} A promise that resolves to the fetched data.
 */
async function getCachedData<T>(
  cacheKey: string,
  identifier: string,
  identifierType: string,
  apiEndpoint: string,
  token?: string,
  cacheExpiry: number = GITHUB.api.members.cacheExpiry,
): Promise<T> {
  try {
    const kvKey = [cacheKey, identifier];
    const result = await KvStore.getItem<KvData<T>>(kvKey);

    if (result && Date.now() - result.timestamp < cacheExpiry) {
      console.log(
        `Using cached data for ${cacheKey} (${identifierType}): ${identifier}`,
      );
      return result.data;
    }

    console.log(
      `Fetching data from GitHub for ${cacheKey} (${identifierType}): ${identifier}`,
    );
    const data = await fetchFromGitHub<T>(apiEndpoint, token);
    await KvStore.setItem(kvKey, {
      data: data,
      timestamp: Date.now(),
    });

    return data;
  } catch (e) {
    console.error(
      `Error fetching or caching ${identifierType} ${cacheKey} (${identifier}):`,
      e,
    );
    throw new Error(
      `Failed to load ${identifierType} ${cacheKey} for ${identifier}.`,
    );
  }
}

/**
 * Creates a generic API route handler for fetching different types of organisation data.
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
    const param = url.searchParams.get("org");
    if (!param) {
      return new Response("Missing 'org' parameter", {
        status: STATUS_CODE.BadRequest,
      });
    }

    try {
      const data = await getCachedData<T>(
        dataType,
        param,
        "organization",
        endpoint.replace("{org}", param),
      );
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error(`Error in ${dataType} API route:`, e);
      return new Response(e instanceof Error ? e.message : String(e), {
        status: STATUS_CODE.InternalServerError,
      });
    }
  };
}

interface SessionData {
  accessToken: string;
}

/**
 * Creates a generic API route handler for fetching data related to the authenticated user.
 * @template T The expected type of the data to be fetched.
 * @param {string} dataType A string identifier for the type of data being fetched (used for caching).
 * @param {string} endpoint The GitHub API endpoint to fetch data from (e.g. "/user", "/user/orgs").
 * @returns {(request: Request) => Promise<Response>} A reusable API route handler.
 */
export function createUserDataHandler<T>(
  dataType: string,
  endpoint: string,
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    const sessionId = await getSessionId(request);

    if (!sessionId) {
      return new Response(
        JSON.stringify({error: "Not authenticated"}),
        {
          status: STATUS_CODE.Unauthorized,
          headers: {"Content-Type": "application/json"},
        },
      );
    }

    try {
      const sessionKey = ["site_sessions", sessionId];
      const sessionResult = await KvStore.getItem<SessionData>(sessionKey);

      if (!sessionResult?.accessToken) {
        console.warn(`Access token not found for session ID: ${sessionId}`);
        return new Response(
          JSON.stringify({error: "Invalid session or token missing"}),
          {
            status: STATUS_CODE.Unauthorized,
            headers: {"Content-Type": "application/json"},
          },
        );
      }

      const data = await getCachedData<T>(
        dataType,
        sessionId,
        "user session",
        endpoint,
        sessionResult.accessToken,
      );

      return new Response(JSON.stringify(data), {
        headers: {"Content-Type": "application/json"},
      });
    } catch (error) {
      console.error(
        `API Error in ${dataType} handler (Session: ${sessionId}):`,
        error,
      );
      const errorMessage = error instanceof Error
        ? error.message
        : "Unknown error";
      return new Response(
        JSON.stringify({error: `Server error: ${errorMessage}`}),
        {
          status: STATUS_CODE.InternalServerError,
          headers: {"Content-Type": "application/json"},
        },
      );
    }
  };
}
