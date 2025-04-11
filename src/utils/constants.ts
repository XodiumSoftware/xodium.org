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

  async get<T>(key: Deno.KvKey): Promise<Deno.KvEntryMaybe<T>> {
    return (await this.getKv()).get<T>(key);
  },

  async set<T>(key: Deno.KvKey, value: T): Promise<Deno.KvCommitResult> {
    return (await this.getKv()).set(key, value);
  },
};
