use leptos::prelude::*;
use leptos::task::spawn_local;
use std::time::Duration;

const ASCII_ART: &str = r#"
         ,-.--,  _,.---._                 .=-.-.                   ___   
.--.-.  /=/, .',-.' , -  `.   _,..---._  /==/_ /.--.-. .-.-..-._ .'=.'\  
\==\ -\/=/- / /==/_,  ,  - \/==/,   -  \|==|, |/==/ -|/=/  /==/ \|==|  | 
 \==\ `-' ,/ |==|   .=.     |==|   _   _\==|  ||==| ,||=| -|==|,|  / - | 
  |==|,  - | |==|_ : ;=:  - |==|  .=.   |==|- ||==|- | =/  |==|  \/  , | 
 /==/   ,   \|==| , '='     |==|,|   | -|==| ,||==|,  \/ - |==|- ,   _ | 
/==/, .--, - \\==\ -    ,_ /|==|  '='   /==|- ||==|-   ,   /==| _ /\   | 
\==\- \/=/ , / '.='. -   .' |==|-,   _`//==/. //==/ , _  .'/==/  / / , / 
 `--`-'  `--`    `--`--''   `-.`.____.' `--`-` `--`..---'  `--`./  `--`  
"#;

const COMPANY_VALUES: &[&str] = &[
    "Building open-source tools for developers",
    "Crafting CAD software with precision",
    "Empowering creativity through code",
    "Made with passion",
];

#[component]
pub fn CodeBlock() -> impl IntoView {
    let (show_ascii, set_show_ascii) = signal(false);
    let (lines, set_lines) = signal(Vec::<String>::new());
    let (current_line, set_current_line) = signal(0usize);
    let (cursor_visible, set_cursor_visible) = signal(true);
    let (show_buttons, set_show_buttons) = signal(false);

    // Cursor blink effect
    Effect::new(move |_| {
        spawn_local(async move {
            loop {
                gloo_timers::future::sleep(Duration::from_millis(530)).await;
                set_cursor_visible.update(|v| *v = !*v);
            }
        });
    });

    // Show ASCII art first, then type out lines
    Effect::new(move |_| {
        spawn_local(async move {
            // Initial delay
            gloo_timers::future::sleep(Duration::from_millis(500)).await;
            set_show_ascii.set(true);

            // Wait for ASCII to be visible
            gloo_timers::future::sleep(Duration::from_millis(800)).await;

            for (i, &line) in COMPANY_VALUES.iter().enumerate() {
                set_current_line.set(i);

                // Type each character
                let mut typed = String::new();
                for ch in line.chars() {
                    typed.push(ch);
                    set_lines.update(|lines| {
                        if lines.len() <= i {
                            lines.push(typed.clone());
                        } else {
                            lines[i] = typed.clone();
                        }
                    });
                    gloo_timers::future::sleep(Duration::from_millis(30)).await;
                }

                // Pause between lines
                gloo_timers::future::sleep(Duration::from_millis(400)).await;
            }

            // Show buttons after typing complete
            gloo_timers::future::sleep(Duration::from_millis(600)).await;
            set_show_buttons.set(true);
        });
    });

    view! {
        <div class="w-full max-w-2xl mx-auto">
            // Terminal window
            <div class="bg-base-300 rounded-lg overflow-hidden shadow-2xl border border-base-content/10">
                // Terminal header
                <div class="bg-base-200 px-4 py-2 flex items-center gap-2 border-b border-base-content/5">
                    <div class="flex gap-1.5">
                        <div class="w-3 h-3 rounded-full bg-error/80"></div>
                        <div class="w-3 h-3 rounded-full bg-warning/80"></div>
                        <div class="w-3 h-3 rounded-full bg-success/80"></div>
                    </div>
                    <div class="flex-1 text-center text-xs text-base-content/50 font-mono">
                        "xodium.sh"
                    </div>
                    <div class="w-14"></div>
                </div>

                // Terminal content
                <div class="p-4 sm:p-6 font-mono text-xs sm:text-sm" style="min-height: 280px;">
                    // ASCII Art
                    {move || {
                        if show_ascii.get() {
                            view! {
                                <div class="w-full overflow-x-auto">
                                    <pre class="text-primary/90 leading-none mb-4 text-[0.5rem] sm:text-xs whitespace-pre origin-left scale-[0.75] sm:scale-100 inline-block">
                                        {ASCII_ART}
                                    </pre>
                                </div>
                            }.into_any()
                        } else {
                            ().into_any()
                        }
                    }}

                    {move || {
                        let current = current_line.get();
                        let cursor = cursor_visible.get();
                        let all_lines = lines.get();
                        let menu_visible = show_buttons.get();

                        view! {
                            <>
                                {all_lines.iter().enumerate().map(|(i, line)| {
                                    let is_current = i == current;
                                    // Only show cursor on current line if menu is NOT visible
                                    let show_cursor = is_current && cursor && !menu_visible;

                                    view! {
                                        <div class="text-primary/80 leading-relaxed">
                                            <span class="text-secondary/60 mr-2">"$xodium > "</span>
                                            {line.clone()}
                                            {show_cursor.then(|| view! {
                                                <span class="inline-block w-2 h-4 bg-primary/60 ml-0.5 align-middle"></span>
                                            })}
                                        </div>
                                    }
                                }).collect::<Vec<_>>()}

                                // Current empty line being typed
                                {if all_lines.len() < COMPANY_VALUES.len() && all_lines.len() == current {
                                    view! {
                                        <div class="text-primary/80 leading-relaxed">
                                            <span class="text-secondary/60 mr-2">"$xodium > "</span>
                                            {cursor.then(|| view! {
                                                <span class="inline-block w-2 h-4 bg-primary/60 ml-0.5 align-middle"></span>
                                            })}
                                        </div>
                                    }.into_any()
                                } else {
                                    ().into_any()
                                }}
                            </>
                        }
                    }}
                </div>

                // CTA Buttons area
                <div
                    class={move || {
                        if show_buttons.get() {
                            "px-4 sm:px-6 pb-6 transition-all duration-500 opacity-100 translate-y-0"
                        } else {
                            "px-4 sm:px-6 pb-6 transition-all duration-500 opacity-0 translate-y-4"
                        }
                    }}
                >
                    <div class="border-t border-base-content/10 pt-4">
                        <div class="flex flex-col sm:flex-row gap-3 justify-center">
                            <a
                                href="https://github.com/XodiumSoftware"
                                class="btn btn-primary hover:btn-warning btn-lift"
                            >
                                "Get Started"
                            </a>
                            <a
                                href="mailto:info@xodium.org"
                                class="btn btn-outline btn-outline-ghost btn-hover-warning btn-lift"
                            >
                                "Join us"
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}
