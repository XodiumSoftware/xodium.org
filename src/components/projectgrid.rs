use crate::components::projectcard::{ProjectCard, ProjectCardProperties};
use leptos::prelude::*;
use leptos::server_fn::request::browser::Request;
use serde::{Deserialize, Serialize};

const GITHUB_ORG: &str = "XodiumSoftware";

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Repo {
    pub name: String,
    pub description: Option<String>,
    pub html_url: String,
    pub language: Option<String>,
}

async fn fetch_projects() -> Result<Vec<Repo>, String> {
    let url = format!("/api/github/org/repos?org={}", GITHUB_ORG);

    let response = Request::get(&url)
        .send()
        .await
        .map_err(|_| "Failed to load projects.".to_string())?;

    if !response.ok() {
        return Err("Failed to load projects.".to_string());
    }

    response
        .json::<Vec<Repo>>()
        .await
        .map_err(|_| "Failed to parse projects.".to_string())
}

#[component]
pub fn ProjectGrid() -> impl IntoView {
    let projects = LocalResource::new(|| async { fetch_projects().await });

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
