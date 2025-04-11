/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {GITHUB, kvStore} from "./constants.ts";

export interface CacheOptions {
  expireIn: number;
}

export class Cache {
  /**
   * Get data from cache if valid and not expired
   */
  async get<T>(key: string, namespace: string): Promise<T | null> {
    const cachedEntry = await kvStore.get<{ data: T; timestamp: number }>([
      key,
      namespace,
    ]);

    if (!cachedEntry.value) return null;

    const { data, timestamp } = cachedEntry.value;
    const isExpired = Date.now() - timestamp >= GITHUB.api.members.cacheExpiry;

    return isExpired ? null : data;
  }

  /**
   * Store data in cache with timestamp
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
   */
  async delete(key: string, namespace: string): Promise<void> {
    await (await kvStore.getKv()).delete([key, namespace]);
  }
}

// Create a singleton instance
export const cache = new Cache();
