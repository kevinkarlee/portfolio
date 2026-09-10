/* ==========================================================================
   theme.js - light / dark mode
   --------------------------------------------------------------------------
   Loaded SYNCHRONOUSLY in <head> (no `defer`) so the stored preference is
   applied before the first paint. Without this, a dark-mode visitor would see
   a white flash on every page load.

   Order of precedence:
     1. an explicit choice previously saved in localStorage
     2. the operating system preference (prefers-color-scheme)
     3. light

   The chosen theme is written to <html data-theme="...">, which is what
   assets/css/style.css keys its dark palette on.
   ========================================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "kz-theme";
  var root = document.documentElement;

  /** Read the saved preference; localStorage can throw in private mode. */
  function storedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function systemPrefersDark() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }

  /**
   * Apply a theme.
   * @param {"light"|"dark"} theme
   * @param {boolean} persist - save the choice (only for explicit user action)
   */
  function applyTheme(theme, persist) {
    root.setAttribute("data-theme", theme);

    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (e) {
        /* storage unavailable - the theme still applies for this page */
      }
    }

    // Keep the mobile browser chrome in sync with the page background.
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0d1626" : "#ffffff");

    // Let other scripts react - assets/js/charts.js re-colours the graphs.
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: theme } }));
  }

  // --- 1. Apply immediately, before the body is painted --------------------
  var initial = storedTheme() || (systemPrefersDark() ? "dark" : "light");
  root.setAttribute("data-theme", initial);

  // --- 2. Follow the OS if the visitor never made an explicit choice -------
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onSystemChange = function (event) {
      if (!storedTheme()) applyTheme(event.matches ? "dark" : "light", false);
    };
    // addEventListener is not supported on MediaQueryList in older Safari.
    if (mq.addEventListener) mq.addEventListener("change", onSystemChange);
    else if (mq.addListener) mq.addListener(onSystemChange);
  }

  // --- 3. Wire the toggle button once the DOM exists ----------------------
  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector("[data-theme-toggle]");
    if (!toggle) return;

    var syncLabel = function () {
      var isDark = root.getAttribute("data-theme") === "dark";
      toggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
      );
      toggle.setAttribute("aria-pressed", String(isDark));
    };

    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next, true);
      syncLabel();
    });

    syncLabel();
  });
})();
