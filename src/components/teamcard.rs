use leptos::prelude::*;

#[derive(Clone)]
pub struct TeamCardProperties {
    pub login: String,
    pub html_url: String,
    pub avatar_url: String,
}

#[component]
pub fn TeamCard(props: TeamCardProperties) -> impl IntoView {
    view! {
        <li class="team-card-item">
            <a
                href=props.html_url
                target="_blank"
                rel="noopener noreferrer"
                class="team-card-link group"
                aria-label=format!("Link to {}'s GitHub profile", props.login)
            >
                <div class="flex items-center gap-4 h-full w-full bg-[#d0d0d0] p-4 border-2 border-base-content/30">
                    <div class="avatar">
                        <div class="w-12 rounded-full">
                            <img src=props.avatar_url alt=props.login.clone() loading="lazy" decoding="async" />
                        </div>
                    </div>
                    <span class="font-medium text-base-content">{props.login.clone()}</span>
                </div>
            </a>
        </li>
    }
}
