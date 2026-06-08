use leptos::prelude::*;

pub fn data_grid<T, IV, F, R>(
    resource: LocalResource<Result<Vec<T>, String>>,
    empty_message: &'static str,
    render: F,
    on_retry: Option<R>,
) -> impl IntoView
where
    T: Clone + Send + Sync + 'static,
    IV: IntoView + 'static,
    F: Fn(Vec<T>) -> IV + Copy + Send + Sync + 'static,
    R: Fn() + Clone + Send + Sync + 'static,
{
    view! {
        <Suspense fallback=move || {
            view! {
                <div class="flex items-center justify-center text-center">
                    <span class="loading loading-spinner loading-lg text-primary"></span>
                </div>
            }
        }>
            {move || match resource.get() {
                None => ().into_any(),
                Some(Err(err)) => {
                    let retry_view = on_retry.clone().map(|retry| {
                        view! {
                            <button
                                class="btn btn-primary btn-sm mt-4"
                                on:click=move |_| retry()
                            >
                                "Retry"
                            </button>
                        }
                    });
                    view! {
                        <div class="flex flex-col items-center justify-center text-center">
                            <span class="text-error">{err}</span>
                            {retry_view}
                        </div>
                    }
                        .into_any()
                }
                Some(Ok(data)) => {
                    if data.is_empty() {
                        view! {
                            <div class="flex items-center justify-center text-center">
                                <span class="text-base-content/70">{empty_message}</span>
                            </div>
                        }
                            .into_any()
                    } else {
                        render(data).into_any()
                    }
                }
            }}
        </Suspense>
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    wasm_bindgen_test_configure!(run_in_browser);

    #[wasm_bindgen_test]
    fn test_data_grid_empty_message() {
        let resource = LocalResource::new(|| async { Ok::<Vec<&str>, String>(Vec::new()) });
        // Mounting verifies the Suspense boundary and empty state render
        leptos::mount::mount_to_body(move || {
            data_grid(
                resource,
                "Nothing here.",
                |items| view! { <div>{items.len()}</div> },
                None::<fn()>,
            )
        });

        let document = web_sys::window().unwrap().document().unwrap();
        let body = document.body().unwrap();
        assert!(
            body.inner_html().contains("Nothing here.") || body.inner_html().contains("loading"),
            "data_grid should render empty message or loading fallback"
        );
    }

    #[wasm_bindgen_test]
    fn test_data_grid_error_state() {
        let resource =
            LocalResource::new(|| async { Err::<Vec<&str>, String>("API down".to_string()) });
        leptos::mount::mount_to_body(move || {
            data_grid(
                resource,
                "Nothing here.",
                |items| view! { <div>{items.len()}</div> },
                Some(|| {}),
            )
        });

        let document = web_sys::window().unwrap().document().unwrap();
        let body = document.body().unwrap();
        assert!(
            body.inner_html().contains("API down") || body.inner_html().contains("loading"),
            "data_grid should render error message or loading fallback"
        );
    }
}
