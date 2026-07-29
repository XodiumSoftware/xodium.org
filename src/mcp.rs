use crate::github::{Member, Repo, fetch_members, fetch_repos};
use js_sys::Promise;
use leptos::wasm_bindgen::closure::Closure;
use leptos::wasm_bindgen::{JsCast, JsValue};
use serde::Serialize;
use wasm_bindgen_futures::future_to_promise;

/// Lightweight project summary exposed to browser agents.
#[derive(Serialize)]
struct ProjectInfo {
    name: String,
    description: String,
    url: String,
    language: String,
    stars: u32,
}

/// Lightweight team member summary exposed to browser agents.
#[derive(Serialize)]
struct TeamMemberInfo {
    login: String,
    profile: String,
    avatar: String,
}

impl From<Repo> for ProjectInfo {
    fn from(repo: Repo) -> Self {
        Self {
            name: repo.name,
            description: repo.description.unwrap_or_default(),
            url: repo.html_url,
            language: repo.language.unwrap_or_default(),
            stars: repo.stargazers_count,
        }
    }
}

impl From<Member> for TeamMemberInfo {
    fn from(member: Member) -> Self {
        Self {
            login: member.login,
            profile: member.html_url,
            avatar: member.avatar_url,
        }
    }
}

fn serialize<T: Serialize>(value: T) -> Result<JsValue, JsValue> {
    serde_wasm_bindgen::to_value(&value).map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Expose lightweight site tools on `window.xodiumwebMcp` so that browser
/// agents can query projects and team members through the same cached,
/// retry-aware Rust client used by the UI.
///
/// Each exposed function returns a JavaScript `Promise`. A custom
/// `xodiumweb-mcp-ready` event is dispatched on `window` once the tools are
/// available.
pub fn expose_mcp_tools() {
    let Some(window) = leptos::web_sys::window() else {
        return;
    };

    let mcp = js_sys::Object::new();

    // listProjects(limit) -> Promise<Array<ProjectInfo>>
    let list_projects = Closure::wrap(Box::new(move |limit: u32| -> Promise {
        future_to_promise(async move {
            fetch_repos()
                .await
                .map(|repos| {
                    let projects: Vec<ProjectInfo> = repos
                        .into_iter()
                        .take(limit as usize)
                        .map(ProjectInfo::from)
                        .collect();
                    serialize(projects)
                })
                .map_err(|e| JsValue::from_str(&e))?
        })
    }) as Box<dyn FnMut(u32) -> Promise>);

    let _ = js_sys::Reflect::set(
        &mcp,
        &"listProjects".into(),
        list_projects.as_ref().unchecked_ref::<js_sys::Function>(),
    );
    std::mem::forget(list_projects);

    // listTeam() -> Promise<Array<TeamMemberInfo>>
    let list_team = Closure::wrap(Box::new(move || -> Promise {
        future_to_promise(async move {
            fetch_members()
                .await
                .map(|members| {
                    let team: Vec<TeamMemberInfo> =
                        members.into_iter().map(TeamMemberInfo::from).collect();
                    serialize(team)
                })
                .map_err(|e| JsValue::from_str(&e))?
        })
    }) as Box<dyn FnMut() -> Promise>);

    let _ = js_sys::Reflect::set(
        &mcp,
        &"listTeam".into(),
        list_team.as_ref().unchecked_ref::<js_sys::Function>(),
    );
    std::mem::forget(list_team);

    let _ = js_sys::Reflect::set(&window, &"xodiumwebMcp".into(), &mcp);

    // Notify any waiting inline scripts that the tools are ready.
    if let Ok(event) = leptos::web_sys::Event::new("xodiumweb-mcp-ready") {
        let _ = window.dispatch_event(&event);
    }
}
