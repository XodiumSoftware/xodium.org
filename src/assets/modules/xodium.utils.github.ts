// xodium.utils.github.ts
import axiod from "axiod";
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
 * A service for interacting with the GitHub API.
 */
export class GithubService {
  /**
   * Fetches the list of public members of the XodiumSoftware organization from GitHub.
   *
   * @returns {Promise<GitHubUser[]>} A promise that resolves to an array of GitHubUser objects.
   */
  static async fetchData(): Promise<GitHubUser[]> {
    const response = await axiod.get<GitHubUser[]>(
      `https://api.github.com/orgs/XodiumSoftware/public_members`,
      {
        headers: { Accept: "application/vnd.github+json" },
      }
    );
    return response.data;
  }

  /**
   * Fetches and stores GitHub organization members in local storage.
   *
   * This method first attempts to retrieve the members from local storage. If the members
   * are not found or the data is not in the expected format, it fetches the members from
   * the GitHub API and stores them in local storage.
   *
   * For each member, it checks if the avatar data is already stored in local storage. If not,
   * it fetches the avatar data from the provided URL and stores it in local storage.
   *
   * @returns {Promise<GitHubUser[]>} A promise that resolves to an array of GitHubUser objects.
   */
  static async StoreOrgMembers(): Promise<GitHubUser[]> {
    const membersData = LocalStorageService.getItem("members");
    let members: GitHubUser[] | null = null;
    if (membersData && Array.isArray(membersData)) {
      members = membersData as GitHubUser[];
    } else {
      members = await this.fetchData();
      LocalStorageService.setItem("members", members);
    }
    members.forEach((member) => {
      const avatarData = LocalStorageService.getItem(`avatar_${member.login}`);
      if (!avatarData) {
        axiod.get(member.avatar_url).then((response) => {
          LocalStorageService.setItem(`avatar_${member.login}`, response.data);
        });
      }
    });
    return members;
  }
}
