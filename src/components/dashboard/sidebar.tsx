/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import LogOutButton from "../../islands/logout.tsx";
import DashboardIcon from "../icons/dashboard.tsx";
import AnalyticsIcon from "../icons/analytics.tsx";
import LibraryIcon from "../icons/library.tsx";

export default function SideBar() {
  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <DashboardIcon className="w-6 h-6" />,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: <AnalyticsIcon className="w-6 h-6" />,
    },
    {
      name: "Library",
      href: "/library",
      icon: <LibraryIcon className="w-6 h-6" />,
    },
  ];

  return (
    <aside className="sidebar fixed top-0 left-0 z-9999 flex h-screen w-[290px] flex-col border-r border-gray-200 dark:border-gray-800 px-5 transition-all duration-300 lg:static lg:translate-x-0 -translate-x-full">
      <div className="flex items-center justify-between gap-2 px-4 py-2 mb-6">
        {/* TODO: Add a button to collapse sidebar on mobile if needed */}
        {
          /* <button
          className="block lg:hidden"
          // Add onClick handler to toggle sidebar visibility
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">...</svg>
        </button> */
        }
      </div>
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear flex-grow">
        {/* <!-- Sidebar Menu --> */}
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          {/* <!-- Menu Group --> */}
          <div>
            <ul className="mb-6 flex flex-col gap-1.5">
              {/* <!-- Menu Item --> */}
              {menuItems.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    // TODO: Add logic here to determine the active link (e.g., based on current URL)
                    // Example active class: 'bg-gray-100 dark:bg-gray-700'
                    className="group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-700 duration-300 ease-in-out hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 hover:text-[#CB2D3E]"
                  >
                    {item.icon}
                    {item.name}
                  </a>
                </li>
              ))}
              {/* <!-- Logout Menu Item --> */}
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
