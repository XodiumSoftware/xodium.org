use leptos::prelude::*;

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
#[component]
#[must_use]
pub fn AsciiArt() -> impl IntoView {
    view! {
        <pre class="ascii-art" aria-label="XODIUM">{XODIUM_ASCII_ART}</pre>
    }
}
