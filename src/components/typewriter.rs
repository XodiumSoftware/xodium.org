use leptos::prelude::*;
use leptos::task::tick;
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
    let text = props.text.clone();

    let tick = move || {
        if text.is_empty() {
            return;
        }

        let current_index = current_word_index.get();
        let current_text = text[current_index].clone();

        if !is_deleting.get() {
            if letter_index.get() < current_text.len() {
                let next = current_text[..letter_index.get() + 1].to_string();
                displayed.set(next);
                letter_index.update(|i| *i += 1);

                set_timeout(tick, Duration::from_millis(speed as u64));
            } else {
                set_timeout(
                    move || {
                        if unwrite {
                            is_deleting.set(true);
                            tick();
                        } else if loop_enabled || current_index < text.len() - 1 {
                            current_word_index.update(|i| *i = (*i + 1) % text.len());
                            letter_index.set(0);
                            displayed.set(String::new());
                            tick();
                        }
                    },
                    Duration::from_millis(start_pause as u64),
                );
            }
        } else {
            if letter_index.get() > 0 {
                let next = current_text[..letter_index.get() - 1].to_string();
                displayed.set(next);
                letter_index.update(|i| *i -= 1);

                set_timeout(tick, Duration::from_millis(speed as u64));
            } else {
                set_timeout(
                    move || {
                        is_deleting.set(false);
                        if loop_enabled || current_index < text.len() - 1 {
                            current_word_index.update(|i| *i = (*i + 1) % text.len());
                            letter_index.set(0);
                            displayed.set(String::new());
                        }
                        tick();
                    },
                    Duration::from_millis(end_pause as u64),
                );
            }
        }
    };

    on_mount(move || tick());

    view! {
        <div style="display:inline-block">
            {move || displayed.get()}
            <span class="cursor">"|"</span>
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
