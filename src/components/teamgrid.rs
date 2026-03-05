use leptos::prelude::*;
use leptos::server_fn::request::browser::Request;
use leptos::server_fn::serde::Deserialize;

const GITHUB_ORG: &str = "XodiumSoftware";

// TODO: rewrite so we dont need serde.
#[derive(Clone, Debug, Deserialize)]
pub struct Member {
    pub login: String,
    pub html_url: String,
    pub avatar_url: String,
}

async fn fetch_members() -> Result<Vec<Member>, String> {
    let url = format!("/api/github/org/members?org={}", GITHUB_ORG);

    let response = Request::get(&url)
        .send()
        .await
        .map_err(|_| "Failed to load team members.".to_string())?;

    if !response.ok() {
        return Err("Failed to load team members.".to_string());
    }

    response
        .json::<Vec<Member>>()
        .await
        .map_err(|_| "Failed to parse team members.".to_string())
}

#[component]
pub fn TeamGrid() -> impl IntoView {
    let members = Resource::new(|| (), |_| async { fetch_members().await });

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
                                                            &member.login,
                                                        )
                                                    >
                                                        <div class="avatar">
                                                            <div class="w-12 rounded-full ring-2 ring-transparent hover:ring-primary transition-all">
                                                                <img src=member.avatar_url alt=&member.login />
                                                            </div>
                                                        </div>
                                                        <span class="font-medium">{&member.login}</span>
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
