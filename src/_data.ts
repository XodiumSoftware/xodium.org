/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import { GithubService } from "xodium/utils/github";

/**
 * Represents a member of GitHub with relevant profile information.
 *
 * @interface GitHubMember
 *
 * @property {string} login - The username of the GitHub member.
 * @property {string} avatar_url - The URL to the avatar image of the GitHub member.
 * @property {string} html_url - The URL to the GitHub member's profile page.
 */
interface GitHubMember {
  login: string;
  avatar_url: string;
  html_url: string;
}

/**
 * Fetches the list of GitHub members.
 *
 * @returns {Promise<GitHubMember[]>} A promise that resolves to an array of GitHub members.
 */
export const getMembers = (): Promise<GitHubMember[]> =>
  GithubService.getData("members");
