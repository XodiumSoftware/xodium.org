use leptos::prelude::*;

fn language_color(language: &str) -> &'static str {
    match language {
        "Rust" => "bg-[#dea584]",
        "TypeScript" => "bg-[#3178c6]",
        "JavaScript" => "bg-[#f1e05a]",
        "Python" => "bg-[#3572A5]",
        "HTML" => "bg-[#e34c26]",
        "CSS" => "bg-[#563d7c]",
        "Java" | "java" => "bg-[#b07219]",
        "Go" => "bg-[#00ADD8]",
        "C" => "bg-[#555555]",
        "C++" => "bg-[#f34b7d]",
        "Kotlin" => "bg-[#A97BFF]",
        _ => "bg-base-content/50",
    }
}

#[derive(Clone)]
pub struct ProjectCardProperties {
    pub title: String,
    pub description: String,
    pub link: Option<String>,
    pub language: Option<String>,
    pub stargazers_count: u32,
}

#[component]
fn LanguageCircle(language: String) -> impl IntoView {
    let color = language_color(&language);
    view! { <span class=format!("badge badge-sm {} mr-1", color) title=language /> }
}

#[component]
fn StarIcon() -> impl IntoView {
    view! {
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    }
}

#[component]
pub fn ProjectCard(props: ProjectCardProperties) -> impl IntoView {
    let link = props.link.clone().unwrap_or_else(|| "#".to_string());
    let stargazers_url = format!("{}/stargazers", link);
    let language_opt = props.language.clone();
    let stars = props.stargazers_count;

    view! {
        <a
            href=link
            target="_blank"
            rel="noopener noreferrer"
            class="btn-lift hover:border-primary block h-full"
        >
            <div class="card bg-base-200/50 backdrop-blur h-full rounded-none">
                <div class="card-body">
                    <h2 class="card-title text-primary">
                        <img
                            src="/icons/github-repo.svg"
                            alt="GitHub Repository"
                            class="w-5 h-5 text-base-content/60"
                            style="filter: invert(1);"
                        />
                        {props.title}
                    </h2>
                    <p class="text-base-content/70 flex-grow">{props.description}</p>

                    <div class="card-actions justify-between items-center mt-auto">
                        <div class="flex items-center gap-1 text-base-content/60 text-sm">
                            {move || {
                                language_opt
                                    .clone()
                                    .map(|language| {
                                        view! {
                                            <>
                                                <LanguageCircle language=language.clone() />
                                                <span>{language}</span>
                                            </>
                                        }
                                    })
                            }}
                        </div>
                        {if stars > 0 {
                            view! {
                                <a
                                    href=stargazers_url
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    on:click=|e| e.stop_propagation()
                                    class="flex items-center gap-1 text-base-content/60 hover:text-primary text-sm transition-colors"
                                >
                                    <StarIcon />
                                    <span>{stars}</span>
                                </a>
                            }
                                .into_any()
                        } else {
                            view! {
                                <div class="flex items-center gap-1 text-base-content/60 text-sm">
                                    <StarIcon />
                                    <span>{stars}</span>
                                </div>
                            }
                                .into_any()
                        }}
                    </div>
                </div>
            </div>
        </a>
    }
}
