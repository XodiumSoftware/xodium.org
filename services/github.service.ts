/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import { LocalStorageService } from "./localstorage.service.ts";
import { FETCH_DATA_MAP } from "../utils/constants.ts";

/**
 * A service for interacting with the GitHub API.
 */
export class GithubService {
  /**
   * Stores data in local storage if not already available.
   *
   * @template T The type of data to be stored.
   * @param {() => Promise<T[]>} fetchFunction - A function that fetches data from a remote source.
   * @param {string} storageKey - The key to store the data in local storage.
   * @returns {Promise<T[]>} A promise that resolves to an array of objects of type T.
   */
  static async storeData<T>(
    fetchFunction: () => Promise<T[]>,
    storageKey: string,
  ): Promise<T[]> {
    const cached = LocalStorageService.getItem(storageKey) as T[] | null;
    if (cached) return cached;
    const data = await fetchFunction();
    LocalStorageService.setItem(storageKey, data);
    return data;
  }

  /**
   * Gets data from local storage if available, otherwise fetches it from a remote source.
   *
   * @template T The type of data to be fetched.
   * @param {string} key - The key to fetch data from local storage.
   * @returns {Promise<T[]>} A promise that resolves to an array of objects of type T.
   */
  static async getData<T>(key: string): Promise<T[]> {
    const cached = LocalStorageService.getItem(key) as T[] | null;
    if (cached) return cached;
    const data = await this.fetchData<T>(key);
    LocalStorageService.setItem(key, data);
    return data;
  }

  /**
   * Fetches data from a remote source using the native fetch API.
   *
   * @template T - The type of data to be fetched.
   * @param {string} key - The key to fetch data from a remote source.
   * @returns {Promise<T[]>} A promise that resolves to an array of objects of type T.
   * @throws Will throw an error if no mapping is found or the fetch fails.
   */
  private static async fetchData<T>(key: string): Promise<T[]> {
    const mapping = FETCH_DATA_MAP[key];
    if (!mapping) throw new Error(`No mapping found for key: ${key}`);
    const response = await fetch(mapping.url, mapping.config);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    return response.json() as Promise<T[]>;
  }
}
