use gloo_net::http::Request;
use leptos::web_sys;
use serde::{Deserialize, Serialize};

const ORG: &str = "XodiumSoftware";
const API_BASE: &str = "https://api.github.com";
const CACHE_TTL_MS: f64 = 5.0 * 60.0 * 1000.0;

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Member {
    pub login: String,
    pub html_url: String,
    pub avatar_url: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Repo {
    pub name: String,
    pub description: Option<String>,
    pub html_url: String,
    pub language: Option<String>,
    pub stargazers_count: u32,
    pub fork: bool,
}

fn cache_get<T: for<'de> Deserialize<'de>>(key: &str) -> Option<T> {
    let storage = web_sys::window()?.local_storage().ok()??;
    let ts: f64 = storage.get_item(&format!("{key}:ts")).ok()??.parse().ok()?;
    if js_sys::Date::now() - ts > CACHE_TTL_MS {
        return None;
    }
    let raw = storage.get_item(key).ok()??;
    serde_json::from_str(&raw).ok()
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

async fn fetch<T: for<'de> Deserialize<'de> + Serialize>(endpoint: &str) -> Result<T, String> {
    let cache_key = format!("xodium:{endpoint}");

    if let Some(cached) = cache_get::<T>(&cache_key) {
        return Ok(cached);
    }

    let response = Request::get(&format!("{API_BASE}{endpoint}"))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !response.ok() {
        return Err(format!("GitHub API returned {}", response.status()));
    }

    let data = response.json::<T>().await.map_err(|e| e.to_string())?;
    cache_set(&cache_key, &data);
    Ok(data)
}

pub async fn fetch_members() -> Result<Vec<Member>, String> {
    fetch::<Vec<Member>>(&format!("/orgs/{ORG}/members?per_page=100")).await
}

pub async fn fetch_repos() -> Result<Vec<Repo>, String> {
    let mut repos =
        fetch::<Vec<Repo>>(&format!("/orgs/{ORG}/repos?per_page=100&type=public")).await?;
    repos.retain(|r| !r.fork);
    repos.sort_by(|a, b| b.stargazers_count.cmp(&a.stargazers_count));
    Ok(repos)
}
