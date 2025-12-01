import {useEffect, useState} from "preact/hooks";
import ProjectCard from "../components/projectcard.tsx";
import {GITHUB} from "../utils/constants.ts";
import {Repo} from "../plugins/github.ts";

export default function ProjectGrid() {
  const [projects, setProjects] = useState<Repo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/github/org/repos?org=${GITHUB.org.name}`,
        );
        if (!response.ok) {
          console.error(
            `Failed to fetch organization projects: ${response.status} ${response.statusText}`,
          );
          setError("Failed to load projects.");
          return;
        }

        const fetchedProjects: Repo[] = await response.json();
        setProjects(fetchedProjects);
      } catch (e) {
        console.error("Error fetching organization projects:", e);
        setError("Failed to load team projects.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center text-center text-gray-500">
        Loading projects...
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

  if (!projects || projects.length === 0) {
    return (
      <div className="flex items-center justify-center text-center text-gray-500">
        No projects found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
      {projects.map((project) => (
        <ProjectCard
          key={project.name}
          title={project.name}
          description={project.description}
          link={project.html_url}
          language={project.language}
        />
      ))}
    </div>
  );
}
