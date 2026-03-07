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
                            <div>
                                <ul class="menu">
                                    {members
                                        .into_iter()
                                        .map(|member| {
                                            view! {
                                                <li>
                                                    <a
                                                        href=member.html_url
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        class="hover:text-primary"
                                                        aria-label=format!(
                                                            "Link to {}'s GitHub profile",
                                                            member.login,
                                                        )
                                                    >
                                                        <div class="avatar">
                                                            <div class="w-12 rounded-full ring-2 ring-transparent hover:ring-primary transition-all">
                                                                <img src=member.avatar_url alt=member.login.clone() />
                                                            </div>
                                                        </div>
                                                        <span class="font-medium">{member.login.clone()}</span>
                                                    </a>
                                                </li>
                                            }
                                        })
                                        .collect_view()}
                                </ul>
                            </div>
                        }
                            .into_view()
                            .into_any()
                    }
                }
            }}
        </Suspense>
    }
}
