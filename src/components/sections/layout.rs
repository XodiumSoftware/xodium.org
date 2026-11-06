//! Layout regions that stack vertically inside the drawing sheet.
//!
//! Each module is one band of the page: a wrapper that owns its own internal
//! arrangement (single column, two columns, three columns) while the sheet
//! owns the overall width and centring. They are intentionally presentation
//! only until real content is poured into them. The opener band is
//! [`Header`](crate::components::sections::header::Header) rather than a
//! module here.

/// Three-column band below the hero.
pub mod tri_column;
/// Two-column band below the header.
pub mod two_column;
