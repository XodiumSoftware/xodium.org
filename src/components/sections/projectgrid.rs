use crate::components::cards::projectcard::ProjectCard;
use crate::components::ui::datagrid::data_grid;
use crate::github::{Repo, fetch_repos};
use crate::i18n::*;
use leptos::prelude::*;

#[component]
pub fn ProjectGrid() -> impl IntoView {
    let i18n = use_i18n();
    let (retry_count, set_retry_count) = signal(0u32);
    let resource = LocalResource::new(move || {
        let _ = retry_count.get();
        async move { fetch_repos().await }
    });

    let retry = move || {
        set_retry_count.update(|n| *n += 1);
    };

    data_grid(
        resource,
        move || t!(i18n, projects.empty),
        |projects: Vec<Repo>| {
            view! {
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                    {projects
                        .into_iter()
                        .map(|project| {
                            view! {
                                <ProjectCard props=project.into() />
                            }
                        })
                        .collect_view()}
                </div>
            }
        },
        Some(retry),
    )
}
