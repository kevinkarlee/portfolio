/* ==========================================================================
   charts.js - thin wrapper around Plotly.js
   --------------------------------------------------------------------------
   Why this file exists
     - every project page gets the same chart styling for free;
     - charts follow the light/dark toggle (Plotly cannot read CSS variables
       on its own, so we resolve them in JS and re-draw on `themechange`);
     - if the CDN is blocked or the visitor is offline, the chart slot
       degrades to a readable message instead of an empty box.

   Public API
     QuantChart.render(containerId, traces, layout, config)
     QuantChart.palette          -> series colours, theme-aware
     QuantChart.synth.*          -> deterministic placeholder data helpers

   IMPORTANT: every dataset drawn on this site today is SYNTHETIC placeholder
   data. Swap in real exports before publishing results.
   ========================================================================== */
window.QuantChart = (function () {
  "use strict";

  /* --- Series colours ------------------------------------------------------
     Two ramps, tuned for contrast against the light and dark surfaces. Order
     matters: the first colour is the "primary" series on each chart. */
  var PALETTES = {
    light: ["#1d4e89", "#c07d1f", "#1f6f52", "#8c3b5e", "#5a6b85", "#2f8fa8"],
    dark:  ["#6f9fd8", "#dcae63", "#6cc3a1", "#d98cae", "#9aa8bf", "#63c2d8"]
  };

  /** Current theme, read from <html data-theme>. */
  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light";
  }

  /** Resolve a CSS custom property to its computed value. */
  function cssVar(name, fallback) {
    var value = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    return value || fallback;
  }

  /* --- Base layout ---------------------------------------------------------
     Deliberately sparse: no chart junk, thin grid, mono tick labels. */
  function baseLayout() {
    var text = cssVar("--c-chart-text", "#3a465c");
    var grid = cssVar("--c-chart-grid", "#e6ebf2");
    var surface = cssVar("--c-chart-bg", "#ffffff");

    var axis = {
      gridcolor: grid,
      zerolinecolor: grid,
      linecolor: grid,
      tickfont: { family: "Consolas, monospace", size: 11, color: text },
      titlefont: { size: 12, color: text },
      automargin: true
    };

    return {
      paper_bgcolor: surface,
      plot_bgcolor: surface,
      font: {
        family: '"Segoe UI", -apple-system, Roboto, Helvetica, Arial, sans-serif',
        size: 12,
        color: text
      },
      colorway: PALETTES[currentTheme()],
      margin: { l: 58, r: 24, t: 28, b: 48 },
      hovermode: "closest",
      hoverlabel: { font: { family: "Consolas, monospace", size: 11 } },
      legend: {
        orientation: "h",
        yanchor: "bottom",
        y: 1.02,
        x: 0,
        font: { size: 11 },
        bgcolor: "rgba(0,0,0,0)"
      },
      xaxis: axis,
      yaxis: JSON.parse(JSON.stringify(axis))
    };
  }

  /** Shallow merge, one level deep - enough for Plotly layout overrides. */
  function merge(base, extra) {
    if (!extra) return base;
    Object.keys(extra).forEach(function (key) {
      var value = extra[key];
      if (
        value && typeof value === "object" && !Array.isArray(value) &&
        base[key] && typeof base[key] === "object" && !Array.isArray(base[key])
      ) {
        base[key] = merge(base[key], value);
      } else {
        base[key] = value;
      }
    });
    return base;
  }

  /* --- Registry of drawn charts, so the theme toggle can redraw them ------- */
  var registry = [];

  /** Traces may be a plain array, or a function re-evaluated on each redraw.
      Use the function form when a trace carries its own colours (a heatmap
      colorscale, say) that must follow the light/dark toggle. */
  function resolveTraces(traces) {
    return typeof traces === "function" ? traces() : traces;
  }

  /**
   * Draw a chart into `#containerId`.
   * @param {string}        containerId - id of the .chart__canvas div
   * @param {Array|Function} traces     - Plotly traces, or a factory returning them
   * @param {Object}        [layout]    - layout overrides merged onto the base layout
   * @param {Object}        [config]    - Plotly config overrides
   */
  function render(containerId, traces, layout, config) {
    var node = document.getElementById(containerId);
    if (!node) return;

    // No Plotly (offline / blocked CDN) -> show the graceful fallback.
    if (typeof window.Plotly === "undefined") {
      var wrapper = node.closest(".chart");
      if (wrapper) wrapper.classList.add("is-unavailable");
      return;
    }

    var plotConfig = merge(
      {
        displayModeBar: false,   // keep the page calm; hover still works
        responsive: true,
        displaylogo: false,
        scrollZoom: false
      },
      config
    );

    window.Plotly.newPlot(
      node,
      resolveTraces(traces),
      merge(baseLayout(), layout),
      plotConfig
    );

    registry.push({ id: containerId, traces: traces, layout: layout, config: plotConfig });
  }

  /** Redraw every registered chart with the new theme's colours. */
  function retheme() {
    if (typeof window.Plotly === "undefined") return;
    registry.forEach(function (chart) {
      var node = document.getElementById(chart.id);
      if (!node) return;
      window.Plotly.react(
        node,
        resolveTraces(chart.traces),
        merge(baseLayout(), chart.layout),
        chart.config
      );
    });
  }

  window.addEventListener("themechange", retheme);

  /* ==========================================================================
     Deterministic placeholder data
     A seeded generator keeps the charts identical on every reload, so the page
     looks stable to a recruiter refreshing it. Replace with real data later.
     ========================================================================== */

  /** mulberry32 - compact seeded PRNG returning values in [0, 1). */
  function seeded(seed) {
    var state = seed >>> 0;
    return function () {
      state = (state + 0x6d2b79f5) >>> 0;
      var t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Box-Muller transform: standard normal draws from a uniform generator. */
  function normal(rand) {
    var u = 1 - rand();
    var v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  var synth = {
    /** ISO date strings, one per calendar day, starting at `startISO`. */
    dates: function (startISO, count, stepDays) {
      var step = stepDays || 1;
      var out = [];
      var day = new Date(startISO + "T00:00:00Z");
      for (var i = 0; i < count; i++) {
        out.push(day.toISOString().slice(0, 10));
        day.setUTCDate(day.getUTCDate() + step);
      }
      return out;
    },

    /**
     * Geometric Brownian motion path.
     * @param {Object} o - {n, s0, mu, sigma, dt, seed} (annualised mu/sigma)
     */
    gbm: function (o) {
      var n = o.n, dt = o.dt || 1 / 252;
      var mu = o.mu || 0.05, sigma = o.sigma || 0.15;
      var rand = seeded(o.seed || 42);
      var path = [o.s0 || 100];
      for (var i = 1; i < n; i++) {
        var shock = (mu - 0.5 * sigma * sigma) * dt +
                    sigma * Math.sqrt(dt) * normal(rand);
        path.push(path[i - 1] * Math.exp(shock));
      }
      return path.map(function (v) { return Math.round(v * 100) / 100; });
    },

    /** Running maximum drawdown of a price path, in percent (<= 0). */
    drawdown: function (path) {
      var peak = -Infinity;
      return path.map(function (v) {
        peak = Math.max(peak, v);
        return Math.round(((v / peak - 1) * 100) * 100) / 100;
      });
    },

    /** Nelson-Siegel yield curve - used for the sovereign curve placeholders. */
    nelsonSiegel: function (maturities, b0, b1, b2, tau) {
      return maturities.map(function (m) {
        var x = m / tau;
        var decay = (1 - Math.exp(-x)) / x;
        var y = b0 + b1 * decay + b2 * (decay - Math.exp(-x));
        return Math.round(y * 100) / 100;
      });
    }
  };

  return { render: render, palette: PALETTES, synth: synth, cssVar: cssVar };
})();
