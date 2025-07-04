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
    Rust: "bg-orange-500",
    TypeScript: "bg-blue-500",
    JavaScript: "bg-yellow-500",
    Python: "bg-green-500",
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
    <a href={link} target="_blank" rel="noopener noreferrer">
      <div className="card glass text-white sm:max-w-sm outline rounded-lg p-4">
        <div className="card-body">
          <h1 className="card-title mb-2.5 text-white">
            <GithubRepoIcon className="inline-block mr-2" />
            {title}
          </h1>
          <p className="mb-4">{description}</p>
          {language && (
            <p>
              <LanguageCircle language={language} />
              {language}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}
