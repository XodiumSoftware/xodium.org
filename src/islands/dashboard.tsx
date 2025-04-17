/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {effect, useSignal} from "@preact/signals";
import {JSX} from "preact/jsx-runtime";
import Grid from "../components/grid.tsx";
import Footer from "../components/footer.tsx";
import SideBar, {DashboardSection} from "./sidebar.tsx";
import {AnalyticsContent, DashboardContent, LibraryContent,} from "../components/dashboard.tsx";
import {IS_BROWSER} from "$fresh/runtime.ts";

const sectionTitles: Record<DashboardSection, string> = {
  dashboard: "Dashboard",
  analytics: "Analytics",
  library: "Library",
};

const contentComponents: Record<DashboardSection, () => JSX.Element> = {
  dashboard: DashboardContent,
  analytics: AnalyticsContent,
  library: LibraryContent,
};

export default function DashboardPage() {
  const activeSection = useSignal<DashboardSection>("dashboard");
  const ActiveContentComponent = contentComponents[activeSection.value];

  effect(() => {
    if (IS_BROWSER) {
      const sectionKey = activeSection.value;
      const title = sectionTitles[sectionKey] || "Dashboard";
      document.title = `Xodium | ${title}`;
    }
  });

  return (
    <>
      <Grid />
      <main className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-900">
        <div className="flex flex-1">
          <SideBar activeSection={activeSection} />
          <div className="flex flex-col flex-1">
            <div className="flex-grow container mx-auto my-8 px-4 py-8 rounded-xl border border-gray-200 dark:border-gray-800">
              {ActiveContentComponent
                ? <ActiveContentComponent />
                : <div>Unknown Section</div>}
            </div>
            <Footer />
          </div>
        </div>
      </main>
    </>
  );
}
