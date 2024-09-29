// xodium.utils.github.ts
import axiod from "axiod/mod";
import { IConfig } from "axiod/interfaces";
import { LocalStorageService } from "xodium/utils/localstorage";

/**
 * Represents a GitHub user with essential details.
 *
 * @interface GitHubUser
 *
 * @property {number} id - The unique identifier for the user.
 * @property {string} login - The username of the GitHub user.
 * @property {string} avatar_url - The URL to the user's avatar image.
 * @property {string} html_url - The URL to the user's GitHub profile.
 * @property {string} role - The role of the user within a specific context.
 */
interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  role: string;
}

/**
 * Represents the valid keys for fetching data.
 *
 * @type FetchDataKey
 */
type FetchDataKey = "members";

const FETCH_DATA_MAP: Map<FetchDataKey, { url: string; config?: IConfig }> =
  new Map([
    [
      "members",
      {
        url: "https://api.github.com/orgs/XodiumSoftware/public_members",
        config: {
          headers: { Accept: "application/vnd.github+json" },
        },
      },
    ],
  ]);

/**
 * A service for interacting with the GitHub API.
 */
export class GithubService {
  /**
   * Fetches the list of public members of the XodiumSoftware organization from GitHub.
   *
   * @returns {Promise<GitHubUser[]>} A promise that resolves to an array of GitHubUser objects.
   */
  static async fetchData(key: FetchDataKey): Promise<GitHubUser[]> {
    const results: GitHubUser[] = [];
    const fetchData = FETCH_DATA_MAP.get(key);
    if (fetchData) {
      const { url, config } = fetchData;
      const response = await axiod.get<GitHubUser[]>(url, config);
      results.push(...response.data);
    }
    return results;
  }

  /**
   * Stores GitHub data in local storage.
   *
   * This method retrieves GitHub data from local storage if available.
   * If not, it fetches the data from a remote source using the provided fetch function and stores it in local storage.
   * Additionally, it ensures that each user's avatar data is also stored in local storage.
   *
   * @param {() => Promise<GitHubUser[]>} fetchFunction - The function to fetch data from GitHub.
   * @param {string} storageKey - The key to store the data in local storage.
   * @returns {Promise<GitHubUser[]>} A promise that resolves to an array of GitHubUser objects.
   */
  static async storeData(
    fetchFunction: () => Promise<GitHubUser[]>,
    storageKey: string
  ): Promise<GitHubUser[]> {
    const data = LocalStorageService.getItem(storageKey);
    let items: GitHubUser[] | null = null;
    if (data && Array.isArray(data)) {
      items = data as GitHubUser[];
    } else {
      items = await fetchFunction();
      LocalStorageService.setItem(storageKey, items);
    }
    return items;
  }

  /**
   * Retrieves GitHub data from local storage or fetches it if not available.
   *
   * @param {string} key - The key to store the data in local storage.
   * @returns {Promise<GitHubUser[]>} A promise that resolves to an array of GitHubUser objects.
   */
  static async getData(key: FetchDataKey): Promise<GitHubUser[]> {
    const data = LocalStorageService.getItem(key);
    if (data && Array.isArray(data)) {
      return data as GitHubUser[];
    } else {
      const items = await this.fetchData(key);
      LocalStorageService.setItem(key, items);
      return items;
    }
  }
}
