use leptos::prelude::*;

/// A single link rendered in the blueprint footer.
struct FooterLink {
    /// Destination URL or mailto/path.
    href: &'static str,
    /// Uppercase label displayed in the footer.
    label: &'static str,
    /// When true, the link opens in a new tab with `noopener noreferrer`.
    is_external: bool,
}

/// Footer links shown at the bottom of the sheet.
const FOOTER_LINKS: &[FooterLink] = &[
    FooterLink {
        href: "https://github.com/XodiumSoftware",
        label: "ABOUT",
        is_external: true,
    },
    FooterLink {
        href: "https://www.gnu.org/licenses/agpl-3.0.html",
        label: "LICENSING",
        is_external: true,
    },
    FooterLink {
        href: "mailto:info@xodium.org",
        label: "CONTACT",
        is_external: true,
    },
];

/// Blueprint footer — a single line of monospace uppercase text closing the
/// drawing sheet, reading like a handwritten note in the margin rather than a
/// framed cell. It flows with the sheet's content instead of being pinned to
/// the viewport.
#[component]
#[must_use]
pub fn Footer() -> impl IntoView {
    let current_year = js_sys::Date::new_0().get_full_year();

    view! {
        <footer class="blueprint-footer" aria-label="Site footer">
            <span>{format!("© {current_year} XODIUM™")}</span>
            <span class="blueprint-footer-sep" aria-hidden="true">"·"</span>
            {FOOTER_LINKS
                .iter()
                .enumerate()
                .map(|(i, link)| {
                    let target = if link.is_external { Some("_blank") } else { None };
                    let rel = if link.is_external { Some("noopener noreferrer") } else { None };
                    view! {
                        <>
                            <a
                                href=link.href
                                target=target
                                rel=rel
                            >
                                {link.label}
                            </a>
                            {if i + 1 < FOOTER_LINKS.len() {
                                Some(view! {
                                    <span class="blueprint-footer-sep" aria-hidden="true">"·"</span>
                                })
                            } else {
                                None
                            }}
                        </>
                    }
                })
                .collect::<Vec<_>>()}
        </footer>
    }
}
