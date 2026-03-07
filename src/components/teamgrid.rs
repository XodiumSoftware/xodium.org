use crate::components::teamcard::{TeamCard, TeamCardProperties};
use crate::github::fetch_members;
use leptos::prelude::*;

#[component]
pub fn TeamGrid() -> impl IntoView {
    let members = LocalResource::new(|| async { fetch_members().await });

    view! {
        <Suspense fallback=move || {
            view! {
                <div class="flex items-center justify-center text-center">
                    <span class="loading loading-spinner loading-lg text-primary"></span>
                </div>
            }
        }>
            {move || match members.get() {
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
                Some(Ok(members)) => {
                    if members.is_empty() {
                        view! {
                            <div class="flex items-center justify-center text-center">
                                <span class="text-base-content/70">"No team members found."</span>
                            </div>
                        }
                            .into_view()
                            .into_any()
                    } else {
                        view! {
                            <ul class="menu gap-3">
                                {members
                                    .into_iter()
                                    .map(|member| {
                                        view! {
                                            <TeamCard props=TeamCardProperties {
                                                login: member.login,
                                                html_url: member.html_url,
                                                avatar_url: member.avatar_url,
                                            } />
                                        }
                                    })
                                    .collect_view()}
                            </ul>
                        }
                            .into_view()
                            .into_any()
                    }
                }
            }}
        </Suspense>
    }
}
