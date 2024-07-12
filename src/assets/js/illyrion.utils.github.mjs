// illyrion.utils.github.mjs

import { GH_ORGNAME } from "./illyrion.constants.mjs";

class UtilsGithub {
  constructor() {
    this.fetchOrgMembers();
  }

  async encryptData(data) {
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    const key = await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encoded
    );
    const exportedKey = await window.crypto.subtle.exportKey("jwk", key);
    return { key: exportedKey, iv, encrypted };
  }

  async decryptData(key, iv, data) {
    const importedKey = await window.crypto.subtle.importKey(
      "jwk",
      key,
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      importedKey,
      data
    );
    return JSON.parse(new TextDecoder().decode(decrypted));
  }

  async fetchOrgMembers() {
    const oneHour = 60 * 60 * 1000;
    let members = await this.getFromIndexedDB("members");
    let timestamp = await this.getFromIndexedDB("timestamp");

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
      const encryptedMembers = await this.encryptData(members);
      this.saveToIndexedDB("members", encryptedMembers);
      this.saveToIndexedDB("timestamp", Date.now());
    } else {
      members = await this.decryptData(
        members.key,
        members.iv,
        members.encrypted
      );
    }

    this.populateTeamGrid(members);
  }

  async getFromIndexedDB(key) {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open("MyDatabase", 1);

      openRequest.onupgradeneeded = function (e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("store")) {
          db.createObjectStore("store");
        }
      };

      openRequest.onsuccess = function (e) {
        const db = e.target.result;
        const transaction = db.transaction("store", "readonly");
        const store = transaction.objectStore("store");
        const getRequest = store.get(key);

        getRequest.onsuccess = function (e) {
          resolve(e.target.result);
        };
      };

      openRequest.onerror = function (e) {
        reject("Error getting data from IndexedDB");
      };
    });
  }

  async saveToIndexedDB(key, data) {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open("MyDatabase", 1);

      openRequest.onupgradeneeded = function (e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("store")) {
          db.createObjectStore("store");
        }
      };

      openRequest.onsuccess = function (e) {
        const db = e.target.result;
        const transaction = db.transaction("store", "readwrite");
        const store = transaction.objectStore("store");
        const putRequest = store.put(data, key);

        putRequest.onsuccess = function (e) {
          resolve();
        };
      };

      openRequest.onerror = function (e) {
        reject("Error saving data to IndexedDB");
      };
    });
  }

  populateTeamGrid(members) {
    const grid = document.querySelector(".team-grid");
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
  }
}

new UtilsGithub();
