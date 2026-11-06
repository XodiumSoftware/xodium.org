//! Team modal section.
//!
//! Opens when the user activates the "Team" cube in the isometric scene and
//! shows the Xodium GitHub members as large round avatars.

use crate::github::Member;
use leptos::prelude::*;
use leptos::wasm_bindgen::JsCast as _;
use leptos::wasm_bindgen::closure::Closure;
use std::rc::Rc;

/// Props for the [`Team`] modal.
#[derive(Clone)]
#[must_use]
pub struct TeamProperties {
    /// Members to display inside the modal.
    pub members: Vec<Member>,
    /// Callback invoked when the modal should close (backdrop click or Escape).
    pub on_close: Rc<dyn Fn() + 'static>,
}

/// Modal overlay showing the Xodium team as large round avatars.
///
/// The modal is a barebones centered card over a translucent backdrop.
/// Pressing Escape or clicking the backdrop closes it. Each avatar links to
/// the member's GitHub profile in a new tab.
///
/// When opened the avatars animate from the center of the modal (as if they
/// flew out of the "Team" cube) to their final horizontal positions,
/// scaling up from a small size to the full display size.
///
/// Focus moves to the dialog on open, Escape is handled by a document-level
/// listener so it works wherever focus sits, and focus returns to whatever was
/// focused before the modal opened when it closes.
#[component]
#[must_use]
pub fn Team(
    /// Configuration: member list and close callback.
    props: TeamProperties,
) -> impl IntoView {
    let TeamProperties { members, on_close } = props;
    let close = on_close.clone();
    let count = members.len().max(1);
    let spacing = 9.0;
    let half_span = f64::from(u32::try_from(count.saturating_sub(1)).unwrap_or(0)) * spacing / 2.0;

    let dialog = NodeRef::<leptos::html::Div>::new();

    Effect::new(move |_| {
        let Some(dialog) = dialog.get() else {
            return;
        };

        let Some(document) = web_sys::window().and_then(|window| window.document()) else {
            return;
        };

        let previous_focus = document
            .active_element()
            .and_then(|element| element.dyn_into::<web_sys::HtmlElement>().ok());
        let _ = dialog.focus();

        let close_on_escape = {
            let close = close.clone();
            move |event: web_sys::KeyboardEvent| {
                if event.key() == "Escape" {
                    event.prevent_default();
                    close();
                }
            }
        };

        let listener =
            Closure::<dyn FnMut(web_sys::KeyboardEvent)>::new(close_on_escape).into_js_value();
        let listener: js_sys::Function = listener.unchecked_into();

        if let Err(error) = document.add_event_listener_with_callback("keydown", &listener) {
            web_sys::console::warn_1(
                &format!("Failed to register Escape listener on team modal: {error:?}").into(),
            );
        }

        let cleanup_listener = listener.clone();
        on_cleanup(move || {
            if let Some(document) = web_sys::window().and_then(|window| window.document()) {
                let _ = document.remove_event_listener_with_callback("keydown", &cleanup_listener);
            }

            if let Some(element) = previous_focus.clone() {
                let _ = element.focus();
            }
        });
    });

    view! {
        <div
            class="team-modal-backdrop"
            role="presentation"
            on:click=move |_| on_close()
        >
            <div
                node_ref=dialog
                class="team-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Team members"
                tabindex="-1"
                on:click=move |ev| ev.stop_propagation()
            >
                {members
                    .into_iter()
                    .enumerate()
                    .map(|(index, member)| {
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
                        let index_f64 = f64::from(u32::try_from(index).unwrap_or(0));
                        let offset = (index_f64 * spacing) - half_span;
                        view! {
                            <a
                                class="team-modal-avatar"
                                href=html_url
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label=label
                                style=format!("--avatar-target-x: {offset:.2}rem;")
                            >
                                <img src=avatar_url alt=login loading="lazy" />
                            </a>
                        }
                    })
                    .collect_view()}
            </div>
        </div>
    }
}
