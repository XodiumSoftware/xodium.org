import { GH_ORGNAME, GH_REPONAMES } from "./illyrion.constants.js";

class GithubAPI {
  static async fetchOrgMembers() {
    const response = await fetch(
      `https://api.github.com/orgs/${GH_ORGNAME}/members`,
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
      }
    );
    return response.json();
  }

  static async fetchProjectInfo(repoName: string) {
    const response = await fetch(
      `https://api.github.com/repos/${GH_ORGNAME}/${repoName}/releases/latest`,
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
      }
    );
    return response.json();
  }
}

class LocalStorageService {
  static setItem(key: string, value: any) {
    const item = {
      value: value,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(item));
  }
  static getItem(key: string) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
}

class UtilsGithub {
  constructor() {
    Promise.all([
      this.fetchAndStoreOrgMembers(),
      this.fetchAndStoreProjectInfo(),
    ]).catch((error) => {
      console.error("Error fetching data:", error);
    });
  }

  async fetchAndStoreOrgMembers() {
    let membersData = LocalStorageService.getItem("members");
    let members = membersData ? membersData.value : null;
    if (!members) {
      members = await GithubAPI.fetchOrgMembers();
      LocalStorageService.setItem("members", members);
    }
    this.populateTeamGrid(members);
  }

  async fetchAndStoreProjectInfo() {
    for (const repoName of GH_REPONAMES) {
      let projectInfoData = LocalStorageService.getItem(
        `latest_release_${repoName}`
      );
      let latestVersion = projectInfoData ? projectInfoData.version : null;
      if (!latestVersion) {
        const response = await GithubAPI.fetchProjectInfo(repoName);
        latestVersion =
          response.message === "Not Found" ? "N.A." : response.tag_name;
        LocalStorageService.setItem(
          `latest_release_${repoName}`,
          latestVersion
        );
      }
      this.setVersionInfoText(repoName, latestVersion);
    }
  }

  private populateTeamGrid(members: any[]): void {
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

  private setVersionInfoText(repoName: string, version: string): void {
    const els = document.querySelectorAll(`.${repoName}-version`);
    if (els) {
      els.forEach((el) => {
        el.innerHTML = `<i class="fas fa-solid fa-tag"> ${version}</i>`;
      });
    } else {
      console.error(`Element with class ".${repoName}-version" not found`);
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  new UtilsGithub();
});
