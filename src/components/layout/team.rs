//! Team member section.
//!
//! Shows the Xodium GitHub members as a `DaisyUI` avatar group with a counter,
//! each visible avatar linking to the member's GitHub profile. Mounted in the
//! band below the hero, replacing the subprojects cards while it is selected.

use crate::components::layout::main::SheetEntrance;
use crate::github::{Member, fetch_members};
use leptos::prelude::*;
use leptos::wasm_bindgen::JsCast as _;

/// How many member avatars the band shows before collapsing the rest into a
/// `+N` counter. Keeps the group a single line inside the band height.
const VISIBLE_AVATARS: usize = 3;

/// A single member avatar, linking to that member's GitHub profile.
fn member_avatar(member: Member) -> impl IntoView {
    let Member {
        login,
        html_url,
        avatar_url,
        role,
    } = member;
    let label = format!(
        "{login} — {role}",
        role = role.as_deref().unwrap_or("Member"),
    );

    view! {
        <div
            class="avatar rounded-full border-2 border-base-content transition-colors has-[a:hover]:border-primary"
            role="listitem"
        >
            <a
                class="team-band-avatar rounded-full bg-base-100 hover:brightness-110"
                href=html_url
                target="_blank"
                rel="noopener noreferrer"
                aria-label=label
            >
                <img
                    class="h-full w-full object-cover"
                    src=avatar_url
                    alt=login
                    loading="lazy"
                />
            </a>
        </div>
    }
}

/// The trailing `+N` chip standing in for the members that are not shown.
fn overflow_counter(overflow: usize) -> impl IntoView {
    view! {
        <div
            class="avatar avatar-placeholder rounded-full border-2 border-base-content"
            role="listitem"
            aria-label=format!("{overflow} more team members")
        >
            <div class="team-band-avatar rounded-full bg-neutral text-neutral-content text-[0.7rem] tracking-[0.04em]">
                <span aria-hidden="true">{format!("+{overflow}")}</span>
            </div>
        </div>
    }
}

/// Placeholder avatars shown while the member request is still in flight.
///
/// They reserve the row's shape so the band does not look empty after the swap,
/// and are hidden from assistive tech because the live region announces the
/// arrival of the real members. The skeleton border is transparent so the
/// shimmer reads as a reserved circle rather than an outlined one.
fn loading_avatars(count: usize) -> impl IntoView {
    view! {
        <div class="avatar-group -space-x-4" aria-hidden="true">
            {(0..count)
                .map(|_| {
                    view! {
                        <div class="avatar rounded-full border-2 border-transparent">
                            <div class="team-band-avatar rounded-full skeleton"></div>
                        </div>
                    }
                })
                .collect_view()}
        </div>
    }
}

/// Team band: a `DaisyUI` avatar group with a counter.
///
/// Members are fetched when the band mounts, so the request is made only once
/// the band is actually opened and cached responses are reused on later
/// visits. The footer's band toggle is the only way back to the subprojects
/// cards; the band has no dismiss control of its own.
///
/// Only the first `VISIBLE_AVATARS` members get an avatar; the remainder are
/// counted in the trailing `+N` chip, which is inert because it has no single
/// destination. The counter is omitted when every member is already shown.
/// The whole group is labelled so the collapsed count is available to
/// assistive tech without reading each avatar individually.
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
    let members = LocalResource::new(|| async {
        fetch_members().await.unwrap_or_else(|error| {
            web_sys::console::warn_1(&format!("Failed to fetch team members: {error}").into());
            Vec::new()
        })
    });

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
            {move || match members.get() {
                None => loading_avatars(VISIBLE_AVATARS).into_any(),
                Some(loaded) => {
                    let overflow = loaded.len().saturating_sub(VISIBLE_AVATARS);
                    let shown = loaded
                        .into_iter()
                        .take(VISIBLE_AVATARS)
                        .map(member_avatar)
                        .collect_view();
                    let counter = (overflow > 0).then(|| overflow_counter(overflow));

                    view! {
                        <div
                            class="avatar-group -space-x-4"
                            role="list"
                            aria-label="Xodium team members"
                        >
                            {shown}
                            {counter}
                        </div>
                    }
                        .into_any()
                }
            }}
        </section>
    }
}
