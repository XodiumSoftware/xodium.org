/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import GithubIcon from "./icons/github.tsx";
import LoginIcon from "./icons/login.tsx";
import WikiIcon from "./icons/wiki.tsx";

export default function Header() {
  const socialLinks = [
    {
      href: "https://wiki.xodium.org",
      label: "Wiki",
      Icon: WikiIcon,
    },
    {
      href: "https://github.com/XodiumSoftware",
      label: "Github",
      Icon: GithubIcon,
    },
    {
      href: "/dashboard",
      label: "Login",
      Icon: LoginIcon,
    },
  ];
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
        {/* Right side icons */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <ul className="flex items-center space-x-4">
            {socialLinks.map(({href, label, Icon}) => (
              <li key={href}>
                <a
                  className="has-tooltip dark:text-white hover:text-[#CB2D3E]"
                  href={href}
                  aria-label={label}
                >
                  <Icon className="w-6 h-6"/>
                  <span className="tooltip">{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
