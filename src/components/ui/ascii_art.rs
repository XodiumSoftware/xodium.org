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

/// The XODIUM lettering as an ASCII block, drawn as the sheet's title mark.
///
/// The block is 72 monospace columns wide, so its size is fitted to the band's
/// inline width by `.ascii-art` in `public/style.css`: `min(0.585rem, 100cqi /
/// 43.2)`. That rule cannot be a utility, because the divisor is the element's
/// own `em`.
///
/// Two constants must agree with the art above: the `43.2` divisor (columns ×
/// 0.6em glyph advance) and the `0.585rem` cap, which is also the value the
/// header's wrapper width is computed from. Changing the art's width without
/// changing the divisor clips its last columns. The `cqi` resolves against the
/// header's `inline-size` container; without that ancestor the mark overflows.
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
