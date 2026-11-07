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

/// The XODIUM lettering rendered as an ASCII glyph block, styled as the sheet
///'s title mark — the "logo" you would see on an engineering drawing where
/// the drawing header sits above the title block.
///
/// The block is 72 monospace columns wide, so its size is capped against the
/// band's inline width rather than fixed: `.ascii-art` in `public/style.css`
/// takes the whole mark down to fit a phone screen. Everything else about the
/// block is a utility.
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
