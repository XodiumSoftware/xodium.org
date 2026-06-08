use leptos::wasm_bindgen::JsCast;

/// Wraps a `wasm_bindgen::closure::Closure` so it can be used with APIs
/// that require `Send + Sync` (like Leptos `on_cleanup`).
///
/// # Safety
///
/// This is sound because WASM is single-threaded; there is only ever one
/// thread of execution, so `Send` and `Sync` are trivially satisfied.
pub struct SendWrapper<T>(pub T);

unsafe impl<T> Send for SendWrapper<T> {}
unsafe impl<T> Sync for SendWrapper<T> {}

impl<T> SendWrapper<T> {
    /// Convert the wrapped closure to a `js_sys::Function` reference.
    ///
    /// # Panics
    ///
    /// Panics if the inner value cannot be cast to `Function`.
    pub fn as_function(&self) -> js_sys::Function
    where
        T: JsCast,
    {
        self.0.as_ref().unchecked_ref::<js_sys::Function>().clone()
    }
}
