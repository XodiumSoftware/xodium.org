/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {GITHUB, kvStore} from "./constants.ts";

/**
 * Cache class that handles in-memory and KV store caching
 */
export class Cache {
  private memoryCache: Map<string, { data: unknown; expiry: number }>;

  constructor() {
    this.memoryCache = new Map();
  }

  /**
   * Retrieves data from the in‑memory cache or kvStore if not available locally.
   * @template T - The type of cached data.
   * @param {string} cacheKey - The cache key.
   * @param {string} org - The organization namespace.
   * @returns {Promise<T | null>} The cached data or null if expired/missing.
   */
  async get<T>(cacheKey: string, org: string): Promise<T | null> {
    const key = `${org}:${cacheKey}`;
    const localEntry = this.memoryCache.get(key);
    if (localEntry && Date.now() < localEntry.expiry) {
      return localEntry.data as T;
    }
    const result = await kvStore.get<{ data: T; expiry: number }>([
      org,
      cacheKey,
    ]);
    if (!result.value || Date.now() > result.value.expiry) {
      return null;
    }
    this.memoryCache.set(key, {
      data: result.value.data,
      expiry: result.value.expiry,
    });
    return result.value.data;
  }

  /**
   * Saves data to kvStore and updates the in‑memory cache.
   * @template T - The type of data to cache.
   * @param {string} cacheKey - The cache key.
   * @param {string} org - The organization namespace.
   * @param {T} data - The data to cache.
   * @param {number} cacheExpiry - Cache expiry time in milliseconds.
   * @returns {Promise<void>} A promise that resolves once saving is complete.
   */
  async set<T>(
    cacheKey: string,
    org: string,
    data: T,
    cacheExpiry: number = GITHUB.api.members.cacheExpiry,
  ): Promise<void> {
    const expiryTimestamp = Date.now() + cacheExpiry;
    await kvStore.set([org, cacheKey], { data, expiry: expiryTimestamp });
    const key = `${org}:${cacheKey}`;
    this.memoryCache.set(key, { data, expiry: expiryTimestamp });
  }

  /**
   * Clears the in-memory cache for a specific key prefix.
   * @param prefix
   */
  clearByKey(prefix: string): void {
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Clears all the in-memory cache.
   */
  clearAll(): void {
    this.memoryCache.clear();
  }
}

export const cache = new Cache();
