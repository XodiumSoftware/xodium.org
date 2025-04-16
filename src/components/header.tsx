/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import GithubIcon from "./icons/github.tsx";
import LoginIcon from "./icons/login.tsx";
import WikiIcon from "./icons/wiki.tsx";

export default function Header() {
  return (
    <header id="top" className="z-20 relative">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="hidden lg:flex lg:gap-x-8">
          <a href="">
            <img
              src="/favicon.svg"
              alt="Xodium Icon"
              className="h-12 w-12"
            />
          </a>
          <a
            href="/#projects"
            className="flex items-center text-sm font-semibold leading-6 text-black dark:text-white hover:text-[#CB2D3E]"
          >
            PROJECTS
          </a>
          <a
            href="/#team"
            className="flex items-center text-sm font-semibold leading-6 text-black dark:text-white hover:text-[#CB2D3E]"
          >
            TEAM
          </a>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <div className="flex items-center space-x-4">
            <a
              className="has-tooltip dark:text-white hover:text-[#CB2D3E]"
              href="https://wiki.xodium.org"
            >
              <WikiIcon className="w-6 h-6" />
              <span className="tooltip">Wiki</span>
            </a>
            <a
              className="has-tooltip dark:text-white hover:text-[#CB2D3E]"
              href="https://github.com/XodiumSoftware"
            >
              <GithubIcon className="w-6 h-6" />
              <span className="tooltip">Github</span>
            </a>
            <a
              className="has-tooltip dark:text-white hover:text-[#CB2D3E]"
              href="/dashboard"
            >
              <LoginIcon className="w-6 h-6" />
              <span className="tooltip">Login</span>
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
