use leptos::prelude::*;
use leptos::task::spawn_local;
use std::time::Duration;

#[derive(Clone)]
pub struct TypewriterProperties {
    pub text: Vec<String>,
    pub speed: Option<f64>,
    pub loop_enabled: Option<bool>,
    pub pause: Option<(f64, f64)>,
    pub unwrite: Option<bool>,
}

#[component]
pub fn Typewriter(props: TypewriterProperties) -> impl IntoView {
    let displayed = RwSignal::new(String::new());
    let letter_index = RwSignal::new(0usize);
    let current_word_index = RwSignal::new(0usize);
    let is_deleting = RwSignal::new(false);

    let speed = props.speed.unwrap_or(0.05) * 1000.0;
    let (start_pause, end_pause) = props.pause.unwrap_or((1.5, 1.5));
    let start_pause = start_pause * 1000.0;
    let end_pause = end_pause * 1000.0;

    let loop_enabled = props.loop_enabled.unwrap_or(false);
    let unwrite = props.unwrite.unwrap_or(false);
    let text = StoredValue::new(props.text);

    Effect::new(move || {
        let text = text.get_value();

        spawn_local(async move {
            typewrite_loop(
                text,
                displayed,
                letter_index,
                current_word_index,
                is_deleting,
                speed,
                start_pause,
                end_pause,
                loop_enabled,
                unwrite,
            )
            .await;
        });
    });

    view! {
        <div style="display:inline-block">
            {move || displayed.get()} <span class="cursor">"|"</span>
            <style>
                "
                .cursor {
                    display: inline-block;
                    margin-left: 2px;
                    animation: blink 1s step-start infinite;
                }
                @keyframes blink {
                    50% { opacity: 0; }
                }
                "
            </style>
        </div>
    }
}

async fn typewrite_loop(
    text: Vec<String>,
    displayed: RwSignal<String>,
    letter_index: RwSignal<usize>,
    current_word_index: RwSignal<usize>,
    is_deleting: RwSignal<bool>,
    speed: f64,
    start_pause: f64,
    end_pause: f64,
    loop_enabled: bool,
    unwrite: bool,
) {
    if text.is_empty() {
        return;
    }

    loop {
        let current_index = current_word_index.get_untracked();
        let current_text = text[current_index].clone();

        if !is_deleting.get_untracked() {
            // Typing phase
            while letter_index.get_untracked() < current_text.len() {
                let next = current_text[..letter_index.get_untracked() + 1].to_string();
                displayed.set(next);
                letter_index.update(|i| *i += 1);
                gloo_timers::future::sleep(Duration::from_millis(speed as u64)).await;
            }

            // Pause at the end of the word
            gloo_timers::future::sleep(Duration::from_millis(start_pause as u64)).await;

            if unwrite {
                is_deleting.set(true);
            } else if loop_enabled || current_index < text.len() - 1 {
                current_word_index.update(|i| *i = (*i + 1) % text.len());
                letter_index.set(0);
                displayed.set(String::new());
                continue;
            } else {
                break;
            }
        }

        if is_deleting.get_untracked() {
            // Deleting phase
            while letter_index.get_untracked() > 0 {
                let next = current_text[..letter_index.get_untracked() - 1].to_string();
                displayed.set(next);
                letter_index.update(|i| *i -= 1);
                gloo_timers::future::sleep(Duration::from_millis(speed as u64)).await;
            }

            // Pause after deleting
            gloo_timers::future::sleep(Duration::from_millis(end_pause as u64)).await;

            is_deleting.set(false);
            if loop_enabled || current_index < text.len() - 1 {
                current_word_index.update(|i| *i = (*i + 1) % text.len());
                letter_index.set(0);
                displayed.set(String::new());
            } else {
                break;
            }
        }
    }
}
