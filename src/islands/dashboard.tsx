/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {useSignal} from "@preact/signals";
import {JSX} from "preact/jsx-runtime";
import Grid from "../components/grid.tsx";
import Footer from "../components/footer.tsx";
import SideBar, {DashboardSection} from "./sidebar.tsx";

function DashboardContent() {
  return (
    <div>
      <h1 class="text-2xl font-semibold mb-4">Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      {/* TODO: Add Dashboard specific components and content here */}
    </div>
  );
}

function AnalyticsContent() {
  return (
    <div>
      <h1 class="text-2xl font-semibold mb-4">Analytics</h1>
      <p>Here are your analytics.</p>
      {/* TODO: Add Analytics specific components and content here */}
    </div>
  );
}

function LibraryContent() {
  return (
    <div>
      <h1 class="text-2xl font-semibold mb-4">Library</h1>
      <p>Browse your library.</p>
      {/* TODO: Add Library specific components and content here */}
    </div>
  );
}

const contentComponents: Record<DashboardSection, () => JSX.Element> = {
  dashboard: DashboardContent,
  analytics: AnalyticsContent,
  library: LibraryContent,
};

export default function DashboardPage() {
  const activeSection = useSignal<DashboardSection>("dashboard");

  return (
    <>
      <Grid />
      <main className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-900">
        <div className="flex flex-1">
          <SideBar activeSection={activeSection} />
          <div className="flex flex-col flex-1">
            <div className="flex-grow container mx-auto my-8 px-4 py-8 rounded-xl border border-gray-200 dark:border-gray-800">
              {activeSection.value === "dashboard" && <DashboardContent />}
              {activeSection.value === "analytics" && <AnalyticsContent />}
              {activeSection.value === "library" && <LibraryContent />}
            </div>
            <Footer />
          </div>
        </div>
      </main>
    </>
  );
}
