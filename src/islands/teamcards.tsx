/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

/// <reference lib="deno.unstable" />

import { useEffect, useState } from "preact/hooks";
import { getOrganizationMembers, Member } from "../routes/api/orgs/github.ts";
import { JSX } from "preact/jsx-runtime";
import { org } from "../utils/constants.ts";

// Cached members to avoid fetching them on every render
interface CachedMembers {
  members: Member[];
  timestamp: number;
}

const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour

/**
 * TeamCards component that displays a list of team members.
 * @returns {JSX.Element} JSX.Element
 */
export default function TeamCards(): JSX.Element {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const kv = await Deno.openKv();
        const cachedData = await kv.get<CachedMembers>(["members"]);

        if (
          cachedData.value &&
          Date.now() - cachedData.value.timestamp < CACHE_EXPIRY
        ) {
          console.log("Using cached data");
          setMembers(cachedData.value.members);
        } else {
          console.log("Fetching data from GitHub");
          const fetchedMembers = await getOrganizationMembers(org, undefined);

          const dataToStore: CachedMembers = {
            members: fetchedMembers,
            timestamp: Date.now(),
          };
          await kv.set(["members"], dataToStore);
          setMembers(fetchedMembers);
        }
        kv.close();
      } catch (e) {
        console.error("Error fetching or caching organization members:", e);
        setError("Failed to load team members.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  if (isLoading) {
    return (
      <div class="flex items-center justify-center text-center text-gray-500">
        Loading team members...
      </div>
    );
  }

  if (error) {
    return (
      <div class="flex items-center justify-center text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div class="flex items-center justify-center text-center text-gray-500">
        No team members found.
      </div>
    );
  }

  return (
    <div>
      <ul>
        {members.map((member) => (
          <li key={member.login} class="py-2">
            <a
              href={member.html_url}
              target="_blank"
              rel="noopener noreferrer"
              class="group flex items-center space-x-4 hover:text-[#CB2D3E] dark:text-white dark:hover:text-[#CB2D3E]"
              aria-label={`Link to ${member.login}'s GitHub profile`}
            >
              <img
                src={member.avatar_url}
                alt={member.login}
                width="50"
                height="50"
                class="rounded-full group-hover:ring-2 group-hover:ring-[#CB2D3E]"
              />
              <span class="font-medium">{member.login}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
