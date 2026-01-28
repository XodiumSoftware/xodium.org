import {Dexie, type EntityTable} from "dexie";

if (typeof window === "undefined") {
    const {default: indexedDB} = await import("fake-indexeddb");
    const IDBKeyRange = (await import("fake-indexeddb/lib/FDBKeyRange")).default;

    Dexie.dependencies.indexedDB = indexedDB;
    Dexie.dependencies.IDBKeyRange = IDBKeyRange;
}

/** Interface representing a cached data item */
export interface CachedData<T> {
    id?: number;
    key: string;
    data: T;
    timestamp: number;
    expiry?: number;
}

/** Dexie database for caching GitHub API responses */
class GitHubCacheDB extends Dexie {
    public cache!: EntityTable<CachedData<unknown>, "id">;

    constructor() {
        super("GitHubCache");

        this.version(1).stores({
            cache: "++id, &key, timestamp",
        });
    }
}

const db = new GitHubCacheDB();

/** BrowserStore provides methods to interact with IndexedDB for caching */
export const BrowserStore = {
    /**
     * Retrieves an item from the cache if it exists and is not expired.
     * @param keyParts - Array of strings to form the key.
     * @param expiryMs - Expiry time in milliseconds (default is 1 hour).
     * @return A promise that resolves to the cached data or null if not found/expired.
     */
    async getItem<T>(
        keyParts: string[],
        expiryMs: number = 60 * 60 * 1000,
    ): Promise<T | null> {
        try {
            const key = generateKey(keyParts);
            const result = await db.cache.where("key").equals(key).first();

            if (!result) return null;

            const now = Date.now();
            if (now - result.timestamp < expiryMs) {
                console.log(`Using cached data for key: ${key}`);
                return result.data as T;
            }

            await db.cache.where("key").equals(key).delete();
            return null;
        } catch (error) {
            console.error("Error reading from IndexedDB:", error);
            return null;
        }
    },

    /**
     * Stores an item in the cache with the specified key parts.
     * @param keyParts - Array of strings to form the key.
     * @param value - The data to be cached.
     * @return A promise that resolves when the operation is complete.
     */
    async setItem<T>(keyParts: string[], value: T): Promise<void> {
        try {
            const key = generateKey(keyParts);
            const record: CachedData<T> = {
                key,
                data: value,
                timestamp: Date.now(),
            };

            await db.cache.where("key").equals(key).delete();
            await db.cache.add(record);
        } catch (error) {
            console.error("Error writing to IndexedDB:", error);
        }
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
