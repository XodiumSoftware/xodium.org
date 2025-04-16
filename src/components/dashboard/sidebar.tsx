/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import LogOutButton from "../../islands/logout.tsx";

export default function SideBar() {
  return (
      <aside
          className="sidebar fixed top-0 left-0 z-9999 flex h-screen w-[290px] flex-col border-r border-gray-200 dark:border-gray-800 px-5 transition-all duration-300 lg:static lg:translate-x-0 -translate-x-full">
        {/* TODO: Add content */}
        <LogOutButton/>
      </aside>
  );
}
