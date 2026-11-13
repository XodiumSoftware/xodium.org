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
///
/// That rule cannot be a utility, because the fitted size has to divide by the
/// element's own `em`: the block spans `43.2em` (72 columns × 0.6em of monospace
/// advance), so the size is `min(0.585rem, 100cqi / 43.2)`. Two consequences:
///
/// - The `0.585rem` cap is the mark's original size and the value the header's
///   `max-w-[calc(43.2*0.585rem)]` must agree with; changing one without the
///   other either shrinks the mark or lets the wrapper outgrow it.
///
/// - The `43.2` divisor is the column count times the glyph advance. If the art
///   above changes width, this divisor must change with it, or the mark clips
///   its last columns on narrow screens.
///
/// `cqi` resolves against the nearest size container, which is the wrapper in
/// `header.rs` (`[container-type:inline-size]`). Without that ancestor the
/// measure is meaningless and the mark overflows the sheet rule.
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
