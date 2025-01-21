/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import axiod from "axiod/mod";
import {IConfig} from "axiod/interfaces";
import {LocalStorageService} from "xodium/utils/localstorage";

/**
 * Represents the valid keys for fetching data.
 *
 * @type FetchDataKey
 */
type FetchDataKey = "members";

const FETCH_DATA_MAP: Record<FetchDataKey, { url: string; config?: IConfig }> =
  {
    members: {
      url: "https://api.github.com/orgs/XodiumSoftware/public_members",
      config: { headers: { Accept: "application/vnd.github+json" } },
    },
  };

/**
 * A service for interacting with the GitHub API.
 */
export class GithubService {
  /**
   * Fetches data from a remote source.
   *
   * @template T The type of data to be fetched.
   * @param {FetchDataKey} key - The key to fetch data from the remote source.
   * @returns {Promise<T[]>} A promise that resolves to an array of objects of type T.
   */
  static async fetchData<T>(key: FetchDataKey): Promise<T[]> {
    const { url, config } = FETCH_DATA_MAP[key];
    return (await axiod.get<T[]>(url, config)).data;
  }

  /**
   * Gets data from local storage if available, otherwise fetches it from a remote source.
   *
   * @template T The type of data to be fetched.
   * @param {FetchDataKey} key - The key to fetch data from the remote source.
   * @returns {Promise<T[]>} A promise that resolves to an array of objects of type T.
   */
  static async getData<T>(key: FetchDataKey): Promise<T[]> {
    let items = LocalStorageService.getItem(key) as T[] | null;
    if (!items) {
      items = await this.fetchData(key);
      LocalStorageService.setItem(key, items);
    }
    return items;
  }
}
