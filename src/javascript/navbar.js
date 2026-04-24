(function () {
    function updateIndicator(container, indicator, el, animate) {
        if (!indicator || !el) return;
        if (!animate) indicator.style.transition = "none";
        indicator.style.width = el.offsetWidth + "px";
        indicator.style.height = el.offsetHeight + "px";
        indicator.style.transform =
            "translate(" + el.offsetLeft + "px," + el.offsetTop + "px)";
        indicator.style.opacity = "1";
        if (!animate) {
            requestAnimationFrame(() => {
                requestAnimationFrame(
                    () => (indicator.style.transition = ""),
                );
            });
        }
    }

    function initNav() {
        const container = document.querySelector("[data-nav-container]");
        if (!container) return;
        const indicator = container.querySelector("#nav-indicator");
        const active = container.querySelector(
            '[data-nav-link][data-active="true"]',
        );
        const first = !window.__navInit;

        if (active) updateIndicator(container, indicator, active, !first);
        else if (indicator) indicator.style.opacity = "0";

        window.__navInit = true;

        container.querySelectorAll("[data-nav-link]").forEach((link) => {
            link.addEventListener("mouseenter", () =>
                updateIndicator(container, indicator, link, true),
            );
            link.addEventListener("focus", () =>
                updateIndicator(container, indicator, link, true),
            );
        });
        container.addEventListener("mouseleave", () => {
            const current = container.querySelector(
                '[data-nav-link][data-active="true"]',
            );
            if (current)
                updateIndicator(container, indicator, current, true);
            else if (indicator) indicator.style.opacity = "0";
        });
    }

    function initTheme() {
        const btn = document.querySelector("[data-theme-toggle]");
        if (!btn) return;
        const icon = btn.querySelector("[data-theme-icon]");
        const sun = icon && icon.querySelector("[data-sun]");
        const moon = icon && icon.querySelector("[data-moon]");
        const dot = btn.querySelector("[data-theme-dot]");

        function render(theme) {
            document.documentElement.setAttribute("data-theme", theme);
            if (sun && moon) {
                sun.classList.toggle("hidden", theme === "dark");
                moon.classList.toggle("hidden", theme !== "dark");
            }
            if (icon) icon.setAttribute("data-theme", theme);
            if (dot)
                dot.setAttribute(
                    "data-visible",
                    localStorage.getItem("theme") ? "true" : "false",
                );
        }

        render(
            document.documentElement.getAttribute("data-theme") || "light",
        );

        if (!btn.__bound) {
            btn.__bound = true;
            btn.addEventListener("click", () => {
                const next =
                    document.documentElement.getAttribute("data-theme") ===
                    "dark"
                        ? "light"
                        : "dark";
                localStorage.setItem("theme", next);
                render(next);
                // Nudge the indicator in case colors affected layout metrics
                const container = document.querySelector(
                    "[data-nav-container]",
                );
                const indicator =
                    container && container.querySelector("#nav-indicator");
                const active =
                    container &&
                    container.querySelector(
                        '[data-nav-link][data-active="true"]',
                    );
                if (container && indicator && active)
                    updateIndicator(container, indicator, active, true);
            });
        }
    }

    function initScrollToggle() {
        const btn = document.querySelector("[data-theme-toggle]");
        if (!btn) return;

    let fixedTop = null;
    let isFixed = false;

    function toggleFixed() {
        if (window.scrollY > 0) {
            if (!isFixed) {
                fixedTop = btn.getBoundingClientRect().top;
                isFixed = true;
            }
            btn.style.position = 'fixed';
            btn.style.top = fixedTop + 'px';
            btn.style.right = 'var(--theme-toggle-right)';
            btn.style.transform = 'translateY(54%)';
        } else {
            isFixed = false;
                btn.style.position = 'absolute';
                btn.style.top = '50%';
                btn.style.right = 'var(--theme-toggle-right)';
                btn.style.transform = 'translateY(0%)';
            }
        }

        window.addEventListener("scroll", toggleFixed);
        toggleFixed();
    }

    function boot() {
        initNav();
        initTheme();
        initScrollToggle();
    }

    document.addEventListener("astro:page-load", boot);
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }

    let resizeRaf;
    window.addEventListener("resize", () => {
        cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(() => {
            const container = document.querySelector(
                "[data-nav-container]",
            );
            const indicator =
                container && container.querySelector("#nav-indicator");
            const active =
                container &&
                container.querySelector(
                    '[data-nav-link][data-active="true"]',
                );
            if (container && indicator && active)
                updateIndicator(container, indicator, active, false);
        });
    });
})();