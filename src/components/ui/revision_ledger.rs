use leptos::prelude::*;

/// One row in the revision ledger — a single drawing revision entry.
pub struct LedgerEntry {
    pub rev: &'static str,
    pub date: &'static str,
    pub description: &'static str,
    pub approved: &'static str,
}

/// Revision ledger — the table of drawing revisions that sits above the
/// title block on engineering drawings. Each row records a revision letter,
/// the date, a one-line description, and the approver's initials.
///
/// Entries should be ordered oldest → newest; the table renders them in
/// reverse so the most recent revision sits at the top (drawing convention).
#[component]
#[must_use]
pub fn RevisionLedger() -> impl IntoView {
    view! {
        <table
            aria-label="Revision history"
            class="revision-ledger font-mono text-xs leading-snug text-base-content"
        >
            <thead>
                <tr>
                    <th class="revision-ledger-header-cell">"REV"</th>
                    <th class="revision-ledger-header-cell">"DATE"</th>
                    <th class="revision-ledger-header-cell revision-ledger-cell-wide">"DESCRIPTION"</th>
                    <th class="revision-ledger-header-cell">"APPVD"</th>
                </tr>
            </thead>
            <tbody>
                <tr class="revision-ledger-row">
                    <td class="revision-ledger-cell">"A"</td>
                    <td class="revision-ledger-cell">"2026-10-16"</td>
                    <td class="revision-ledger-cell revision-ledger-cell-wide">"INITIAL RELEASE"</td>
                    <td class="revision-ledger-cell">"XDM"</td>
                </tr>
                <tr class="revision-ledger-row">
                    <td class="revision-ledger-cell">"B"</td>
                    <td class="revision-ledger-cell">"2026-10-16"</td>
                    <td class="revision-ledger-cell revision-ledger-cell-wide">"BLUEPRINT THEME"</td>
                    <td class="revision-ledger-cell">"XDM"</td>
                </tr>
            </tbody>
        </table>
    }
}
