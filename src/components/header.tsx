/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import GithubIcon from "./icons/github.tsx";
import WikiIcon from "./icons/wiki.tsx";

export default function Header() {
  const socialLinks = [
    {
      href: "https://wiki.xodium.org",
      label: "Wiki",
      Icon: WikiIcon,
      isExternal: true,
    },
    {
      href: "https://github.com/XodiumSoftware",
      label: "Github",
      Icon: GithubIcon,
      isExternal: true,
    },
  ];
  return (
    <header id="top" className="z-20 relative">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        {/* Left side Header */}
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
        {/* Right side Header */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <ul className="flex items-center space-x-4">
            {socialLinks.map(({ href, label, Icon, isExternal }) => (
              <li key={href}>
                <a
                  className="dark:text-white hover:text-[#CB2D3E]"
                  href={href}
                  aria-label={label}
                  title={label}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                >
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
