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

/// Blueprint footer — a small framed annotation block anchored bottom-left
/// inside the page border. Carries the copyright line and the three external
/// links; the commit link lives in the title block's REV cell instead, so
/// it's not duplicated here.
#[component]
#[must_use]
pub fn Footer() -> impl IntoView {
    let current_year = js_sys::Date::new_0().get_full_year();

    view! {
        <footer class="blueprint-footer" aria-label="Site footer">
            <span class="blueprint-footer-cell blueprint-footer-cell-copy font-mono">
                {format!("© {current_year} ")}
                <a href="/" class="blueprint-footer-link">
                    "XODIUM™"
                </a>
            </span>
            {FOOTER_LINKS
                .iter()
                .map(|link| {
                    let target = if link.is_external { Some("_blank") } else { None };
                    let rel = if link.is_external { Some("noopener noreferrer") } else { None };
                    view! {
                        <a
                            href=link.href
                            target=target
                            rel=rel
                            class="blueprint-footer-cell blueprint-footer-link font-mono"
                        >
                            {link.label}
                        </a>
                    }
                })
                .collect::<Vec<_>>()}
        </footer>
    }
}
