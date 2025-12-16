import {useEffect, useState} from "preact/hooks";
import {GITHUB} from "../utils.ts";
import {Member} from "../plugins/github.ts";

export default function TeamGrid() {
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
      <div className="flex items-center justify-center text-center">
        <span className="loading loading-spinner loading-lg text-primary">
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center text-center">
        <span className="text-error">{error}</span>
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="flex items-center justify-center text-center">
        <span className="text-base-content/70">No team members found.</span>
      </div>
    );
  }

  return (
    <div>
      <ul className="menu">
        {members.map((member) => (
          <li key={member.login}>
            <a
              href={member.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
              aria-label={`Link to ${member.login}'s GitHub profile`}
            >
              <div className="avatar">
                <div className="w-12 rounded-full ring-2 ring-transparent hover:ring-primary transition-all">
                  <img
                    src={member.avatar_url}
                    alt={member.login}
                  />
                </div>
              </div>
              <span className="font-medium">{member.login}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
