use gloo_net::http::Request;
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

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Member {
    pub login: String,
    pub html_url: String,
    pub avatar_url: String,
    pub role: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Repo {
    pub name: String,
    pub description: Option<String>,
    pub html_url: String,
    pub language: Option<String>,
    pub stargazers_count: u32,
    pub fork: bool,
    pub topics: Vec<String>,
}

/// Read and deserialize a cache entry together with its timestamp.
///
/// Returns `None` when storage is unavailable, the entry is missing, or the
/// payload cannot be deserialized into `T`. The caller decides freshness
/// from the returned timestamp — expired entries are deliberately retained
/// so they can be served as a stale-if-error fallback.
fn cache_read<T: for<'de> Deserialize<'de>>(key: &str) -> Option<(T, f64)> {
    let storage = web_sys::window()?.local_storage().ok()??;
    let ts: f64 = storage.get_item(&format!("{key}:ts")).ok()??.parse().ok()?;
    let raw = storage.get_item(key).ok()??;
    serde_json::from_str(&raw).ok().map(|data| (data, ts))
}

fn cache_set<T: Serialize>(key: &str, data: &T) {
    let Some(Ok(Some(storage))) = web_sys::window().map(|w| w.local_storage()) else {
        return;
    };
    if let Ok(json) = serde_json::to_string(data) {
        let _ = storage.set_item(key, &json);
        let _ = storage.set_item(&format!("{key}:ts"), &js_sys::Date::now().to_string());
    }
}

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

fn format_network_error() -> String {
    "Could not reach GitHub. Please check your network connection and try again.".to_string()
}

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
            Ok(r) => r,
            Err(e) => {
                network_failure_count += 1;
                last_err = e.to_string();
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

        let data = response.json::<T>().await.map_err(|e| e.to_string())?;
        cache_set(&cache_key, &data);
        return Ok(data);
    }

    // All attempts failed: serve a stale cache entry if one exists (with a
    // console warning) instead of surfacing an error to the user.
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
/// Preserves any existing query parameters in `endpoint` and appends the
/// page and `per_page` parameters with the correct separator.
#[must_use]
fn paginated_endpoint(endpoint: &str, page: u32, per_page: usize) -> String {
    let sep = if endpoint.contains('?') { '&' } else { '?' };
    format!("{endpoint}{sep}page={page}&per_page={per_page}")
}

/// Fetches public organization members from the GitHub API.
///
/// # Errors
///
/// Returns an error if the GitHub API request fails and no cached data is
/// available. Expired cache entries are served as a last-resort fallback
/// (stale-if-error) rather than failing outright.
pub async fn fetch_members() -> Result<Vec<Member>, String> {
    let mut members = fetch_all::<Member>(&format!("/orgs/{ORG}/members")).await?;

    // Fetch all admins (owners) using role filter
    let owners = match fetch_all::<Member>(&format!("/orgs/{ORG}/members?role=admin")).await {
        Ok(o) => o,
        Err(e) => {
            web_sys::console::warn_1(
                &format!("Failed to fetch owner roles from GitHub API: {e}. All members will be labeled as 'Member'.").into()
            );
            Vec::new()
        }
    };
    let owner_logins: HashSet<String> = owners.into_iter().map(|m| m.login).collect();

    // Mark role for each member
    for member in &mut members {
        member.role = if owner_logins.contains(&member.login) {
            Some("Owner".to_string())
        } else {
            Some("Member".to_string())
        };
    }

    Ok(members)
}

/// Fetches public organization repositories from the GitHub API.
///
/// # Errors
///
/// Returns an error if the GitHub API request fails and no cached data is
/// available. Expired cache entries are served as a last-resort fallback
/// (stale-if-error) rather than failing outright.
pub async fn fetch_repos() -> Result<Vec<Repo>, String> {
    let mut repos = fetch_all::<Repo>(&format!("/orgs/{ORG}/repos?type=public")).await?;
    repos.retain(|r| !r.fork);
    repos.sort_by_key(|b| std::cmp::Reverse(b.stargazers_count));
    Ok(repos)
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    wasm_bindgen_test_configure!(run_in_browser);

    fn clear_cache(key: &str) {
        if let Some(Ok(Some(storage))) = web_sys::window().map(|w| w.local_storage()) {
            let _ = storage.remove_item(key);
            let _ = storage.remove_item(&format!("{key}:ts"));
        }
    }

    fn test_cache_key() -> &'static str {
        "xodium:test:github-cache"
    }

    fn sample_repo(name: &str) -> Repo {
        Repo {
            name: name.to_string(),
            description: None,
            html_url: format!("https://github.com/XodiumSoftware/{name}"),
            language: Some("Rust".to_string()),
            stargazers_count: 0,
            fork: false,
            topics: vec![],
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
        // Exponential backoff: RETRY_BASE_MS << (attempt - 1)
        // attempt 1: 1000 << 0 = 1000ms
        // attempt 2: 1000 << 1 = 2000ms
        // attempt 3: 1000 << 2 = 4000ms
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
    }

    #[wasm_bindgen_test]
    fn test_repo_deserialization() {
        let json = r#"{
            "name": "test-repo",
            "description": "A test repository",
            "html_url": "https://github.com/XodiumSoftware/test-repo",
            "language": "Rust",
            "stargazers_count": 42,
            "fork": false,
            "topics": ["cad", "cli", "rust"]
        }"#;

        let repo: Repo = serde_json::from_str(json).unwrap();
        assert_eq!(repo.name, "test-repo");
        assert_eq!(repo.description, Some("A test repository".to_string()));
        assert_eq!(repo.language, Some("Rust".to_string()));
        assert_eq!(repo.stargazers_count, 42);
        assert!(!repo.fork);
        assert_eq!(repo.topics, vec!["cad", "cli", "rust"]);
    }

    #[wasm_bindgen_test]
    async fn test_cache_operations() {
        // Test cache key format
        let endpoint = "/orgs/XodiumSoftware/members";
        let cache_key = format!("xodium:{endpoint}");
        assert_eq!(cache_key, "xodium:/orgs/XodiumSoftware/members");

        // Note: Full cache_read/cache_set tests require localStorage
        // which needs a browser environment. These are covered by
        // the integration tests when running with wasm-pack test.
    }

    #[wasm_bindgen_test]
    fn test_cache_miss_returns_none() {
        let key = test_cache_key();
        clear_cache(key);

        assert!(
            cache_read::<Vec<Repo>>(key).is_none(),
            "Missing cache key should return None"
        );
    }

    #[wasm_bindgen_test]
    fn test_cache_roundtrip() {
        let key = test_cache_key();
        clear_cache(key);

        let data = vec![sample_repo("roundtrip-repo")];
        cache_set(key, &data);

        let Some((cached, ts)) = cache_read::<Vec<Repo>>(key) else {
            panic!("Fresh cache entry should be returned");
        };
        assert_eq!(cached.len(), 1);
        assert_eq!(cached[0].name, "roundtrip-repo");
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

        let data = vec![sample_repo("expired-repo")];
        cache_set(key, &data);

        // Backdate the timestamp so the entry is past its TTL
        if let Some(Ok(Some(storage))) = web_sys::window().map(|w| w.local_storage()) {
            let expired_ts = (js_sys::Date::now() - CACHE_TTL_MS - 1.0).to_string();
            let _ = storage.set_item(&format!("{key}:ts"), &expired_ts);
        }

        // Expired entries stay readable (with their old timestamp) so fetch
        // can fall back to them when the network is unavailable.
        let Some((cached, ts)) = cache_read::<Vec<Repo>>(key) else {
            panic!("Expired cache entry should be retained as a stale fallback");
        };
        assert_eq!(cached[0].name, "expired-repo");
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
            paginated_endpoint("/orgs/XodiumSoftware/repos?type=public", 2, 50),
            "/orgs/XodiumSoftware/repos?type=public&page=2&per_page=50"
        );
        assert_eq!(
            paginated_endpoint("/endpoint?foo=bar", 10, 30),
            "/endpoint?foo=bar&page=10&per_page=30"
        );
    }

    #[wasm_bindgen_test]
    fn test_repo_filtering_and_sorting() {
        let mut repos = vec![
            Repo {
                name: "repo-a".to_string(),
                description: None,
                html_url: "https://github.com/XodiumSoftware/repo-a".to_string(),
                language: Some("Rust".to_string()),
                stargazers_count: 10,
                fork: false,
                topics: vec!["cad".to_string()],
            },
            Repo {
                name: "repo-b".to_string(),
                description: None,
                html_url: "https://github.com/XodiumSoftware/repo-b".to_string(),
                language: Some("Python".to_string()),
                stargazers_count: 50,
                fork: false,
                topics: vec!["python".to_string()],
            },
            Repo {
                name: "repo-c".to_string(),
                description: None,
                html_url: "https://github.com/XodiumSoftware/repo-c".to_string(),
                language: Some("Go".to_string()),
                stargazers_count: 30,
                fork: true, // This should be filtered out
                topics: vec![],
            },
        ];

        // Apply the same logic as fetch_repos
        repos.retain(|r| !r.fork);
        repos.sort_by_key(|b| std::cmp::Reverse(b.stargazers_count));

        assert_eq!(repos.len(), 2);
        assert_eq!(repos[0].name, "repo-b"); // 50 stars
        assert_eq!(repos[1].name, "repo-a"); // 10 stars
    }
}
