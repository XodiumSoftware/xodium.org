use crate::components::scenes::object_3d_scene::Object3dScene;
use crate::components::sections::footer::Footer;
use crate::components::sections::header::Header;
use crate::components::ui::object_3d::{
    Dimensions, FaceColors, Object3d, Object3dProperties, Position,
};
use leptos::prelude::*;

#[component]
#[must_use]
pub fn App() -> impl IntoView {
    view! {
        <div class="blueprint-frame">
            <a
                href="#main-content"
                class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-content focus:rounded"
            >
                "Skip to main content"
            </a>

            <main id="main-content" tabindex="-1">
                <h1 class="sr-only">"Xodium Software — open-source CAD software"</h1>
                <Object3dScene>
                    <Object3d props=Object3dProperties {
                        name: "Building Block",
                        size: Dimensions {
                            width: 240.0,
                            depth: 120.0,
                            height: 180.0,
                        },
                        position: Position {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0,
                        },
                        colors: None,
                        is_draft: false,
                    } />
                    <Object3d props=Object3dProperties {
                        name: "Slab",
                        size: Dimensions {
                            width: 180.0,
                            depth: 180.0,
                            height: 90.0,
                        },
                        position: Position {
                            x: -210.0,
                            y: 0.0,
                            z: -45.0,
                        },
                        colors: Some(FaceColors {
                            top: "oklch(0.75 0.15 140 / 0.35)",
                            left: "oklch(0.65 0.13 140 / 0.35)",
                            right: "oklch(0.55 0.15 25 / 0.35)",
                        }),
                        is_draft: false,
                    } />
                    <Object3d props=Object3dProperties {
                        name: "Column",
                        size: Dimensions {
                            width: 75.0,
                            depth: 75.0,
                            height: 270.0,
                        },
                        position: Position {
                            x: 0.0,
                            y: 97.5,
                            z: 45.0,
                        },
                        colors: None,
                        is_draft: true,
                    } />
                </Object3dScene>
            </main>

            <Footer />

            <Header />
        </div>
    }
}
