//! Team member section.
//!
//! Shows the Xodium GitHub members as a `DaisyUI` avatar group, each visible
//! avatar linking to the member's GitHub profile. Mounted in the band below the
//! hero, replacing the subprojects cards while it is selected.
//!
//! The member list is authored here rather than fetched. The organization is
//! small enough that the roster is a `const` slice, matching `MAIN_PROJECTS`,
//! `SUBPROJECT_ITEMS` and `BLOBS`, and there is no API client, cache or request
//! to go wrong. Adding a member is an edit and a deploy; if the roster ever
//! needs to be live, reintroduce the client rather than loosening this list.

use crate::components::layout::main::SheetEntrance;
use leptos::prelude::*;
use leptos::wasm_bindgen::JsCast as _;

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
    /// These are the `/u/{id}?v=4` form rather than `/u/{id}` or the login
    /// form, because the numeric form survives a login rename.
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
/// Every entry in `MEMBERS` gets an avatar, in order. The list is authored, so
/// the band renders fully formed on its first frame: there is no request to wait
/// on and therefore no skeleton state to swap out. The footer's band toggle is
/// the only way back to the subprojects cards; the band has no dismiss control
/// of its own.
///
/// The band crossfades in through [`SheetEntrance`]'s swap class. It never
/// takes the load-in entrance: it can only be reached through the lower-band
/// swap, so `.sheet-band-team` carries no `--band-delay`.
///
/// Sizing and the avatar ring live in `public/style.css`:
///
/// - `.sheet-band-team` shares the pinned `--lower-band-height` with the
///   subprojects row (with `border-box`, so the 1px rule sits inside the figure
///   and the vertical padding is included before the rows centre in it). The two
///   bands are sized by different things — a text grid and a flex row of avatars
///   — so leaving either content-sized would let them drift apart whenever copy
///   or type scale changes, and each swap would resize the sheet. That pin is
///   only relaxed on phones, in the subprojects media query.
///
/// - `--team-avatar-size` is that height less the vertical padding and less the
///   4px of border the 2px ring contributes, so a full stack of avatars fits the
///   band without clipping.
///
/// - `.team-band-avatar` only sizes the box: `DaisyUI`'s `avatar` supplies the
///   circle and clip. The ring stays a utility on the outer `.avatar` wrapper,
///   because `avatar-group` clips the wrapper and an inner border would be cut
///   away.
#[component]
#[must_use]
pub fn Team() -> impl IntoView {
    let entrance = SheetEntrance::use_context();

    let section = NodeRef::<leptos::html::Section>::new();

    Effect::new(move |_| {
        let Some(section) = section.get() else {
            return;
        };

        let Some(document) = web_sys::window().and_then(|window| window.document()) else {
            return;
        };

        let previous_focus = document
            .active_element()
            .and_then(|element| element.dyn_into::<web_sys::HtmlElement>().ok());
        let _ = section.focus();
        on_cleanup(move || {
            if let Some(element) = previous_focus.clone() {
                let _ = element.focus();
            }
        });
    });

    view! {
        <section
            node_ref=section
            id="team"
            class=move || {
                format!(
                    "sheet-band sheet-band-team {} flex items-center justify-center px-6 py-(--lower-band-padding-y) border-b border-base-content/40",
                    entrance.swap_class(),
                )
            }
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
