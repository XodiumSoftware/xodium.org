use leptos::prelude::*;

#[derive(Clone)]
pub struct ProjectCardProperties {
    pub title: String,
    pub description: String,
    pub link: Option<String>,
    pub language: Option<String>,
}

#[component]
fn LanguageCircle(language: String) -> impl IntoView {
    let color = match language.as_str() {
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
    };

    view! { <span class=format!("badge badge-sm {} mr-1", color) title=language /> }
}

#[component]
pub fn ProjectCard(props: ProjectCardProperties) -> impl IntoView {
    let link = props.link.clone().unwrap_or_else(|| "#".to_string());
    let language_opt = props.language.clone();

    view! {
        <a href=link target="_blank" rel="noopener noreferrer">
            <div class="card bg-base-200/50 backdrop-blur shadow-xl hover:ring-2 hover:ring-primary h-full transition-all">
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

                    <div>
                        {move || {
                            language_opt
                                .clone()
                                .map(|language| {
                                    view! {
                                        <div class="card-actions justify-start mt-auto">
                                            <div class="flex items-center gap-1 text-base-content/60 text-sm">
                                                <LanguageCircle language=language.clone() />
                                                {language}
                                            </div>
                                        </div>
                                    }
                                })
                        }}
                    </div>
                </div>
            </div>
        </a>
    }
}
