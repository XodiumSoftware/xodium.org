//! Moves each spotlight to the pointer's position within its surface.
(function () {
    "use strict";

    var frame = 0;
    var event = null;

    function paint() {
        frame = 0;
        if (!event) return;
        var surface = event.target.closest(".spotlight-surface");
        if (!surface) return;
        var glow = surface.querySelector(".spotlight");
        if (!glow) return;
        var box = surface.getBoundingClientRect();
        glow.style.setProperty("--spotlight-x", event.clientX - box.left + "px");
        glow.style.setProperty("--spotlight-y", event.clientY - box.top + "px");
    }

    function track(pointer) {
        if (!(pointer.target instanceof Element)) return;
        event = pointer;
        if (!frame) frame = requestAnimationFrame(paint);
    }

    document.addEventListener("pointermove", track, { passive: true });
    document.addEventListener("pointerdown", track, { passive: true });
})();
