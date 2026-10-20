use crate::components::scenes::object_3d_scene::Object3dScene;
use crate::components::sections::footer::Footer;
use crate::components::sections::header::Header;
use crate::components::ui::object_3d::{Dimensions, Face, Object3dProperties, Placement, Position};
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
                <Object3dScene objects=vec![
                    Object3dProperties {
                        id: "cadiotheka_project",
                        name: "Cadiotheka",
                        size: Dimensions {
                            width: 100.0,
                            depth: 100.0,
                            height: 100.0,
                        },
                        placement: Placement::At(Position {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0,
                        }),
                        colors: None,
                        is_draft: false,
                        url: Some("https://cadiotheka.com/"),
                    },
                    Object3dProperties {
                        id: "draft_0",
                        name: "SOON™",
                        size: Dimensions {
                            width: 100.0,
                            depth: 100.0,
                            height: 100.0,
                        },
                        placement: Placement::AttachedTo {
                            target: "cadiotheka_project",
                            face: Face::Left,
                        },
                        colors: None,
                        is_draft: true,
                        url: None,
                    },
                    Object3dProperties {
                        id: "draft_1",
                        name: "SOON™",
                        size: Dimensions {
                            width: 100.0,
                            depth: 100.0,
                            height: 100.0,
                        },
                        placement: Placement::AttachedTo {
                            target: "draft_0",
                            face: Face::Top,
                        },
                        colors: None,
                        is_draft: true,
                        url: None,
                    },
                ] />
            </main>

            <Footer />

            <Header />
        </div>
    }
}
