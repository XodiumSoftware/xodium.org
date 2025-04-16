/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import LogOutButton from "./logout.tsx";
import DashboardIcon from "../components/icons/dashboard.tsx";
import AnalyticsIcon from "../components/icons/analytics.tsx";
import LibraryIcon from "../components/icons/library.tsx";
import {type Signal} from "@preact/signals";

export type DashboardSection = "dashboard" | "analytics" | "library";

interface SideBarProps {
  activeSection: Signal<DashboardSection>;
}

export default function SideBar({ activeSection }: SideBarProps) {
  const menuItems = [
    {
      id: "dashboard" as DashboardSection,
      name: "Dashboard",
      icon: <DashboardIcon className="w-6 h-6" />,
    },
    {
      id: "analytics" as DashboardSection,
      name: "Analytics",
      icon: <AnalyticsIcon className="w-6 h-6" />,
    },
    {
      id: "library" as DashboardSection,
      name: "Library",
      icon: <LibraryIcon className="w-6 h-6" />,
    },
  ];

  const handleSectionClick = (
    e: MouseEvent,
    sectionId: DashboardSection,
  ) => {
    e.preventDefault();
    activeSection.value = sectionId;
  };

  return (
    <aside className="sidebar fixed top-0 left-0 z-9999 flex h-screen w-[290px] flex-col border-r border-gray-200 dark:border-gray-800 px-5 transition-all duration-300 lg:static lg:translate-x-0 -translate-x-full">
      {/* ... */}
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear flex-grow">
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          <div>
            <ul className="mb-6 flex flex-col gap-1.5">
              {menuItems.map((item) => {
                const isActive = activeSection.value === item.id;
                const activeClass = isActive
                  ? "bg-gray-200 dark:bg-gray-700 text-[#CB2D3E]"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#CB2D3E]";

                return (
                  <li key={item.id}>
                    <a
                      href="#"
                      onClick={(e) => handleSectionClick(e, item.id)}
                      className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium duration-300 ease-in-out ${activeClass}`}
                    >
                      {item.icon}
                      {item.name}
                    </a>
                  </li>
                );
              })}
              <li>
                <LogOutButton className="group relative flex w-full items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-700 duration-300 ease-in-out hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 hover:text-[#CB2D3E]" />
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
}
