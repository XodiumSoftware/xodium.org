//! Team member section.
//!
//! A `DaisyUI` avatar group in the slot below the hero, replacing the subprojects
//! cards while it is selected. The roster is an authored `const` slice: there is
//! no client, cache or request, so the band renders fully formed.

use crate::components::layout::main::SheetEntrance;
use leptos::prelude::*;

/// A single member of the Xodium organization shown in the team band.
#[derive(Clone, Copy, Debug)]
pub struct Member {
    /// GitHub login, used for the avatar's `alt` text.
    pub login: &'static str,
    /// Display name, used as the accessible name of the profile link.
    pub name: &'static str,
    /// Public GitHub profile URL.
    pub html_url: &'static str,
    /// Avatar image URL.
    ///
    /// The `/u/{id}?v=4` form, not the login form: the numeric id survives a
    /// rename. Look the id up with `https://api.github.com/users/{login}`.
    pub avatar_url: &'static str,
}

/// Team members, in the order the band shows them.
const MEMBERS: &[Member] = &[
    Member {
        login: "gaia-03",
        name: "Gaia",
        html_url: "https://github.com/gaia-03",
        avatar_url: "https://avatars.githubusercontent.com/u/118364724?v=4",
    },
    Member {
        login: "illyrius666",
        name: "Illyrius",
        html_url: "https://github.com/illyrius666",
        avatar_url: "https://avatars.githubusercontent.com/u/28700752?v=4",
    },
];

/// A single member avatar, linking to that member's GitHub profile.
///
/// The ring is a `border-*` utility on the `.avatar` wrapper, never on the inner
/// element: `avatar-group` clips the wrapper, so an inner border is cut away.
fn member_avatar(member: &'static Member) -> impl IntoView {
    view! {
        <div
            class="avatar rounded-full border-2 border-base-content transition-colors has-[a:hover]:border-primary"
            role="listitem"
        >
            <a
                class="team-band-avatar rounded-full bg-base-100 hover:brightness-110"
                href=member.html_url
                target="_blank"
                rel="noopener noreferrer"
                aria-label=member.name
            >
                <img
                    class="h-full w-full object-cover"
                    src=member.avatar_url
                    alt=member.login
                    loading="lazy"
                />
            </a>
        </div>
    }
}

/// Team band: a `DaisyUI` avatar group.
///
/// Focus is handled by markup, not the DOM: `autofocus` moves focus into the band
/// as it mounts and the browser returns it to the footer toggle on unmount, so
/// the crate needs no `web-sys`. `tabindex="-1"` keeps it out of the Tab order.
///
/// It crossfades through [`SheetEntrance`]'s swap class and never takes the
/// load-in entrance, so it carries no `--band-delay`. Its pinned height and the
/// avatar size are paired in `public/style.css`: shrinking one without the other
/// clips the avatars.
#[component]
#[must_use]
pub fn Team() -> impl IntoView {
    let entrance = SheetEntrance::use_context();

    view! {
        <section
            id="team"
            class=move || {
                format!(
                    "sheet-band sheet-band-team {} flex items-center justify-center px-6 py-(--lower-band-padding-y) border-b border-base-content/40",
                    entrance.swap_class(),
                )
            }
            autofocus
            tabindex="-1"
            aria-label="Team members"
        >
            <div
                class="avatar-group -space-x-4"
                role="list"
                aria-label="Xodium team members"
            >
                {MEMBERS.iter().map(member_avatar).collect_view()}
            </div>
        </section>
    }
}
