use crate::components::datagrid::data_grid;
use crate::components::teamcard::{TeamCard, TeamCardProperties};
use crate::github::{fetch_members, Member};
use leptos::prelude::*;

#[component]
pub fn TeamGrid() -> impl IntoView {
    let resource = LocalResource::new(|| async { fetch_members().await });
    data_grid(resource, "No team members found.", |members: Vec<Member>| {
        view! {
            <ul class="menu gap-3">
                {members
                    .into_iter()
                    .map(|member| {
                        view! {
                            <TeamCard props=TeamCardProperties {
                                login: member.login,
                                html_url: member.html_url,
                                avatar_url: member.avatar_url,
                            } />
                        }
                    })
                    .collect_view()}
            </ul>
        }
    })
}
