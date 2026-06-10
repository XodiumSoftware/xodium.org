use crate::utils::SendWrapper;
use js_sys::Function;
use leptos::prelude::*;
use leptos::wasm_bindgen::JsCast;
use leptos::wasm_bindgen::closure::Closure;
use leptos::web_sys;

/// Parallax background for the landing section
#[component]
pub fn ParallaxLanding() -> impl IntoView {
    let (scroll_y, set_scroll_y) = signal(0.0);

    // Set up scroll listener
    Effect::new(move |_| {
        let Some(window) = web_sys::window() else {
            return;
        };

        let closure = SendWrapper(Closure::wrap(Box::new(move |_ev: web_sys::Event| {
            if let Some(w) = web_sys::window()
                && let Ok(scroll) = w.scroll_y()
            {
                set_scroll_y.set(scroll);
            }
        }) as Box<dyn FnMut(_)>));

        let fn_ref: Function = closure.0.as_ref().unchecked_ref::<Function>().clone();
        let _ = window.add_event_listener_with_callback("scroll", &fn_ref);

        // Initial call
        if let Ok(scroll) = window.scroll_y() {
            set_scroll_y.set(scroll);
        }

        on_cleanup(move || {
            if let Some(window) = web_sys::window() {
                let _ = window.remove_event_listener_with_callback("scroll", &fn_ref);
            }
            drop(closure);
        });
    });

    // Different layers move at different speeds
    let layer1_transform = move || format!("translateY({}px)", scroll_y.get() * 0.1);
    let layer2_transform = move || format!("translateY({}px)", scroll_y.get() * 0.3);
    let layer3_transform = move || format!("translateY({}px)", scroll_y.get() * 0.5);

    view! {
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Slowest layer - far background */}
            <div
                class="absolute inset-0 will-change-transform"
                style:transform=layer1_transform
            >
                <div class="absolute top-20 left-10 w-32 h-32 border border-primary/10 rotate-45" />
                <div class="absolute bottom-40 right-20 w-24 h-24 border border-secondary/10 rotate-12" />
            </div>

            {/* Medium layer */}
            <div
                class="absolute inset-0 will-change-transform"
                style:transform=layer2_transform
            >
                <div class="absolute top-1/3 left-1/4 w-2 h-2 bg-primary/20 rounded-full" />
                <div class="absolute top-2/3 right-1/3 w-3 h-3 bg-secondary/20 rounded-full" />
                <div class="absolute top-1/2 left-3/4 w-1 h-20 bg-primary/10" />
            </div>

            {/* Fast layer - closest */}
            <div
                class="absolute inset-0 will-change-transform"
                style:transform=layer3_transform
            >
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
    use wasm_bindgen_test::*;

    wasm_bindgen_test_configure!(run_in_browser);

    #[wasm_bindgen_test]
    fn test_parallax_landing_mounts() {
        mount_to_body(ParallaxLanding);
        let document = web_sys::window().unwrap().document().unwrap();
        assert!(
            document
                .query_selector(".will-change-transform")
                .unwrap()
                .is_some(),
            "ParallaxLanding should render transform layers"
        );
    }
}
