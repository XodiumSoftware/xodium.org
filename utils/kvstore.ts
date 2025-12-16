/// <reference lib="deno.unstable" />

/**
 * The structure for KV store data.
 */
export interface KvData<T> {
  data: T;
  timestamp: number;
}

/**
 * KV store manager.
 */
export const KvStore = {
  kv: null as Deno.Kv | null,

  /**
   * Get the KV store instance, initializing it if necessary.
   * @returns The KV store instance.
   */
  async getKv(): Promise<Deno.Kv> {
    if (!this.kv) {
      this.kv = await Deno.openKv();
      this.registerShutdownHooks();
    }
    return this.kv;
  },

  /** Close the KV store. */
  close(): void {
    this.kv?.close();
    this.kv = null;
  },

  /**
   * Get an item from the KV store.
   * @param key
   * @returns The stored data or null if not found.
   */
  async getItem<T>(key: Deno.KvKey): Promise<T | null> {
    const kv = await this.getKv();
    const result = await kv.get<KvData<T>>(key);
    return result.value ? result.value.data : null;
  },

  /**
   * Set an item in the KV store.
   * @param key
   * @param value
   * @returns A promise that resolves when the item is set.
   */
  async setItem<T>(key: Deno.KvKey, value: T): Promise<void> {
    const kv = await this.getKv();
    const record: KvData<T> = { data: value, timestamp: Date.now() };
    await kv.set(key, record);
  },

  /** Register shutdown hooks to close the KV store on exit signals. */
  registerShutdownHooks(): void {
    const shutdown = () => this.close();
    addEventListener("unload", shutdown);
    Deno.addSignalListener("SIGINT", shutdown);
    Deno.addSignalListener("SIGTERM", shutdown);
  },
};
