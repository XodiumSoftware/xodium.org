/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {GITHUB, kvStore} from "./constants.ts";

export interface CacheOptions {
  expireIn: number;
}

/**
 * Cache utility class for managing cached data with expiration support.
 * Provides methods to get, set, and delete cached entries using key-value storage.
 * Each entry is stored with a timestamp to handle automatic expiration.
 */
export class Cache {
  /**
   * Get data from cache if valid and not expired
   * @param key The unique identifier for the cached item
   * @param namespace The category or grouping for the cached item
   * @returns Promise resolving to the cached data if valid, or null if expired/not found
   */
  async get<T>(key: string, namespace: string): Promise<T | null> {
    const { value } = await kvStore.get<{ data: T; timestamp: number }>([
      key,
      namespace,
    ]);
    return value &&
        Date.now() - value.timestamp < GITHUB.api.members.cacheExpiry
      ? value.data
      : null;
  }

  /**
   * Store data in cache with timestamp
   * @param key The unique identifier for the cached item
   * @param namespace The category or grouping for the cached item
   * @param data The data to be cached
   * @param options Optional configuration for cache behavior including expiration time
   * @returns Promise that resolves when the data is successfully cached
   */
  async set<T>(
    key: string,
    namespace: string,
    data: T,
    options?: CacheOptions,
  ): Promise<void> {
    await kvStore.set([key, namespace], {
      data,
      timestamp: Date.now(),
      expiry: options?.expireIn || GITHUB.api.members.cacheExpiry,
    });
  }

  /**
   * Remove an item from cache
   * @param key The unique identifier for the cached item to delete
   * @param namespace The category or grouping for the cached item to delete
   * @returns Promise that resolves when the item is successfully removed
   */
  async delete(key: string, namespace: string): Promise<void> {
    await (await kvStore.getKv()).delete([key, namespace]);
  }
}

export const cache = new Cache();
