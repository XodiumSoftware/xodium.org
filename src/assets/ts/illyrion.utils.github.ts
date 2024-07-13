// illyrion.utils.github.ts

import { GH_ORGNAME } from "./illyrion.constants";

class UtilsGithub {
  constructor() {
    this.fetchOrgMembers();
  }

  async fetchOrgMembers(): Promise<void> {
    const oneHour = 60 * 60 * 1000;
    let members = JSON.parse(localStorage.getItem("members") || "null");
    let timestamp = Number(localStorage.getItem("timestamp"));

    if (!members || !timestamp || Date.now() - timestamp > oneHour) {
      const response = await fetch(
        `https://api.github.com/orgs/${GH_ORGNAME}/members`,
        {
          headers: {
            Accept: "application/vnd.github+json",
          },
        }
      );
      members = await response.json();
      localStorage.setItem("members", JSON.stringify(members));
      localStorage.setItem("timestamp", Date.now().toString());
    }
    this.populateTeamGrid(members);
  }

  populateTeamGrid(members: any[]): void {
    const grid = document.querySelector(".team-grid");
    if (grid) {
      members.forEach((member) => {
        const card = document.createElement("div");
        card.className = "member-card";
        card.innerHTML = `
          <a href="https://github.com/${member.login}" target="_blank">
            <img class="member-icon" src="${member.avatar_url}" alt="${member.login} picture" width="100" height="100">
            <h3>${member.login}</h3>
          </a>
        `;
        grid.appendChild(card);
      });
    } else {
      console.error('Element with class ".team-grid" not found');
    }
  }
}

new UtilsGithub();
