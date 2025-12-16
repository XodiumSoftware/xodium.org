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
    java: "bg-[#b07219]",
  };

  const color = colorMap[language] || "bg-base-content/50";

  return (
    <span
      className={`badge badge-sm ${color} mr-1`}
      title={language}
    />
  );
}

export default function ProjectCard(
  { title, description, link, language }: ProjectCardProps,
) {
  return (
    <a href={link || "#"} target="_blank" rel="noopener noreferrer">
      <div className="card bg-base-200/50 backdrop-blur shadow-xl hover:ring-2 hover:ring-primary h-full transition-all">
        <div className="card-body">
          <h2 className="card-title text-primary">
            <GithubRepoIcon className="w-5 h-5 text-base-content/60" />
            {title}
          </h2>
          <p className="text-base-content/70 flex-grow">
            {description}
          </p>
          {language && (
            <div className="card-actions justify-start mt-auto">
              <div className="flex items-center gap-1 text-base-content/60 text-sm">
                <LanguageCircle language={language} />
                {language}
              </div>
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
