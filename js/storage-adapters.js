/*
Remote-first persistence adapter for app data.

There is no app/business-data localStorage cache. If Supabase is unavailable or
a write fails, the in-memory state may continue for the current page session,
but the failed events/doc changes are not queued for later replay. Supabase Auth
may still persist its own login session so users can remain signed in across
page reloads.
*/
(function (ns) {
  function deepClone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  class RemoteOnlyAdapter {
    constructor(remoteProvider) {
      this.remoteProvider = typeof remoteProvider === "function" ? remoteProvider : () => null;
      this.lastSnapshot = null;
      this.pendingSavePayload = null;
      this.saveInFlight = null;
    }

    getRemote() {
      return this.remoteProvider() || null;
    }

    get kind() {
      return this.getRemote() ? "remote" : "memory";
    }

    async loadLocalOnly() {
      return null;
    }

    async loadAppData() {
      const remote = this.getRemote();
      if (!remote || typeof remote.loadAppData !== "function") {
        this.lastSnapshot = null;
        return null;
      }
      try {
        const remoteData = await remote.loadAppData();
        this.lastSnapshot = deepClone(remoteData || null);
        return remoteData || null;
      } catch (error) {
        console.warn("Remote adapter load failed. Starting from built-in state for this page session only.", error);
        this.lastSnapshot = null;
        return null;
      }
    }

    async saveSinglePayload(payload) {
      const remote = this.getRemote();
      const previousSnapshot = deepClone(this.lastSnapshot);
      if (remote && typeof remote.saveAppData === "function") {
        try {
          await remote.saveAppData(payload, previousSnapshot || {});
        } catch (error) {
          console.warn("Remote adapter save failed. This change is not cached for later replay.", error);
        }
      }
      // Whether the remote write succeeded or failed, advance the local diff
      // baseline. This intentionally drops failed events instead of queuing them.
      this.lastSnapshot = deepClone(payload);
    }

    async saveAppData(payload) {
      this.pendingSavePayload = deepClone(payload);
      if (this.saveInFlight) return this.saveInFlight;

      this.saveInFlight = (async () => {
        try {
          while (this.pendingSavePayload) {
            const nextPayload = this.pendingSavePayload;
            this.pendingSavePayload = null;
            await this.saveSinglePayload(nextPayload);
          }
        } finally {
          this.saveInFlight = null;
        }
      })();

      return this.saveInFlight;
    }
  }

  function createPersistenceAdapter() {
    return new RemoteOnlyAdapter(
      () => (ns.auth && typeof ns.auth.getRemoteAdapter === "function" ? ns.auth.getRemoteAdapter() : null)
    );
  }

  ns.adapters = { createPersistenceAdapter, RemoteOnlyAdapter };
})(window.HSKFlashcards);
