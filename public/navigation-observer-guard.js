/* Prevent navigation-enhancer's DOM observer from observing its own DOM writes forever. */
(() => {
  const NativeMutationObserver = window.MutationObserver;
  if (!NativeMutationObserver || window.__kfccMutationObserverGuard) return;
  window.__kfccMutationObserverGuard = true;

  window.MutationObserver = class KFCCMutationObserverGuard {
    constructor(callback) {
      const isNavigationEnhancer = typeof callback === 'function' && /buildDetailDesktopHeader|groupedNavigation|hydrateTermsBrand/.test(Function.prototype.toString.call(callback));
      if (!isNavigationEnhancer) {
        this._observer = new NativeMutationObserver(callback);
        return;
      }

      let running = false;
      this._observer = new NativeMutationObserver((records, observer) => {
        if (running) return;
        running = true;
        try {
          callback(records, observer);
        } finally {
          /* Discard mutations created by the enhancer itself so it cannot loop. */
          observer.takeRecords();
          running = false;
        }
      });
    }

    observe(...args) { return this._observer.observe(...args); }
    disconnect(...args) { return this._observer.disconnect(...args); }
    takeRecords(...args) { return this._observer.takeRecords(...args); }
  };
})();
