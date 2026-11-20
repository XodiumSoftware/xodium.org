use leptos::prelude::*;

/// ASCII glyph block spelling "XODIUM" for the drawing header.
pub const XODIUM_ASCII_ART: &str = r"
         ,-.--,  _,.---._                 .=-.-.                   ___
.--.-.  /=/, .',-.' , -  `.   _,..---._  /==/_ /.--.-. .-.-..-._ .='.'\
\==\ -\/=/- / /==/_,  ,  - \/==/,   -  \|==|, |/==/ -|/=/  /==/ \|==|  |
 \==\ `-' ,/ |==|   .=.     |==|   _   _\==|  ||==| ,||=| -|==|,|  / - |
  |==|,  - | |==|_ : ;=:  - |==|  .=.   |==|- ||==|- | =/  |==|  \/  , |
 /==/   ,   \|==| , '='     |==|,|   | -|==| ,||==|,  \/ - |==|- ,   _ |
/==/, .--, - \\==\ -    ,_ /|==|  '='   /==|- ||==|-   ,   /==| _ /\   |
\==\- \/=/ , / '.='. -   .' |==|-,   _`//==/. //==/ , _  .'/==/  / / , /
 `--`-'  `--`    `--`--''   `-.`.____.' `--`-` `--`..---'  `--`./  `--`
";

/// The XODIUM lettering as an ASCII block.
#[component]
#[must_use]
pub fn AsciiArt() -> impl IntoView {
    view! {
        <pre
            class="ascii-art self-stretch text-center leading-[1.15] tracking-normal text-base-content whitespace-pre select-none pointer-events-none animate-[fade-in_400ms_ease-out_400ms_both] motion-reduce:animate-none"
            aria-label="XODIUM"
        >
            {XODIUM_ASCII_ART}
        </pre>
    }
}
