use crate::components::scenes::object_3d_scene::Object3dScene;
use crate::components::sections::footer::Footer;
use crate::components::sections::header::Header;
use crate::components::ui::object_3d::{Object3d, Object3dProperties};
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
                        width: 80.0,
                        depth: 40.0,
                        height: 60.0,
                        name: "Building Block",
                        offset_x: 0.0,
                        offset_y: 0.0,
                        is_draft: false,
                    } />
                    <Object3d props=Object3dProperties {
                        width: 60.0,
                        depth: 60.0,
                        height: 30.0,
                        name: "SOON™",
                        offset_x: -180.0,
                        offset_y: 0.0,
                        is_draft: true,
                    } />
                    <Object3d props=Object3dProperties {
                        width: 25.0,
                        depth: 25.0,
                        height: 90.0,
                        name: "SOON™",
                        offset_x: 180.0,
                        offset_y: 0.0,
                        is_draft: true,
                    } />
                </Object3dScene>
            </main>

            <Footer />

            <Header />
        </div>
    }
}
