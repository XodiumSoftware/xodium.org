/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import GithubRepoIcon from "./icons/repo.tsx";

interface ProjectCardProps {
  title: string;
  description: string;
  link?: string;
  language?: string;
}

function LanguageCircle({ language }: { language: string }) {
  const colorMap: { [key: string]: string } = {
    Rust: "bg-[#dea584]",
    TypeScript: "bg-[#3178c6]",
    JavaScript: "bg-[#f1e05a]",
    Python: "bg-[#3572A5]",
    HTML: "bg-[#e34c26]",
    CSS: "bg-[#563d7c]",
    Java: "bg-[#b07219]",
    Go: "bg-[#00ADD8]",
    C: "bg-[#555555]",
    "C++": "bg-[#f34b7d]",
    Kotlin: "bg-[#A97BFF]",
  };

  const color = colorMap[language] || "bg-gray-500";

  return (
    <span
      className={`inline-block h-3 w-3 rounded-full mr-1 ${color}`}
      title={language}
    >
    </span>
  );
}

export default function ProjectCard(
  { title, description, link, language }: ProjectCardProps,
) {
  return (
    <a href={link || "#"} target="_blank" rel="noopener noreferrer">
      <div className="card glass text-white shadow-2xl rounded-lg p-4 hover:outline hover:outline-[#CB2D3E] h-full">
        <div className="card-body flex flex-col justify-between h-full">
          <div>
            <h1 className="card-title mb-2.5 text-[#CB2D3E]">
              <GithubRepoIcon className="inline-block mr-2 text-gray-600 dark:text-slate-400"  />
              {title}
            </h1>
            <p className="mb-4 text-gray-600 dark:text-slate-400">
              {description}
            </p>
          </div>
          {language && (
            <p className="text-gray-600 dark:text-slate-400 mt-auto">
              <LanguageCircle language={language} />
              {language}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}
