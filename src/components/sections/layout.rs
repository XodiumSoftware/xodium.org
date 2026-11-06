//! Layout regions that stack vertically inside the drawing sheet.
//!
//! Each module is one band of the page: a wrapper that owns its own internal
//! arrangement (single column, two columns, three columns) while the sheet
//! owns the overall width and centring. They are intentionally presentation
//! only until real content is poured into them.

/// Page banner band, spanning the sheet.
pub mod banner;
/// Large focal band below the two-column row.
pub mod hero;
/// Three-column band below the hero.
pub mod tri_column;
/// Two-column band below the banner.
pub mod two_column;
