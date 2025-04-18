/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {useEffect, useState} from "preact/hooks";
import {GITHUB} from "../utils/constants.ts";
import {Member} from "../plugins/github.ts";

export default function TeamCards() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/github/org/members?org=${GITHUB.org.name}`,
        );
        if (!response.ok) {
          console.error(
            `Failed to fetch organization members: ${response.status} ${response.statusText}`,
          );
          setError("Failed to load team members.");
          return;
        }

        const fetchedMembers: Member[] = await response.json();
        setMembers(fetchedMembers);
      } catch (e) {
        console.error("Error fetching organization members:", e);
        setError("Failed to load team members.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center text-center text-gray-500">
        Loading team members...
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

  if (!members || members.length === 0) {
    return (
      <div className="flex items-center justify-center text-center text-gray-500">
        No team members found.
      </div>
    );
  }

  return (
    <div>
      <ul>
        {members.map((member) => (
          <li key={member.login} className="py-2">
            <a
              href={member.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-4 hover:text-[#CB2D3E] dark:text-white dark:hover:text-[#CB2D3E]"
              aria-label={`Link to ${member.login}'s GitHub profile`}
            >
              <img
                src={member.avatar_url}
                alt={member.login}
                width="50"
                height="50"
                className="rounded-full group-hover:ring-2 group-hover:ring-[#CB2D3E]"
              />
              <span className="font-medium">{member.login}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
