/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

/// <reference lib="deno.unstable" />

import { useEffect, useState } from "preact/hooks";
import { Member } from "../routes/api/orgs/github/members.ts";
import { JSX } from "preact/jsx-runtime";
import { GITHUB } from "../utils/constants.ts";

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
        const response = await fetch(
          `/api/orgs/github/members?org=${GITHUB.org.name}`,
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch organization members: ${response.status} ${response.statusText}`,
          );
        }
        const fetchedMembers: Member[] = await response.json();
        setMembers(fetchedMembers);
      } catch (e) {
        console.error("Error fetching organization members:", e);
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
