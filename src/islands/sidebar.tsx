/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import LogOutButton from "./logout.tsx";
import DashboardIcon from "../components/icons/dashboard.tsx";
import AnalyticsIcon from "../components/icons/analytics.tsx";
import LibraryIcon from "../components/icons/library.tsx";
import {type Signal, useSignal} from "@preact/signals";
import {JSX} from "preact/jsx-runtime";
import UserProfile from "../components/profile.tsx";

export type DashboardSection = "dashboard" | "analytics" | "library";

interface MenuItem {
  id: DashboardSection;
  name: string;
  icon: JSX.Element;
}

interface SideBarProps {
  activeSection: Signal<DashboardSection>;
}

export default function SideBar({ activeSection }: SideBarProps) {
  const isCollapsed = useSignal(false);
  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: <DashboardIcon className="w-6 h-6 flex-shrink-0"  />,
    },
    {
      id: "analytics",
      name: "Analytics",
      icon: <AnalyticsIcon className="w-6 h-6 flex-shrink-0"  />,
    },
    {
      id: "library",
      name: "Library",
      icon: <LibraryIcon className="w-6 h-6 flex-shrink-0"  />,
    },
  ];

  const handleSectionClick = (sectionId: DashboardSection) => {
    activeSection.value = sectionId;
  };
  const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
  };

  const sidebarWidthClass = isCollapsed.value ? "w-auto" : "w-[250px]";
  const sidebarPaddingClass = isCollapsed.value ? "px-2" : "px-5";

  const clickableItemBaseClasses =
    `group relative flex w-full items-center gap-2.5 rounded-md py-2 font-medium text-left duration-300 ease-in-out`;

  const hoverRingClasses =
    `hover:ring-2 hover:ring-inset hover:ring-cyan-500/50 dark:hover:ring-blue-400/50`;
  const activeRingClasses =
    `ring-2 ring-inset ring-cyan-500/50 dark:ring-blue-400/50`;

  const baseTextClasses = `text-gray-700 dark:text-gray-200`;
  const hoverTextClasses = `hover:text-[#CB2D3E] dark:hover:text-[#CB2D3E]`;
  const activeTextClasses = `text-[#CB2D3E]`;

  const nonActiveItemClasses =
    `${baseTextClasses} ${hoverTextClasses} ${hoverRingClasses}`;
  const activeItemClasses = `${activeTextClasses} ${activeRingClasses}`;

  return (
    <aside
      className={`sidebar relative fixed top-0 left-0 z-9999 flex h-screen flex-col border-r border-gray-200 dark:border-gray-800 ${sidebarPaddingClass} ${sidebarWidthClass} transition-all duration-300 lg:static lg:translate-x-0 -translate-x-full`}
    >
      {/* Toggle Button */}
      <button
        type="button"
        onClick={toggleCollapse}
        aria-label={isCollapsed.value ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!isCollapsed.value}
        className={`absolute top-1/2 left-full -translate-x-1/2 -translate-y-1/2 z-50 h-12 p-1.5 rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500 dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-gray-900 transition-all duration-150 ease-in-out`}
      />

      {/* Header */}
      <div className="flex items-center justify-between py-4 h-16">
        {!isCollapsed.value && (
          <div className="flex items-center ml-4">
            <a
              href="/"
              aria-label="Go to Xodium homepage"
              className="flex items-center"
            >
              <img
                src="/favicon.svg"
                alt=""
                className="w-6 h-6 mr-2"
                aria-hidden="true"
              />
              <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 truncate">
                Xodium
              </h1>
            </a>
          </div>
        )}
        {isCollapsed.value && (
          <div className="flex w-full items-center justify-center">
            <a href="/" aria-label="Go to Xodium homepage">
              <img
                src="/favicon.svg"
                alt="Xodium Logo"
                className="w-6 h-6"
                aria-hidden="true"
              />
            </a>
          </div>
        )}
      </div>

      {/* User Profile */}
      <UserProfile isCollapsed={isCollapsed.value}/>

      {/* Navigation */}
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear flex-grow">
        <nav
          className={`mt-5 py-4 ${isCollapsed.value ? "px-0" : "px-4 lg:px-6"}`}
        >
          <div>
            <ul className="mb-6 flex flex-col gap-1.5">
              {/* Menu Items */}
              {menuItems.map((item) => {
                const isActive = activeSection.value === item.id;
                const itemClasses = `
                    ${clickableItemBaseClasses}
                    ${isCollapsed.value ? "px-3 justify-center" : "px-4"}
                    ${isActive ? activeItemClasses : nonActiveItemClasses}
                 `;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleSectionClick(item.id)}
                      className={itemClasses.trim().replace(/\s+/g, " ")}
                      aria-current={isActive ? "page" : undefined}
                      title={isCollapsed.value ? item.name : undefined}
                    >
                      <span aria-hidden="true">{item.icon}</span>
                      {!isCollapsed.value && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </button>
                  </li>
                );
              })}

              {/* Logout Button */}
              <li>
                <LogOutButton
                  isCollapsed={isCollapsed.value}
                  className={`
                    ${clickableItemBaseClasses}
                    ${isCollapsed.value ? "px-3 justify-center" : "px-4"}
                    ${nonActiveItemClasses}
                  `.trim().replace(/\s+/g, " ")}
                  title={isCollapsed.value ? "Logout" : undefined}
                />
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
}
