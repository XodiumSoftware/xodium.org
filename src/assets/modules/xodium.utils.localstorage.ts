// xodium.utils.localstorage.ts

/**
 * Represents an item to be stored in local storage with an optional expiry time and version.
 *
 * @interface StoredItem
 *
 * @property {string | number | boolean | object} value - The value of the stored item.
 * @property {number} expiry - The expiry time of the stored item in milliseconds since the Unix epoch.
 * @property {string} [version] - An optional version identifier for the stored item.
 */
interface StoredItem {
  value: string | number | boolean | object;
  expiry?: number;
}

/**
 * A service for interacting with the browser's local storage with support for item expiry.
 */
export class LocalStorageService {
  /**
   * Stores an item in the local storage with an expiry time.
   *
   * @param key - The key under which the item is stored.
   * @param value - The value to be stored. Can be a string, number, boolean, or object.
   * @param expiryInMinutes - The time in minutes after which the item expires. Defaults to 60 minutes.
   */
  static setItem(
    key: string,
    value: string | number | boolean | object,
    expiryInMinutes = 60
  ) {
    localStorage.setItem(
      key,
      JSON.stringify({
        value: value,
        expiry: Date.now() + expiryInMinutes * 60 * 1000,
      })
    );
  }

  /**
   * Retrieves an item from local storage by its key.
   *
   * @param key - The key of the item to retrieve.
   * @returns The stored item if it exists and has not expired, otherwise `null`.
   */
  static getItem(key: string): string | number | boolean | object | null {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    try {
      const item: StoredItem = JSON.parse(itemStr);
      if (item.expiry && Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return item.value;
    } catch (e) {
      console.error("Error parsing stored item", e);
      return null;
    }
  }
}
