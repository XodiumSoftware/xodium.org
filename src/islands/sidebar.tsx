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
import ChevronRight from "../components/icons/chevron_right.tsx";
import ChevronLeft from "../components/icons/chevron_left.tsx";

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
      icon: <DashboardIcon className="w-6 h-6 flex-shrink-0"/>,
    },
    {
      id: "analytics",
      name: "Analytics",
      icon: <AnalyticsIcon className="w-6 h-6 flex-shrink-0"/>,
    },
    {
      id: "library",
      name: "Library",
      icon: <LibraryIcon className="w-6 h-6 flex-shrink-0"/>,
    },
  ];

  const handleSectionClick = (sectionId: DashboardSection) => {
    activeSection.value = sectionId;
  };
  const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
  };

  const sidebarWidthClass = isCollapsed.value ? "w-auto" : "w-[290px]";
  const sidebarPaddingClass = isCollapsed.value ? "px-2" : "px-5";
  const clickableItemBaseClasses =
    `group relative flex w-full items-center gap-2.5 rounded-sm py-2 font-medium text-left duration-300 ease-in-out`;
  const clickableItemHoverClasses =
    `text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#CB2D3E]`;
  const activeNavClasses = `bg-gray-200 dark:bg-gray-700 text-[#CB2D3E]`;

  return (
    <aside
      className={`sidebar fixed top-0 left-0 z-9999 flex h-screen flex-col border-r border-gray-200 dark:border-gray-800 ${sidebarPaddingClass} ${sidebarWidthClass} transition-all duration-300 lg:static lg:translate-x-0 -translate-x-full`}
    >
      {/* Header */}
      <div className="flex items-center justify-between py-4 h-16">
        {!isCollapsed.value && (
          <div className="flex items-center ml-4">
            <img
              src="/favicon.svg"
              alt="Xodium Logo"
              className="w-6 h-6 mr-2"
              aria-hidden="true"
            />
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Xodium
            </h1>
          </div>
        )}
        <div
          className={`flex ${
            isCollapsed.value ? "w-full justify-center" : "justify-end"
          }`}
        >
          <button
            type="button"
            onClick={toggleCollapse}
            aria-label={isCollapsed.value
              ? "Expand sidebar"
              : "Collapse sidebar"}
            aria-expanded={!isCollapsed.value}
            className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isCollapsed.value
              ? <ChevronRight className="w-6 h-6"/>
              : <ChevronLeft className="w-6 h-6"/>}
          </button>
        </div>
      </div>

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
                    ${isActive ? activeNavClasses : clickableItemHoverClasses}
                 `;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleSectionClick(item.id)}
                      className={itemClasses.trim()}
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
                    ${clickableItemHoverClasses}
                  `.trim()}
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
