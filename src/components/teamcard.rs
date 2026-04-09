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
                class="group flex flex-col items-center justify-center h-full w-full bg-ghost hover:border-primary hover:text-primary border-2 border-base-content/80"
                aria-label=format!("Link to {}'s GitHub profile", props.login)
            >
                <div class="avatar mb-4">
                    <div class="w-20 rounded-full">
                        <img src=props.avatar_url alt=props.login.clone() loading="lazy" decoding="async" />
                    </div>
                </div>
                <span class="font-medium text-lg">{props.login.clone()}</span>
            </a>
        </li>
    }
}
