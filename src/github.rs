//! GitHub API client with `localStorage` caching and exponential backoff.
//!
//! Public endpoints for organization members are exposed as async functions.
//! Internal helpers handle cache reads/writes, pagination, retries, and
//! user-facing error formatting.

use gloo_net::http::Request;
use gloo_storage::{LocalStorage, Storage};
use leptos::web_sys;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::time::Duration;

const ORG: &str = "XodiumSoftware";
const API_BASE: &str = "https://api.github.com";
const CACHE_TTL_MS: f64 = 5.0 * 60.0 * 1000.0;
const MAX_RETRIES: u32 = 3;
const RETRY_BASE_MS: u64 = 1000;
const PER_PAGE: usize = 100;

/// A public member of the `XodiumSoftware` GitHub organization.
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Member {
    /// GitHub login / username.
    pub login: String,
    /// Public GitHub profile URL.
    pub html_url: String,
    /// Avatar image URL.
    pub avatar_url: String,
    /// Organizational role, set by [`fetch_members`] after comparing the
    /// member list against the organization's admins.
    pub role: Option<String>,
}

/// Read and deserialize a cache entry together with its timestamp.
///
/// Returns `None` when storage is unavailable, the entry is missing, or the
/// payload cannot be deserialized into `T`. Expired entries are retained for
/// use as a stale-if-error fallback.
fn cache_read<T: for<'de> Deserialize<'de>>(key: &str) -> Option<(T, f64)> {
    let ts: f64 = LocalStorage::get(format!("{key}:ts")).ok()?;
    let data: T = LocalStorage::get(key).ok()?;
    Some((data, ts))
}

/// Serialize data and its timestamp into local storage.
///
/// Failures are logged to the console but not propagated; the caller already
/// has the fetched data and can continue without caching.
fn cache_set<T: Serialize>(key: &str, data: &T) {
    if let Err(error) = LocalStorage::set(key, data) {
        web_sys::console::warn_1(&format!("Failed to write cache entry {key}: {error}").into());
    }
    if let Err(error) = LocalStorage::set(format!("{key}:ts"), js_sys::Date::now()) {
        web_sys::console::warn_1(
            &format!("Failed to write cache timestamp for {key}: {error}").into(),
        );
    }
}

/// Format an HTTP error status into a user-facing message.
fn format_api_error(status: u16) -> String {
    match status {
        403 => "GitHub API rate limit reached. Please try again later.".to_string(),
        404 => "Organization or resource not found on GitHub.".to_string(),
        500 | 502 | 503 | 504 => {
            "GitHub is temporarily unavailable. Please try again later.".to_string()
        }
        _ => format!("Failed to load data from GitHub (status {status}). Please try again later."),
    }
}

/// Return a user-facing network error message.
fn format_network_error() -> String {
    "Could not reach GitHub. Please check your network connection and try again.".to_string()
}

/// Fetch `T` from the GitHub API using a local storage cache and exponential backoff.
///
/// Fresh cached data is returned immediately. Otherwise, the endpoint is
/// requested up to `MAX_RETRIES + 1` times. If all attempts fail, expired
/// cached data is returned when available.
///
/// # Errors
///
/// Returns an error when all attempts fail and no stale cached data is available.
async fn fetch<T: for<'de> Deserialize<'de> + Serialize>(endpoint: &str) -> Result<T, String> {
    let cache_key = format!("xodium:{endpoint}");

    let stale: Option<T> = match cache_read::<T>(&cache_key) {
        Some((data, ts)) if js_sys::Date::now() - ts <= CACHE_TTL_MS => return Ok(data),
        Some((data, _)) => Some(data),
        None => None,
    };

    let url = format!("{API_BASE}{endpoint}");
    let mut last_err = String::new();
    let mut network_failure_count: u32 = 0;

    for attempt in 0..=MAX_RETRIES {
        if attempt > 0 {
            gloo_timers::future::sleep(Duration::from_millis(RETRY_BASE_MS << (attempt - 1))).await;
        }

        let response = match Request::get(&url).send().await {
            Ok(response) => response,
            Err(error) => {
                network_failure_count += 1;
                last_err = error.to_string();
                continue;
            }
        };

        if response.status() >= 500 {
            last_err = format_api_error(response.status());
            continue;
        }

        if !response.ok() {
            return Err(format_api_error(response.status()));
        }

        let data = response
            .json::<T>()
            .await
            .map_err(|error| error.to_string())?;
        cache_set(&cache_key, &data);

        return Ok(data);
    }

    if let Some(stale) = stale {
        web_sys::console::warn_1(
            &format!("GitHub API request failed for {endpoint}; serving stale cached data.").into(),
        );

        return Ok(stale);
    }

    if network_failure_count > 0 {
        Err(format_network_error())
    } else {
        Err(last_err)
    }
}

/// Fetch all pages from a paginated GitHub API endpoint.
///
/// # Errors
///
/// Returns an error if fetching any page fails without a usable cached fallback.
async fn fetch_all<T: for<'de> Deserialize<'de> + Serialize>(
    endpoint: &str,
) -> Result<Vec<T>, String> {
    let mut all = Vec::new();
    let mut page = 1u32;

    loop {
        let page_endpoint = paginated_endpoint(endpoint, page, PER_PAGE);
        let items: Vec<T> = fetch(&page_endpoint).await?;
        let done = items.len() < PER_PAGE;

        all.extend(items);

        if done {
            break;
        }

        page += 1;
    }

    Ok(all)
}

/// Build a paginated endpoint URL.
///
/// Preserves existing query parameters and appends the page and `per_page`
/// parameters using the appropriate separator.
#[must_use]
fn paginated_endpoint(endpoint: &str, page: u32, per_page: usize) -> String {
    let separator = if endpoint.contains('?') { '&' } else { '?' };

    format!("{endpoint}{separator}page={page}&per_page={per_page}")
}

/// Fetch public members of the `XodiumSoftware` GitHub organization.
///
/// Members are labeled as `Owner` when their login appears in the
/// organization's admin-member endpoint, and `Member` otherwise.
///
/// # Errors
///
/// Returns an error if fetching the member list fails and no cached data
/// is available. Expired cached data is used as a stale-if-error fallback.
pub async fn fetch_members() -> Result<Vec<Member>, String> {
    let mut members = fetch_all::<Member>(&format!("/orgs/{ORG}/members")).await?;

    let owners = match fetch_all::<Member>(&format!("/orgs/{ORG}/members?role=admin")).await {
        Ok(owners) => owners,
        Err(error) => {
            web_sys::console::warn_1(
                &format!(
                    "Failed to fetch owner roles from GitHub API: {error}. \
                    All members will be labeled as 'Member'."
                )
                .into(),
            );

            Vec::new()
        }
    };

    let owner_logins: HashSet<String> = owners.into_iter().map(|member| member.login).collect();

    for member in &mut members {
        member.role = Some(
            if owner_logins.contains(&member.login) {
                "Owner"
            } else {
                "Member"
            }
            .to_string(),
        );
    }

    Ok(members)
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    wasm_bindgen_test_configure!(run_in_browser);

    fn clear_cache(key: &str) {
        LocalStorage::delete(key);
        LocalStorage::delete(format!("{key}:ts"));
    }

    fn test_cache_key() -> &'static str {
        "xodium:test:github-cache"
    }

    fn sample_member(login: &str) -> Member {
        Member {
            login: login.to_string(),
            html_url: format!("https://github.com/{login}"),
            avatar_url: format!("https://avatars.githubusercontent.com/{login}"),
            role: Some("Member".to_string()),
        }
    }

    #[wasm_bindgen_test]
    #[allow(clippy::float_cmp)]
    fn test_constants() {
        assert_eq!(ORG, "XodiumSoftware");
        assert_eq!(API_BASE, "https://api.github.com");
        assert_eq!(CACHE_TTL_MS, 5.0 * 60.0 * 1000.0);
        assert_eq!(MAX_RETRIES, 3);
        assert_eq!(RETRY_BASE_MS, 1000);
        assert_eq!(PER_PAGE, 100);
    }

    #[wasm_bindgen_test]
    fn test_retry_backoff_delays() {
        let expected: Vec<u64> = (1..=MAX_RETRIES)
            .map(|attempt| RETRY_BASE_MS << (attempt - 1))
            .collect();

        assert_eq!(expected, vec![1000, 2000, 4000]);
    }

    #[wasm_bindgen_test]
    fn test_member_deserialization() {
        let json = r#"{
            "login": "testuser",
            "html_url": "https://github.com/testuser",
            "avatar_url": "https://avatars.githubusercontent.com/u/123?v=4"
        }"#;

        let member: Member = serde_json::from_str(json).unwrap();

        assert_eq!(member.login, "testuser");
        assert_eq!(member.html_url, "https://github.com/testuser");
        assert_eq!(
            member.avatar_url,
            "https://avatars.githubusercontent.com/u/123?v=4"
        );
        assert_eq!(member.role, None);
    }

    #[wasm_bindgen_test]
    fn test_cache_miss_returns_none() {
        let key = test_cache_key();
        clear_cache(key);

        assert!(
            cache_read::<Vec<Member>>(key).is_none(),
            "Missing cache key should return None"
        );
    }

    #[wasm_bindgen_test]
    fn test_cache_roundtrip() {
        let key = test_cache_key();
        clear_cache(key);

        let data = vec![sample_member("roundtrip-user")];
        cache_set(key, &data);

        let Some((cached, ts)) = cache_read::<Vec<Member>>(key) else {
            panic!("Fresh cache entry should be returned");
        };

        assert_eq!(cached.len(), 1);
        assert_eq!(cached[0].login, "roundtrip-user");
        assert!(
            js_sys::Date::now() - ts <= CACHE_TTL_MS,
            "Fresh entry should be within its TTL"
        );

        clear_cache(key);
    }

    #[wasm_bindgen_test]
    fn test_cache_expired_entry_is_retained_as_stale() {
        let key = test_cache_key();
        clear_cache(key);

        let data = vec![sample_member("expired-user")];
        cache_set(key, &data);

        let expired_ts = js_sys::Date::now() - CACHE_TTL_MS - 1.0;
        let _ = LocalStorage::set(format!("{key}:ts"), expired_ts);

        let Some((cached, ts)) = cache_read::<Vec<Member>>(key) else {
            panic!("Expired cache entry should be retained as a stale fallback");
        };

        assert_eq!(cached[0].login, "expired-user");
        assert!(
            js_sys::Date::now() - ts > CACHE_TTL_MS,
            "Backdated entry should be past its TTL"
        );

        clear_cache(key);
    }

    #[wasm_bindgen_test]
    fn test_format_api_error_messages() {
        assert_eq!(
            format_api_error(403),
            "GitHub API rate limit reached. Please try again later."
        );
        assert_eq!(
            format_api_error(404),
            "Organization or resource not found on GitHub."
        );

        for status in [500, 502, 503, 504] {
            assert_eq!(
                format_api_error(status),
                "GitHub is temporarily unavailable. Please try again later."
            );
        }

        assert_eq!(
            format_api_error(418),
            "Failed to load data from GitHub (status 418). Please try again later."
        );
    }

    #[wasm_bindgen_test]
    fn test_format_network_error_message() {
        assert_eq!(
            format_network_error(),
            "Could not reach GitHub. Please check your network connection and try again."
        );
    }

    #[wasm_bindgen_test]
    fn test_paginated_endpoint() {
        assert_eq!(
            paginated_endpoint("/orgs/XodiumSoftware/members", 1, 100),
            "/orgs/XodiumSoftware/members?page=1&per_page=100"
        );
        assert_eq!(
            paginated_endpoint("/orgs/XodiumSoftware/members?role=admin", 2, 50),
            "/orgs/XodiumSoftware/members?role=admin&page=2&per_page=50"
        );
        assert_eq!(
            paginated_endpoint("/endpoint?foo=bar", 10, 30),
            "/endpoint?foo=bar&page=10&per_page=30"
        );
    }

    #[wasm_bindgen_test]
    fn test_member_role_assignment() {
        let mut members = vec![sample_member("owner-user"), sample_member("regular-user")];
        let owner_logins: HashSet<String> = ["owner-user".to_string()].into();

        for member in &mut members {
            member.role = Some(
                if owner_logins.contains(&member.login) {
                    "Owner"
                } else {
                    "Member"
                }
                .to_string(),
            );
        }

        assert_eq!(members[0].role.as_deref(), Some("Owner"));
        assert_eq!(members[1].role.as_deref(), Some("Member"));
    }
}
