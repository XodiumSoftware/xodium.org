/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {useSignal} from "@preact/signals";
import {useEffect} from "preact/hooks";

interface UserProfileProps {
  isCollapsed: boolean;
}

interface UserProfileData {
  login: string;
  name: string | null;
  avatar_url: string;
}

export default function UserProfile({ isCollapsed }: UserProfileProps) {
  const profile = useSignal<UserProfileData | null>(null);
  const isLoading = useSignal(true);
  const error = useSignal<Error | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        isLoading.value = true;
        error.value = null;

        // TODO: rethink this logic, doesnt make sense.
        const response = await fetch("/api/profile");
        if (!response.ok) {
          const fetchError = new Error(
            `Failed to fetch profile: ${response.statusText}`,
            {
              cause: { status: response.status },
            },
          );
          console.error("Error fetching user profile:", fetchError);
          error.value = fetchError;
          return;
        }

        const data = await response.json();
        if (data.isLoggedIn && data.profile) profile.value = data.profile;
      } catch (err) {
        console.error("Error fetching user profile:", err);
        error.value = err instanceof Error ? err : new Error("Unknown error");
      } finally {
        isLoading.value = false;
      }
    };
    void fetchUserProfile();
  }, []);

  if (error.value && !isLoading.value) {
    return (
      <div className="flex items-center justify-center py-3 border-t border-b border-gray-200 dark:border-gray-800">
        <span className="text-red-500 text-sm">Failed to load profile</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center ${
        isCollapsed ? "justify-center" : "px-4"
      } py-3 border-t border-b border-gray-200 dark:border-gray-800`}
    >
      {isLoading.value
        ? (
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse mr-3" />
            {!isCollapsed && (
              <div className="flex flex-col">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
                <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            )}
          </div>
        )
        : (
          <div className="flex items-center">
            <img
              src={profile.value?.avatar_url || "/default-avatar.png"}
              alt="User profile"
              className="w-10 h-10 rounded-full object-cover mr-3 ring-2 ring-gray-200 dark:ring-gray-700"
            />
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {profile.value?.name || profile.value?.login || "Guest"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {profile.value?.login || ""}
                </span>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
