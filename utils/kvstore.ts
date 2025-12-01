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

  async getKv(): Promise<Deno.Kv> {
    if (!this.kv) {
      this.kv = await Deno.openKv();
      this.registerShutdownHooks();
    }
    return this.kv;
  },

  close(): void {
    this.kv?.close();
    this.kv = null;
  },

  async getItem<T>(key: Deno.KvKey): Promise<T | null> {
    const kv = await this.getKv();
    const result = await kv.get<KvData<T>>(key);
    return result.value ? result.value.data : null;
  },

  async setItem<T>(key: Deno.KvKey, value: T): Promise<void> {
    const kv = await this.getKv();
    const record: KvData<T> = { data: value, timestamp: Date.now() };
    await kv.set(key, record);
  },

  registerShutdownHooks(): void {
    const shutdown = () => this.close();
    addEventListener("unload", shutdown);
    Deno.addSignalListener("SIGINT", shutdown);
    Deno.addSignalListener("SIGTERM", shutdown);
  },
};
