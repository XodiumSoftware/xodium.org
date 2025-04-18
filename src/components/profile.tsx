/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {useEffect, useState} from "preact/hooks";
import {GitHubUserProfile} from "../plugins/github.ts";

interface UserProfileProps {
  isCollapsed: boolean;
}

export default function UserProfile({ isCollapsed }: UserProfileProps) {
  const [profile, setProfile] = useState<GitHubUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/github/user/profile`);
        if (!response.ok) {
          console.error(
            `Failed to fetch user profile: ${response.status} ${response.statusText}`,
          );
          setError("Failed to load user profile.");
          return;
        }

        const fetchedProfile: GitHubUserProfile = await response.json();
        setProfile(fetchedProfile);
      } catch (e) {
        console.error("Error fetching user profile:", e);
        setError("Failed to load user profile.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center text-center text-gray-500">
        Loading user profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center text-center text-gray-500">
        No user profile found.
      </div>
    );
  }

  return (
    <div
      className={`flex items-center ${
        isCollapsed ? "justify-center" : "px-4"
      } py-3 border-t border-b border-gray-200 dark:border-gray-800`}
    >
      {isLoading
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
              src={profile.avatar_url || "/default-avatar.png"}
              alt="User profile"
              className={`w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 ${
                !isCollapsed ? "mr-3" : ""
              }`}
            />
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {profile.name || profile.login || "Guest"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {profile.login || ""}
                </span>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
