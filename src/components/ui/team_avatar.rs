use crate::github::Member;
use leptos::prelude::*;

/// A single team member avatar linking to their GitHub profile.
#[component]
#[must_use]
pub fn TeamAvatar(
    /// GitHub member whose avatar and profile link are rendered.
    member: Member,
) -> impl IntoView {
    let alt = format!(
        "{login} — {role}",
        login = member.login,
        role = member.role.as_deref().unwrap_or("Member"),
    );

    view! {
        <li class="team-avatars-item" role="listitem">
            <a
                href={member.html_url}
                target="_blank"
                rel="noopener noreferrer"
                class="avatar"
                aria-label={alt}
            >
                <div class="h-10 w-10 rounded-none">
                    <img
                        src={member.avatar_url}
                        alt={member.login}
                        class="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
            </a>
        </li>
    }
}
