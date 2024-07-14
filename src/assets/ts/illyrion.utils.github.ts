import { GH_ORGNAME, GH_REPONAMES } from "./illyrion.constants.js";

class UtilsGithub {
  private syncQueue: (() => Promise<void>)[];
  private readonly syncInterval: number = 60 * 1000;

  constructor() {
    this.syncQueue = [];
    this.startSyncProcess();
    this.scheduleSyncOperations();

    this.fetchOrgMembers();
    this.fetchProjectInfo();
  }

  private startSyncProcess(): void {
    setInterval(async () => {
      if (this.syncQueue.length > 0) {
        const syncOperation = this.syncQueue.shift();
        if (syncOperation) {
          await syncOperation();
        }
      }
    }, this.syncInterval);
  }

  private scheduleSyncOperations(): void {
    this.syncQueue.push(() => this.fetchOrgMembers());
    this.syncQueue.push(() => this.fetchProjectInfo());
  }

  private async fetchOrgMembers(): Promise<void> {
    let membersData = this.getLocalStorageItem("members");
    let members = membersData ? membersData.value : null;

    if (!members) {
      const response = await fetch(
        `https://api.github.com/orgs/${GH_ORGNAME}/members`,
        {
          headers: {
            Accept: "application/vnd.github+json",
          },
        }
      );
      members = await response.json();
      this.setLocalStorageItem("members", members);
    }

    this.populateTeamGrid(members);
  }

  private async fetchProjectInfo(): Promise<void> {
    for (const repoName of GH_REPONAMES) {
      let projectInfoData = this.getLocalStorageItem(
        `latest_release_${repoName}`
      );
      let latestVersion = projectInfoData ? projectInfoData.value : null;

      if (!latestVersion) {
        const response = await fetch(
          `https://api.github.com/repos/${GH_ORGNAME}/${repoName}/releases/latest`,
          {
            headers: {
              Accept: "application/vnd.github+json",
            },
          }
        );
        if (!response.ok) {
          latestVersion = "n.a.";
        } else {
          const latestRelease = await response.json();
          latestVersion = latestRelease.tag_name;
        }
        this.setLocalStorageItem(`latest_release_${repoName}`, latestVersion);
      }

      this.setVersionInfoText(repoName, latestVersion);
    }
  }

  private setLocalStorageItem(key: string, value: any): void {
    const item = {
      value: value,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(item));
  }

  private getLocalStorageItem(key: string): any {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
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
        el.innerHTML = `<i class="fas fa-solid fa-tag"> ${version}`;
      });
    } else {
      console.error(`Element with class ".${repoName}-version" not found`);
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  new UtilsGithub();
});
