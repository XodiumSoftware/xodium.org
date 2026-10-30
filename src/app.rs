use crate::components::scenes::object_3d_scene::Object3dScene;
use crate::components::sections::footer::Footer;
use crate::components::sections::header::Header;
use crate::components::ui::object_3d::{Attachment, Face, Object3dProperties};
use crate::utils::CADIOTHEKA_URL;
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
                        url: Some(CADIOTHEKA_URL),
                        ..Default::default()
                    },
                    Object3dProperties {
                        id: "draft_0",
                        name: "SOON™",
                        attached_to: Some(Attachment::Face {
                            target: "cadiotheka_project",
                            face: Face::Left,
                        }),
                        is_draft: true,
                        ..Default::default()
                    },
                    Object3dProperties {
                        id: "draft_1",
                        name: "SOON™",
                        attached_to: Some(Attachment::Face  {
                            target: "draft_0",
                            face: Face::Top,
                        }),
                        is_draft: true,
                        ..Default::default()
                    },
                ] />
            </main>

            <Footer />

            <Header />
        </div>
    }
}
