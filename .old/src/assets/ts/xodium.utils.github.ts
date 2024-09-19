import axios from "axios";
import moment from "moment";
import { GH_ORGNAME, GH_REPONAMES } from "./xodium.constants";

interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
}

interface GitHubRelease {
  url: string;
  tag_name: string;
  name: string;
  body: string;
}

interface Member {
  login: string;
  avatar_url: string;
}

class GithubAPI {
  static async fetchOrgMembers(): Promise<GitHubUser[]> {
    const response = await axios.get<GitHubUser[]>(
      `https://api.github.com/orgs/${GH_ORGNAME}/public_members`,
      {
        headers: { Accept: "application/vnd.github+json" },
      }
    );
    return response.data;
  }

  static async fetchProjectInfo(
    repoName: string
  ): Promise<GitHubRelease | null> {
    const releasesResponse = await axios.get<GitHubRelease[]>(
      `https://api.github.com/repos/${GH_ORGNAME}/${repoName}/releases`,
      {
        headers: { Accept: "application/vnd.github+json" },
      }
    );

    if (releasesResponse.data.length === 0) {
      return null;
    }

    const latestReleaseResponse = await axios.get<GitHubRelease>(
      `https://api.github.com/repos/${GH_ORGNAME}/${repoName}/releases/latest`,
      {
        headers: { Accept: "application/vnd.github+json" },
      }
    );
    return latestReleaseResponse.data;
  }
}

class LocalStorageService {
  static setItem(
    key: string,
    value: string | number | boolean | object,
    expiryInMinutes = 60
  ) {
    const item = {
      value: value,
      expiry: moment().add(expiryInMinutes, "minutes").unix(),
    };
    localStorage.setItem(key, JSON.stringify(item));
  }
  static getItem(key: string): any {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
      return null;
    }
    const item = JSON.parse(itemStr);
    const now = moment().unix();
    if (now > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  }
}

class UtilsGithub {
  private uiUpdater = new UIUpdater();
  constructor() {
    this.StoreOrgMembers().catch(console.error);
    this.StoreProjectInfo().catch(console.error);
  }

  async StoreOrgMembers() {
    const membersData = LocalStorageService.getItem("members");
    let members = membersData ? membersData.value : null;
    if (!members) {
      members = await GithubAPI.fetchOrgMembers();
      LocalStorageService.setItem("members", members);
    }
    this.uiUpdater.populateTeamGrid(members);
  }

  async StoreProjectInfo() {
    for (const repoName of GH_REPONAMES) {
      const projectInfoData = LocalStorageService.getItem(
        `latest_release_${repoName}`
      );
      let latestVersion = projectInfoData ? projectInfoData.version : null;
      if (!latestVersion) {
        const response: { tag_name: string } | null =
          await GithubAPI.fetchProjectInfo(repoName);
        latestVersion = response ? response.tag_name : "N.A.";
        LocalStorageService.setItem(
          `latest_release_${repoName}`,
          latestVersion
        );
      }
      this.uiUpdater.setVersionInfoText(repoName, latestVersion);
    }
  }
}

class UIUpdater {
  public populateTeamGrid(members: Member[]): void {
    const grid = document.querySelector(".team-grid");
    if (grid) {
      if (Array.isArray(members)) {
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
        console.error("Expected members to be an array, but got:", members);
      }
    } else {
      console.error('Element with class ".team-grid" not found');
    }
  }

  public setVersionInfoText(repoName: string, version: string): void {
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
