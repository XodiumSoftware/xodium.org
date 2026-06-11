use leptos::prelude::*;

pub fn data_grid<T, IV, F, R, E, EV>(
    resource: LocalResource<Result<Vec<T>, String>>,
    empty_message: E,
    render: F,
    on_retry: Option<R>,
) -> impl IntoView
where
    T: Clone + Send + Sync + 'static,
    IV: IntoView + 'static,
    F: Fn(Vec<T>) -> IV + Copy + Send + Sync + 'static,
    R: Fn() + Clone + Send + Sync + 'static,
    E: Fn() -> EV + Clone + Send + Sync + 'static,
    EV: IntoView + 'static,
{
    data_grid_with_fallback(resource, empty_message, render, on_retry, move || {
        view! {
            <div class="flex items-center justify-center text-center">
                <span class="loading loading-spinner loading-lg text-primary" />
            </div>
        }
    })
}

pub fn data_grid_with_fallback<T, IV, F, R, E, EV, FV, FVOut>(
    resource: LocalResource<Result<Vec<T>, String>>,
    empty_message: E,
    render: F,
    on_retry: Option<R>,
    fallback: FV,
) -> impl IntoView
where
    T: Clone + Send + Sync + 'static,
    IV: IntoView + 'static,
    F: Fn(Vec<T>) -> IV + Copy + Send + Sync + 'static,
    R: Fn() + Clone + Send + Sync + 'static,
    E: Fn() -> EV + Clone + Send + Sync + 'static,
    EV: IntoView + 'static,
    FV: Fn() -> FVOut + Clone + Send + Sync + 'static,
    FVOut: IntoView + 'static,
{
    view! {
        <Suspense fallback=move || { fallback() }>
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
                                <span class="text-base-content/70">{empty_message()}</span>
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
