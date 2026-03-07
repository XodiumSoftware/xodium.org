use crate::components::projectcard::{ProjectCard, ProjectCardProperties};
use crate::github::fetch_repos;
use leptos::prelude::*;

#[component]
pub fn ProjectGrid() -> impl IntoView {
    let projects = LocalResource::new(|| async { fetch_repos().await });

    view! {
        <Suspense fallback=move || {
            view! {
                <div class="flex items-center justify-center text-center">
                    <span class="loading loading-spinner loading-lg text-primary"></span>
                </div>
            }
        }>
            {move || {
                match projects.get() {
                    None => ().into_view().into_any(),
                    Some(Err(err)) => {
                        view! {
                            <div class="flex items-center justify-center text-center">
                                <span class="text-error">{err}</span>
                            </div>
                        }
                            .into_view()
                            .into_any()
                    }
                    Some(Ok(projects)) => {
                        if projects.is_empty() {
                            view! {
                                <div class="flex items-center justify-center text-center">
                                    <span class="text-base-content/70">"No projects found."</span>
                                </div>
                            }
                                .into_view()
                                .into_any()
                        } else {
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
                                .into_view()
                                .into_any()
                        }
                    }
                }
            }}
        </Suspense>
    }
}
