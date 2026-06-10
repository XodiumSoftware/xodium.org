# Task 12: Evaluate `leptos_i18n` scaffolding for future internationalization

## Summary
`leptos_i18n` is a mature, compile-time i18n library that is **compatible with Leptos 0.8.x and CSR**. It is a viable choice for xodium.org, but introduces build complexity and binary-size trade-offs that should be weighed against the current low volume of user-facing text.

---

## Compatibility

| Component | Status |
|-----------|--------|
| Leptos 0.8.17 | **Compatible** — `leptos_i18n` `0.6.x` is the matching version |
| CSR (Client Side Rendering) | **Supported** via the `csr` feature |
| Build tool (Trunk) | **Compatible** — works with `build.rs` + `copy-dir` for JSON assets |

---

## How It Works

1. **Translation files** live in `./locales/` (JSON/TOML/YAML).
2. **Build script** (`build.rs`) uses `leptos_i18n_build` to parse translations and generate an `i18n` module at compile time.
3. **Runtime** uses generated types (locales as enums, keys as structs) so accessing a missing key is a **compile error**.
4. **Macros** (`t!`, `td!`, etc.) produce reactive `impl IntoView` values.
5. For **CSR with lazy loading**, translations can be emitted as static JSON and fetched at runtime to keep the WASM binary small.

---

## Effort Estimate for xodium.org

### Low-hanging strings to extract
The entire site currently contains roughly **20–25 user-facing strings**:

| Location | Strings |
|----------|---------|
| `app.rs` | Skip-to-content label |
| `header.rs` | "PROJECTS", "TEAM", social aria-labels |
| `codeblock.rs` | Terminal title, CTA buttons, typewriter lines |
| `teamdeck.rs` | "THE TEAM", "No team members found.", keyboard hint |
| `projectgrid.rs` | "No projects found." |
| `projectcard.rs` | "Docs" tooltip, SVG aria (non-text) |
| `footer.rs` | "About", "Licensing", "Contact", copyright sentence |

### Integration steps (if pursued)
1. Add `leptos_i18n = "0.6"` (with `csr` feature) and `leptos_i18n_build = "0.6"` to `Cargo.toml`.
2. Create `locales/en.json` and move all strings into it.
3. Add `build.rs` to generate the `i18n` module (≈15 lines).
4. Import `i18n::*` in `lib.rs` or `app.rs`.
5. Wrap `<App />` with `<I18nContextProvider>`.
6. Replace every hardcoded string with `t!(i18n, key)`.
7. Add `data-trunk rel="copy-dir"` in `index.html` if using `dynamic_load`.

**Estimated effort:** ½–1 day for scaffolding + string migration.

---

## Binary Size Impact (Critical for This Project)

The project is aggressively size-optimized (`opt-level = "z"`, `lto = true`, `strip = true`). `leptos_i18n` can affect size in two ways:

### 1. Baked ICU4X data (default)
By default, ICU4X includes data for **all locales**, which adds significant weight.
- **Mitigation:** Disable default features (`default-features = false`), remove `"icu_compiled_data"`, and generate a custom ICU data provider for only the locales you support (e.g., `en`, `nl`).
- **Measured result:** The upstream docs report a plurals example dropping from **394 kB → 248 kB** with a custom provider.

### 2. Baked translations
All translation strings are compiled into the binary by default.
- **Mitigation:** Enable the `dynamic_load` feature for CSR.
  - Keeps translation **code** in WASM but moves **string values** to external JSON.
  - JSON files are copied into `dist/` by Trunk and fetched at runtime.
  - Best when supporting many locales or long text blocks.

**Recommendation for xodium.org:**
- If you only ever support **1–2 locales**, use the default baked mode with a **custom ICU provider** to keep size minimal.
- If you plan to support **3+ locales**, use **`dynamic_load`** so JSON payloads are fetched on demand rather than embedded in the WASM bundle.

---

## Pros

- Compile-time key safety (no missing translation runtime errors).
- First-class Leptos integration (reactive `t!` macro, `I18nContext`).
- CSR is explicitly supported with a dedicated feature.
- Excellent docs and active maintenance (last release April 2026).
- Size can be tuned with custom ICU datagen and `dynamic_load`.

## Cons

- Adds a `build.rs` dependency and generated-code complexity.
- ICU4X baked data bloats binaries unless manually trimmed.
- `dynamic_load` makes string access async, which complicates non-view code (e.g., `t_string!` becomes a Future).
- Currently the site has very few strings; i18n is **low ROI** until expansion or multi-language demand arises.

---

## Verdict

✅ **Viable and well-supported.** `leptos_i18n` is the clear choice if/when xodium.org needs internationalization.

⏸️ **Not urgent today.** Given the tiny surface area of user-facing text, the scaffolding should be deferred until:
- A second locale is actually needed, **or**
- A new content-heavy section (e.g., About/Mission docs) is added, increasing string volume.

When the time comes, the recommended stack is:
- `leptos_i18n` with `csr` + `dynamic_load`
- Custom ICU datagen for `en` (and future locales) to protect the size budget
- Trunk `copy-dir` to serve JSON translations alongside the WASM bundle
