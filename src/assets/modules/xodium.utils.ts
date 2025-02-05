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
 * Utility class for common functions.
 */
export class Utils {
  /**
   * Populates the team grid with member data fetched from the GitHub service.
   *
   * This function retrieves member information from the GitHub service and dynamically
   * creates and appends list items to the team grid in the DOM. Each list item contains
   * member details such as their avatar, login name, and role.
   *
   * @returns {Promise<void>} A promise that resolves when the team grid has been populated.
   *
   * @throws Will log an error to the console if there is an issue fetching the team members.
   */
  static async populateTeamCards(): Promise<void> {
    try {
      const members = await GithubService.getData<GitHubMember>("members");
      const cards = document.querySelector<HTMLUListElement>(".team-cards");
      if (!cards || !Array.isArray(members)) {
        console.warn(
          "Team cards container or member data is missing or invalid."
        );
        return;
      }

      const fragment = document.createDocumentFragment();
      members.forEach((member) => {
        const card = document.createElement("li");
        card.classList.add("mb-4");

        const container = document.createElement("div");
        container.classList.add("flex", "items-center", "gap-x-6");

        const link = document.createElement("a");
        link.href = member.html_url;

        const img = document.createElement("img");
        img.classList.add("h-16", "w-16", "rounded-full");
        img.src = member.avatar_url;
        img.alt = `${member.login} profile picture`;
        link.appendChild(img);

        const infoDiv = document.createElement("div");
        const nameLink = document.createElement("a");
        nameLink.href = member.html_url;
        nameLink.textContent = member.login;

        const nameHeading = document.createElement("h3");
        nameHeading.classList.add(
          "text-base",
          "font-semibold",
          "leading-7",
          "tracking-tight",
          "text-gray-900",
          "dark:text-slate-100"
        );

        nameHeading.appendChild(nameLink);
        infoDiv.appendChild(nameHeading);
        container.appendChild(link);
        container.appendChild(infoDiv);
        card.appendChild(container);
        fragment.appendChild(card);

        const toggleHighlight = (highlight: boolean) => {
          const highlightColor = "#CB2D3E";
          img.style.outline = highlight ? `2px solid ${highlightColor}` : "";
          nameHeading.style.color = highlight ? highlightColor : "";
        };

        card.addEventListener("mouseenter", () => toggleHighlight(true));
        card.addEventListener("mouseleave", () => toggleHighlight(false));
      });

      cards.appendChild(fragment);
    } catch (err) {
      console.error("Error fetching team members:", err);
    }
  }
}
