/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import { GithubService } from "xodium/utils/github";

/**
 * Represents a GitHub release.
 *
 * @interface GitHubRelease
 *
 * @property {string} name - The name of the release.
 */
interface GitHubRelease {
  name: string;
}

/**
 * Utility class providing various helper methods.
 *
 * @class
 * @classdesc This class contains static methods for adding event listeners, handling toggle and scroll events,
 * toggling arrow direction, and populating a team grid with member data fetched from a GitHub service.
 */
export class Utils {
  /**
   * Replaces the inner HTML content of specified target elements with data fetched from GitHub.
   *
   * @param replacements - An array of objects containing the source, target, and optional fallback content.
   * @param replacements[].source - The key used to fetch data from GitHub.
   * @param replacements[].target - The CSS selector of the target element whose content will be replaced.
   * @param replacements[].fallbackContent - Optional. The content to use if the fetched data is empty or an error occurs. Defaults to "n.a.".
   *
   * @returns A promise that resolves when all replacements are complete.
   * @throws Will log an error to the console if fetching data fails for any target.
   */
  static async replaceContents(
    replacements: {
      source: string;
      target: string;
      fallbackContent?: string;
    }[]
  ): Promise<void> {
    for (const { source, target, fallbackContent = "n.a." } of replacements) {
      try {
        const content = await GithubService.getData<GitHubRelease>(source);
        const el = document.querySelector(target);
        if (el) {
          el.innerHTML =
            Array.isArray(content) && content.length > 0
              ? content[0].name
              : fallbackContent;
        }
      } catch (err) {
        console.error("Error fetching content for target:", target, err);
      }
    }
  }
}
