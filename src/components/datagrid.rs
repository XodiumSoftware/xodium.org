use leptos::prelude::*;

pub fn data_grid<T, IV, F>(
    resource: LocalResource<Result<Vec<T>, String>>,
    empty_message: &'static str,
    render: F,
) -> impl IntoView
where
    T: Clone + Send + Sync + 'static,
    IV: IntoView + 'static,
    F: Fn(Vec<T>) -> IV + Copy + Send + Sync + 'static,
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
                    view! {
                        <div class="flex items-center justify-center text-center">
                            <span class="text-error">{err}</span>
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
