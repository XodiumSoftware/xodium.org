/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

/// <reference lib="deno.unstable" />

import {HOUR} from "$std/datetime/constants.ts";

export const CONFIG = { version: "2.1.1" };

export const GITHUB = {
  api: {
    url: "https://api.github.com",
    version: "2022-11-28",
    members: { cacheExpiry: HOUR },
  },
  org: {
    name: "XodiumSoftware",
    user_agent: "XodiumSoftware/xodium.org",
  },
};

/**
 * KV store manager to avoid opening/closing repeatedly
 */
export const kvStore = {
  kv: null as Deno.Kv | null,

  async getKv(): Promise<Deno.Kv> {
    return this.kv ??= await Deno.openKv();
  },

  close(): void {
    this.kv?.close();
    this.kv = null;
  },

  async getItem<T>(
    key: Deno.KvKey,
  ): Promise<{ value: { data: T; timestamp: number } | null }> {
    const local = this.getFromLocalStorage<T>(key);
    if (local) return { value: local };

    const kv = await this.getKv();
    const result = await kv.get<{ data: T; timestamp: number }>(key);
    return { value: result.value ?? null };
  },

  async setItem<T>(key: Deno.KvKey, value: T): Promise<void> {
    const record = { data: value, timestamp: Date.now() };
    const kv = await this.getKv();
    this.setToLocalStorage(key, record) || await kv.set(key, record);
  },

  getFromLocalStorage<T>(
    key: Deno.KvKey,
  ): { data: T; timestamp: number } | null {
    try {
      return typeof localStorage !== "undefined"
        ? JSON.parse(localStorage.getItem(key.join(":")) ?? "null")
        : null;
    } catch (e) {
      console.error("Error getting item from localStorage:", e);
      return null;
    }
  },

  setToLocalStorage<T>(
    key: Deno.KvKey,
    record: { data: T; timestamp: number },
  ): boolean {
    try {
      localStorage?.setItem(key.join(":"), JSON.stringify(record));
      return true;
    } catch (e) {
      console.error("Error setting item to localStorage:", e);
      return false;
    }
  },
};
