use leptos::server_fn::request::browser::Request;
use serde::{Deserialize, Serialize};

const ORG: &str = "XodiumSoftware";
const API_BASE: &str = "https://api.github.com";

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

async fn fetch<T: for<'de> serde::Deserialize<'de>>(endpoint: &str) -> Result<T, String> {
    let response = Request::get(&format!("{API_BASE}{endpoint}"))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !response.ok() {
        return Err(format!("GitHub API returned {}", response.status()));
    }

    response.json::<T>().await.map_err(|e| e.to_string())
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
