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
        <li>
            <a
                href=props.html_url
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-primary"
                aria-label=format!("Link to {}'s GitHub profile", props.login)
            >
                <div class="avatar">
                    <div class="w-12 rounded-full ring-2 ring-transparent hover:ring-primary transition-all">
                        <img src=props.avatar_url alt=props.login.clone() />
                    </div>
                </div>
                <span class="font-medium">{props.login}</span>
            </a>
        </li>
    }
}
