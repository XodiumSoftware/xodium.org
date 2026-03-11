use crate::components::datagrid::data_grid;
use crate::components::projectcard::{ProjectCard, ProjectCardProperties};
use crate::github::{fetch_repos, Repo};
use leptos::prelude::*;

#[component]
pub fn ProjectGrid() -> impl IntoView {
    let resource = LocalResource::new(|| async { fetch_repos().await });
    data_grid(resource, "No projects found.", |projects: Vec<Repo>| {
        view! {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {projects
                    .into_iter()
                    .map(|project| {
                        view! {
                            <ProjectCard props=ProjectCardProperties {
                                title: project.name,
                                description: project.description.unwrap_or_default(),
                                link: Some(project.html_url),
                                language: project.language,
                                stargazers_count: project.stargazers_count,
                            } />
                        }
                    })
                    .collect_view()}
            </div>
        }
    })
}
