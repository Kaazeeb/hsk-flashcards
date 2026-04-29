/**
 * Main facade. Implementation is split by responsibility in js/main-*.js.
 */
(function (ns) {
  ns.main = {
    bootstrap(...args) {
      const runtime = ns.mainRuntime || {};
      if (typeof runtime.bootstrap !== "function") throw new Error("Main runtime bootstrap is not loaded.");
      return runtime.bootstrap(...args);
    }
  };
})(window.HSKFlashcards);
