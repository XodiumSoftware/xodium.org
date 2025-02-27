import { useEffect, useState } from "preact/hooks";
import { GithubService } from "../services/github.service.ts";
import { JSX } from "preact/jsx-runtime";

/**
 * Represents a member of GitHub with relevant profile information.
 */
export interface GitHubMember {
  login: string;
  avatar_url: string;
  html_url: string;
}

/**
 * Team card properties.
 */
interface TeamCardProps {
  member: GitHubMember;
}

/**
 * Team card component.
 * @param {TeamCardProps} props TeamCardProps
 * @returns {JSX.Element} JSX.Element
 */
function TeamCard({ member }: TeamCardProps): JSX.Element {
  const [hovered, setHovered] = useState(false);
  const highlightColor = "#CB2D3E";
  return (
    <li
      className="mb-4"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-x-6">
        <a href={member.html_url}>
          <img
            className="h-16 w-16 rounded-full"
            src={member.avatar_url}
            alt={`${member.login} profile picture`}
            style={hovered ? { outline: `2px solid ${highlightColor}` } : {}}
          />
        </a>
        <div>
          <a href={member.html_url}>
            <h3
              className="text-base font-semibold leading-7 tracking-tight text-gray-900 dark:text-slate-100"
              style={hovered ? { color: highlightColor } : {}}
            >
              {member.login}
            </h3>
          </a>
        </div>
      </div>
    </li>
  );
}

/**
 * Team cards component.
 * @returns {JSX.Element} JSX.Element
 */
export default function TeamCards(): JSX.Element {
  const [members, setMembers] = useState<GitHubMember[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const data = await GithubService.getData<GitHubMember>("members");
        if (Array.isArray(data)) {
          setMembers(data);
        } else {
          console.warn(
            "Team cards container or member data is missing or invalid.",
          );
        }
      } catch (error) {
        console.error("Error fetching team members:", error);
      }
    })();
  }, []);
  return (
    <ul className="team-cards">
      {members.map((member) => <TeamCard key={member.login} member={member} />)}
    </ul>
  );
}
