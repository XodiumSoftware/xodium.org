/** Interface representing cached data with a key, data, and timestamp. */
export interface CachedData<T> {
  key: string;
  data: T;
  timestamp: number;
}

/** Options for memory cache operations. */
export interface MemoryCacheOptions {
  expiryMs?: number;
}

const memoryCache = new Map<string, CachedData<unknown>>();

/** In-memory cache store with get, set, clear, and delete methods. */
export const MemoryStore = {
  /**
   * Retrieves an item from the cache if it exists and is not expired.
   * @param keyParts - Array of strings to form the key.
   * @param options - Cache options (expiry).
   * @returns Cached data or null if not found/expired.
   */
  getItem<T>(
    keyParts: string[],
    options: MemoryCacheOptions = {},
  ): T | null {
    const key = generateKey(keyParts);
    const expiryMs = options.expiryMs ?? 60 * 60 * 1000;
    const record = memoryCache.get(key) as CachedData<T> | undefined;

    if (!record) return null;

    const now = Date.now();

    if (now - record.timestamp < expiryMs) return record.data;

    memoryCache.delete(key);
    return null;
  },

  /**
   * Stores an item in the cache with the specified key parts.
   * @param keyParts - Array of strings to form the key.
   * @param value - The data to be cached.
   */
  setItem<T>(keyParts: string[], value: T): void {
    const key = generateKey(keyParts);
    const record: CachedData<T> = {
      key,
      data: value,
      timestamp: Date.now(),
    };

    memoryCache.set(key, record as CachedData<unknown>);
  },
};

/**
 * Generates a unique key by joining key parts with a colon.
 * @param keyParts - Array of strings to form the key.
 * @returns A single string key.
 */
function generateKey(keyParts: string[]): string {
  return keyParts.join(":");
}
