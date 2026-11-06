//! Hero demo frame.
//!
//! Shows a live page from another origin inside the hero window. The framed site
//! is an app of its own, so this component only frames it, holds the load state
//! and keeps the frame reachable by keyboard.

use leptos::prelude::*;

/// A live page framed by the hero window.
#[derive(Clone, Copy, Debug)]
#[must_use]
pub struct LiveFrame {
    /// Origin and path of the framed page.
    pub src: &'static str,
    /// Accessible name of the frame.
    pub title: &'static str,
}

/// Props for [`HeroDemo`].
#[derive(Clone, Copy, Debug)]
#[must_use]
pub struct HeroDemoProperties {
    /// The page to frame.
    pub frame: LiveFrame,
}

/// Scale applied to the framed page.
///
/// The hero window is small, so the live app is shrunk and pinned to the
/// top-left corner: it lays itself out at its natural desktop width and the
/// caller crops the overflow, rather than reflowing into a narrow column.
const FRAME_SCALE: f64 = 0.5;

/// Frame styling: invisible until the load handler fades it in, and doubled in
/// both axes so the caller's `overflow-hidden` crops it after scaling.
const FRAME_CLASS: &str = "absolute top-0 left-0 origin-top-left border-0 opacity-0 transition-opacity duration-500 w-[calc(100%*2)] h-[calc(100%*2)]";

/// A live cross-origin page, cropped into whatever box the caller gives it.
///
/// The frame grants no extra permissions. `clipboard-write` was tried and
/// dropped: the Permissions Policy parser rejects it as an unsupported feature
/// name and logs a console warning, and the framed site only reads the clipboard
/// from an event handler, which does not need the delegation.
///
/// The frame is `tabindex="0"` so keyboard users can move into the framed app
/// and use it without leaving the hero. It is invisible until the framed page
/// reports that it loaded, so the window never flashes the framed site's own
/// background before its content paints.
///
/// The framed origin must allow this site in its `frame-ancestors` policy, and
/// this site must allow the framed origin in its `frame-src` policy, or the
/// browser refuses to render it. Sign-in inside the frame is also expected to
/// fail: the framed app starts OAuth against its own top-level origin, so the
/// visitor leaves the demo for the real site.
#[component]
#[must_use]
pub fn HeroDemo(
    /// Configuration: the page to frame.
    props: HeroDemoProperties,
) -> impl IntoView {
    let HeroDemoProperties { frame } = props;
    let loaded = RwSignal::new(false);

    view! {
        <div class="relative h-full w-full overflow-hidden bg-base-100">
            <iframe
                class=FRAME_CLASS
                class:opacity-100=move || loaded.get()
                style=format!("scale: {FRAME_SCALE};")
                src=frame.src
                title=frame.title
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                tabindex="0"
                on:load=move |_| loaded.set(true)
            ></iframe>
        </div>
    }
}
