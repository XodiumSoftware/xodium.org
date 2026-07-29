use leptos::prelude::*;

/// Floating layered background for the landing section.
///
/// Uses CSS keyframe animations instead of scroll-linked transforms so the
/// effect composits on the GPU and never blocks the browser's asynchronous
/// panning/scrolling.
#[component]
#[must_use]
pub fn ParallaxLanding() -> impl IntoView {
    view! {
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Slowest layer - far background */}
            <div class="absolute inset-0 parallax-layer-slow">
                <div class="absolute top-20 left-10 w-32 h-32 border border-primary/10 rotate-45" />
                <div class="absolute bottom-40 right-20 w-24 h-24 border border-secondary/10 rotate-12" />
            </div>

            {/* Medium layer */}
            <div class="absolute inset-0 parallax-layer-medium">
                <div class="absolute top-1/3 left-1/4 w-2 h-2 bg-primary/20 rounded-full" />
                <div class="absolute top-2/3 right-1/3 w-3 h-3 bg-secondary/20 rounded-full" />
                <div class="absolute top-1/2 left-3/4 w-1 h-20 bg-primary/10" />
            </div>

            {/* Fast layer - closest */}
            <div class="absolute inset-0 parallax-layer-fast">
                <div class="absolute top-1/4 right-10 text-primary/5 font-mono text-xs">
                    "X: 1024 | Y: 768"
                </div>
                <div class="absolute bottom-1/4 left-10 text-secondary/5 font-mono text-xs">
                    "SCALE: 1.0"
                </div>
            </div>
        </div>
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use leptos::mount::mount_to_body;
    use leptos::web_sys;
    use wasm_bindgen_test::*;

    wasm_bindgen_test_configure!(run_in_browser);

    #[wasm_bindgen_test]
    fn test_parallax_landing_mounts() {
        mount_to_body(ParallaxLanding);
        let document = web_sys::window().unwrap().document().unwrap();
        assert!(
            document
                .query_selector(".parallax-layer-slow")
                .unwrap()
                .is_some(),
            "ParallaxLanding should render the slow background layer"
        );
        assert!(
            document
                .query_selector(".parallax-layer-medium")
                .unwrap()
                .is_some(),
            "ParallaxLanding should render the medium background layer"
        );
        assert!(
            document
                .query_selector(".parallax-layer-fast")
                .unwrap()
                .is_some(),
            "ParallaxLanding should render the fast foreground layer"
        );
    }
}
