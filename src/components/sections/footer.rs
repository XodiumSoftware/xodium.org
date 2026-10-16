use leptos::prelude::*;

struct FooterLink {
    href: &'static str,
    label: &'static str,
    is_external: bool,
}

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

/// Blueprint footer — a single line of monospace uppercase text anchored
/// bottom-left inside the page border, reading like a handwritten note in
/// the drawing margin rather than a framed cell.
#[component]
#[must_use]
pub fn Footer() -> impl IntoView {
    let current_year = js_sys::Date::new_0().get_full_year();

    view! {
        <footer class="blueprint-footer" aria-label="Site footer">
            <span class="blueprint-footer-copy">
                {format!("© {current_year} ")}
                <a href="/">"XODIUM™"</a>
            </span>
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
                                class="blueprint-footer-link"
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
