/* ==========================================================================
   main.js - small site-wide behaviours
   --------------------------------------------------------------------------
   Loaded with `defer` at the end of <head>. Everything here is progressive
   enhancement: the site remains fully readable and navigable with JavaScript
   disabled.

   Contents
     1. Mobile navigation toggle
     2. Auto-updating copyright year
     3. Active section highlighting in the header (home page only)
     4. Scroll reveal
     5. Lightbox for photos and certificates
   ========================================================================== */
(function () {
  "use strict";

  // Signals to the stylesheet that JS is running, so [data-reveal] elements
  // may start hidden. Without this they must stay visible.
  document.documentElement.classList.remove("no-js");

  document.addEventListener("DOMContentLoaded", function () {
    /* ----------------------------------------------------------------------
       1. Mobile navigation
       The list is hidden with the `hidden` attribute so that it is closed by
       default on small screens and always visible on desktop (CSS overrides).
       ---------------------------------------------------------------------- */
    var navToggle = document.querySelector("[data-nav-toggle]");
    var navList = document.getElementById("primary-nav");
    var MOBILE_QUERY = "(max-width: 780px)";

    function isMobile() {
      return window.matchMedia && window.matchMedia(MOBILE_QUERY).matches;
    }

    function closeNav() {
      if (!navList || !navToggle) return;
      navList.hidden = true;
      navToggle.setAttribute("aria-expanded", "false");
    }

    function openNav() {
      if (!navList || !navToggle) return;
      navList.hidden = false;
      navToggle.setAttribute("aria-expanded", "true");
    }

    /** On desktop the menu must always be visible, whatever its last state. */
    function syncNavToViewport() {
      if (!navList) return;
      if (isMobile()) closeNav();
      else navList.hidden = false;
    }

    if (navToggle && navList) {
      syncNavToViewport();

      navToggle.addEventListener("click", function () {
        if (navList.hidden) openNav();
        else closeNav();
      });

      // Close after following an in-page link on mobile.
      navList.addEventListener("click", function (event) {
        if (event.target.closest("a") && isMobile()) closeNav();
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && isMobile() && !navList.hidden) {
          closeNav();
          navToggle.focus();
        }
      });

      // Debounced, so dragging a desktop window does not thrash the DOM.
      var resizeTimer;
      window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(syncNavToViewport, 150);
      });
    }

    /* ----------------------------------------------------------------------
       2. Copyright year - avoids a stale footer next January
       ---------------------------------------------------------------------- */
    var yearSlots = document.querySelectorAll("[data-current-year]");
    var year = String(new Date().getFullYear());
    for (var i = 0; i < yearSlots.length; i++) {
      yearSlots[i].textContent = year;
    }

    /* ----------------------------------------------------------------------
       3. Active section highlighting (home page)
       Marks the nav link whose section is currently in view.
       ---------------------------------------------------------------------- */
    var sections = document.querySelectorAll("main section[id]");
    if (sections.length && "IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var link = document.querySelector(
              '.nav__link[href="#' + entry.target.id + '"]'
            );
            document.querySelectorAll(".nav__link[aria-current]").forEach(function (el) {
              el.removeAttribute("aria-current");
            });
            if (link) link.setAttribute("aria-current", "true");
          });
        },
        // Trigger around the middle of the viewport rather than at its edge.
        { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
      );

      for (var j = 0; j < sections.length; j++) observer.observe(sections[j]);
    }

    /* ----------------------------------------------------------------------
       4. Scroll reveal
       Elements fade up once, the first time they enter the viewport.
       ---------------------------------------------------------------------- */
    var revealTargets = document.querySelectorAll("[data-reveal]");
    var prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (revealTargets.length) {
      if (prefersReducedMotion) {
        revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
      } else {
        // A plain scroll handler rather than an IntersectionObserver: these
        // elements start at opacity 0, so the cost of the trigger never firing
        // is invisible content. A direct geometry check cannot silently fail
        // to be delivered, and with a shrinking list it stays cheap - browsers
        // already coalesce scroll events to one per frame.
        var pending = Array.prototype.slice.call(revealTargets);

        function stopWatching() {
          window.removeEventListener("scroll", revealInView);
          window.removeEventListener("resize", revealInView);
        }

        function revealAllPending() {
          pending.forEach(function (el) { el.classList.add("is-visible"); });
          pending = [];
          stopWatching();
        }

        function revealInView() {
          var limit = window.innerHeight * 0.92; // reveal just before the edge
          pending = pending.filter(function (el) {
            if (el.getBoundingClientRect().top > limit) return true;
            el.classList.add("is-visible");
            return false;
          });
          if (!pending.length) stopWatching();
        }

        // Reveal what is already on screen before the first paint, so the top
        // of the page never flashes empty.
        revealInView();

        window.addEventListener("scroll", revealInView, { passive: true });
        window.addEventListener("resize", revealInView);
        // Images settling can shift the layout upwards - re-check once.
        window.addEventListener("load", revealInView);

        // Backstop. These elements start at opacity 0, so a trigger that never
        // fires would mean invisible content - an unacceptable failure for a
        // decorative effect. After a few seconds, show whatever is left
        // regardless: anything still pending is off-screen, so revealing it
        // early costs nothing visually and removes the risk entirely.
        setTimeout(revealAllPending, 4000);
      }
    }

    /* ----------------------------------------------------------------------
       5. Lightbox
       Any element carrying [data-lightbox] opens its image full size. The
       value of the attribute, when present, is used as the caption.
       ---------------------------------------------------------------------- */
    var triggers = document.querySelectorAll("[data-lightbox]");
    if (triggers.length) {
      // Built in JS rather than sitting in every page's markup.
      var box = document.createElement("div");
      box.className = "lightbox";
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-modal", "true");
      box.setAttribute("aria-label", "Image viewer");
      box.innerHTML =
        '<button class="lightbox__close" type="button" aria-label="Close image">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
        '<path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
        '<figure style="margin:0;display:grid;place-items:center">' +
        '<img class="lightbox__img" alt="">' +
        '<figcaption class="lightbox__caption"></figcaption></figure>';
      document.body.appendChild(box);

      var boxImg = box.querySelector(".lightbox__img");
      var boxCaption = box.querySelector(".lightbox__caption");
      var lastFocused = null;

      function openLightbox(trigger) {
        var img = trigger.tagName === "IMG" ? trigger : trigger.querySelector("img");
        if (!img) return;

        lastFocused = document.activeElement;
        // Prefer a full-size source if one is declared, else the visible src.
        boxImg.src = trigger.getAttribute("data-lightbox-src") || img.currentSrc || img.src;
        boxImg.alt = img.alt || "";
        boxCaption.textContent = trigger.getAttribute("data-lightbox") || img.alt || "";
        box.classList.add("is-open");
        document.body.style.overflow = "hidden";
        box.querySelector(".lightbox__close").focus();
      }

      function closeLightbox() {
        box.classList.remove("is-open");
        document.body.style.overflow = "";
        boxImg.removeAttribute("src");
        if (lastFocused && lastFocused.focus) lastFocused.focus();
      }

      triggers.forEach(function (trigger) {
        trigger.addEventListener("click", function () { openLightbox(trigger); });
        // Keyboard equivalent for non-button triggers
        trigger.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openLightbox(trigger);
          }
        });
      });

      // Click the backdrop or the close button; Escape also closes.
      box.addEventListener("click", function (event) {
        if (event.target === box || event.target.closest(".lightbox__close")) {
          closeLightbox();
        }
      });
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && box.classList.contains("is-open")) closeLightbox();
      });
    }
  });
})();
