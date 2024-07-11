// illyrion.utils.github.mjs

import { GH_ORGNAME, GH_TOKEN } from "./illyrion.constants.mjs";

class GitHubOrgMembers {
  constructor() {
    this.fetchOrgMembers();
  }

  async fetchOrgMembers() {
    const response = await fetch(
      `https://api.github.com/orgs/${GH_ORGNAME}/members`,
      {
        headers: {
          Authorization: GH_TOKEN,
          Accept: "application/vnd.github+json",
        },
      }
    );
    const members = await response.json();
    console.log(members);
    this.populateTeamGrid(members);
  }

  populateTeamGrid(members) {
    const grid = document.querySelector(".team-grid");
    members.forEach((member) => {
      const card = document.createElement("div");
      card.className = "member-card";
      card.innerHTML = `
        <a href="https://github.com/${member.login}" target="_blank">
          <img src="${member.avatar_url}" alt="${member.login}" width="100" height="100">
          <h3>${member.login}</h3>
        </a>
      `;
      grid.appendChild(card);
    });
  }
}

new GitHubOrgMembers();
