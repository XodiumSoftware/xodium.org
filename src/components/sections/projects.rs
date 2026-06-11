use crate::components::animations::blueprintloader::BlueprintCardLoader;
use crate::components::cards::projectcard::ProjectCard;
use crate::components::effects::hexgrid::HexPattern;
use crate::components::effects::sectionfade::FadeOverlay;
use crate::components::ui::cornerframe::CornerFrame;
use crate::components::ui::datagrid::data_grid_with_fallback;
use crate::github::{Repo, fetch_repos};
use crate::i18n::*;
use crate::utils::SendWrapper;
use leptos::prelude::*;
use leptos::wasm_bindgen::JsCast;
use leptos::wasm_bindgen::closure::Closure;
use leptos::web_sys;

#[component]
pub fn ProjectsSection() -> impl IntoView {
    let i18n = use_i18n();
    let (retry_count, set_retry_count) = signal(0u32);
    let (is_visible, set_is_visible) = signal(false);

    let resource = LocalResource::new(move || {
        let _ = retry_count.get();
        async move { fetch_repos().await }
    });

    let retry = move || {
        set_retry_count.update(|n| *n += 1);
    };

    // Track visibility so the blueprint loader only animates when in view
    Effect::new(move |_| {
        let Some(window) = web_sys::window() else {
            return;
        };
        let Some(document) = window.document() else {
            return;
        };
        let Some(section) = document.get_element_by_id("projects") else {
            return;
        };

        let closure = SendWrapper(Closure::wrap(Box::new(move |entries: js_sys::Array| {
            for entry in entries.iter() {
                if let Ok(entry) = entry.dyn_into::<web_sys::IntersectionObserverEntry>() {
                    set_is_visible.set(entry.is_intersecting());
                }
            }
        }) as Box<dyn FnMut(_)>));

        let options = web_sys::IntersectionObserverInit::new();
        options.set_threshold(&js_sys::Array::of1(&js_sys::Number::from(0.5)));

        let Ok(observer) = web_sys::IntersectionObserver::new_with_options(
            closure.0.as_ref().unchecked_ref(),
            &options,
        ) else {
            return;
        };

        observer.observe(&section);

        on_cleanup(move || {
            observer.disconnect();
            drop(closure);
        });
    });

    view! {
        <section id="projects" class="relative py-24 sm:py-32 px-6">
            <HexPattern />
            <FadeOverlay />
            <div class="mx-auto max-w-7xl relative z-10">
                <div class="flex gap-8 items-stretch">
                    <div class="flex-shrink-0 flex items-center bg-[#d0d0d0] p-2 relative">
                        <CornerFrame
                            style="square"
                            black=true
                            class="h-full w-full flex items-center justify-center"
                        >
                            <h2 class="text-3xl font-bold tracking-tight text-transparent bg-base-100 bg-clip-text sm:text-4xl [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                                {t!(i18n, projects.title)}
                            </h2>
                        </CornerFrame>
                    </div>
                    <div class="flex-1 min-w-0">
                        {data_grid_with_fallback(
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
                            move || {
                                if is_visible.get() {
                                    view! { <BlueprintCardLoader /> }.into_any()
                                } else {
                                    // Static placeholder preserves layout while off-screen
                                    view! {
                                        <div class="min-h-[220px] flex items-center justify-center">
                                            <span class="loading loading-spinner loading-lg text-primary opacity-40" />
                                        </div>
                                    }
                                        .into_any()
                                }
                            },
                        )}
                    </div>
                </div>
            </div>
        </section>
    }
}
