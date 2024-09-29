// xodium.utils.github.ts
import axiod from "axiod";
import { LocalStorageService } from "xodium/utils/localstorage";

const GH_ORGNAME: string = "XodiumSoftware";
const GH_REPONAMES: string[] = ["xCAD", "xLIB"];

interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
}

interface GitHubRelease {
  url: string;
  tag_name: string;
  name: string;
  body: string;
}

const acceptHeader = "application/vnd.github+json";

class GithubAPI {
  static async fetchOrgMembers(): Promise<GitHubUser[]> {
    const response = await axiod.get<GitHubUser[]>(
      `https://api.github.com/orgs/${GH_ORGNAME}/public_members`,
      {
        headers: { Accept: acceptHeader },
      }
    );
    return response.data;
  }

  static async fetchProjectInfo(
    repoName: string
  ): Promise<GitHubRelease | null> {
    const releasesResponse = await axiod.get<GitHubRelease[]>(
      `https://api.github.com/repos/${GH_ORGNAME}/${repoName}/releases`,
      {
        headers: { Accept: acceptHeader },
      }
    );

    if (releasesResponse.data.length === 0) {
      return null;
    }

    const latestReleaseResponse = await axiod.get<GitHubRelease>(
      `https://api.github.com/repos/${GH_ORGNAME}/${repoName}/releases/latest`,
      {
        headers: { Accept: "application/vnd.github+json" },
      }
    );
    return latestReleaseResponse.data;
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
    let members: GitHubUser[] | null = null;
    if (membersData && Array.isArray(membersData)) {
      members = membersData as GitHubUser[];
    } else {
      members = await GithubAPI.fetchOrgMembers();
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
    this.uiUpdater.populateTeamGrid(members);
  }

  async StoreProjectInfo() {
    for (const repoName of GH_REPONAMES) {
      const projectInfoData = LocalStorageService.getItem(
        `latest_release_${repoName}`
      );
      let latestVersion: string | null = null;
      if (
        projectInfoData &&
        typeof projectInfoData === "object" &&
        "version" in projectInfoData
      ) {
        latestVersion = (projectInfoData as { version: string }).version;
      }
      if (!latestVersion) {
        const response: { tag_name: string } | null =
          await GithubAPI.fetchProjectInfo(repoName);
        latestVersion = response ? response.tag_name : "N.A.";
        LocalStorageService.setItem(`latest_release_${repoName}`, {
          value: { version: latestVersion },
        });
      }
      this.uiUpdater.setVersionInfoText(repoName, latestVersion);
    }
  }
}

class UIUpdater {
  public populateTeamGrid(members: GitHubUser[]): void {
    const grid = document.querySelector(".team-grid");
    if (grid) {
      if (Array.isArray(members)) {
        members.forEach((member) => {
          const card = document.createElement("li");
          card.classList.add("mb-4");
          card.innerHTML = `
            <div class="flex items-center gap-x-6">
              <a href="${member.html_url}" target="_blank">
                <img
                  class="h-16 w-16 rounded-full"
                  src="${member.avatar_url}"
                  alt="${member.login} picture"
                />
              </a>
              <div>
                <h3
                  class="text-base font-semibold leading-7 tracking-tight text-gray-900 dark:text-slate-100"
                >
                  ${member.login}
                </h3>
                <p class="text-sm font-semibold leading-6 text-indigo-600">
                  ROLE FEATURE WIP
                </p>
              </div>
            </div>
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
