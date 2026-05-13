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
    if (value == null) return value;
    if (typeof structuredClone === "function") {
      try { return structuredClone(value); }
      catch (error) { /* Fall back to JSON for plain app data. */ }
    }
    return JSON.parse(JSON.stringify(value));
  }

  function deferPersistenceWork() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  class RemoteOnlyAdapter {
    constructor(remoteProvider) {
      this.remoteProvider = typeof remoteProvider === "function" ? remoteProvider : () => null;
      this.lastSnapshot = null;
      this.pendingSavePayload = null;
      this.saveInFlight = null;
      this.pendingVisibilityRows = new Map();
      this.visibilitySaveInFlight = null;
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


    queueVisibilityRows(rows) {
      (Array.isArray(rows) ? rows : []).forEach((row) => {
        const d = Math.max(0, Math.floor(Number(row?.d) || 0));
        const m = Math.max(0, Math.floor(Number(row?.m) || 0));
        if (!d || ![0, 1].includes(m)) return;
        this.pendingVisibilityRows.set(`${d}:${m}`, {
          d,
          m,
          z: row?.z !== false,
          n: Math.max(0, Math.floor(Number(row?.n) || 0)),
          x: String(row?.x || ""),
          _delete: row?._delete === true
        });
      });
    }

    mergeVisibilityRowsIntoLastSnapshot(rows) {
      if (!this.lastSnapshot || !rows?.length) return;
      const raw = this.lastSnapshot.builtinVisibility || { version: 46, rows: [] };
      const map = new Map();
      (Array.isArray(raw.rows) ? raw.rows : []).forEach((row) => {
        const d = Math.max(0, Math.floor(Number(row?.d) || 0));
        const m = Math.max(0, Math.floor(Number(row?.m) || 0));
        if (d && [0, 1].includes(m)) map.set(`${d}:${m}`, { d, m, z: row?.z !== false, n: Number(row?.n) || 0, x: String(row?.x || "") });
      });
      rows.forEach((row) => {
        const key = `${Number(row.d)}:${Number(row.m)}`;
        if (row._delete) map.delete(key);
        else map.set(key, { d: row.d, m: row.m, z: row.z !== false, n: row.n, x: String(row.x || "") });
      });
      this.lastSnapshot.builtinVisibility = { version: 46, rows: Array.from(map.values()).sort((a, b) => a.d - b.d || a.m - b.m) };
    }

    async saveVisibilityRows(rows) {
      this.queueVisibilityRows(rows);
      if (!this.pendingVisibilityRows.size) return;
      if (this.visibilitySaveInFlight) return this.visibilitySaveInFlight;

      this.visibilitySaveInFlight = (async () => {
        try {
          await deferPersistenceWork();
          while (this.pendingVisibilityRows.size) {
            const nextRows = Array.from(this.pendingVisibilityRows.values());
            this.pendingVisibilityRows.clear();
            const remote = this.getRemote();
            if (remote && typeof remote.saveVisibilityRows === "function") {
              try {
                await remote.saveVisibilityRows(nextRows);
                this.mergeVisibilityRowsIntoLastSnapshot(nextRows);
              } catch (error) {
                console.warn("Visibility save failed. This setup change is not cached for later replay.", error);
              }
            }
            if (this.pendingVisibilityRows.size) await deferPersistenceWork();
          }
        } finally {
          this.visibilitySaveInFlight = null;
        }
      })();

      return this.visibilitySaveInFlight;
    }

    async saveAppData(payload) {
      // Keep the UI responsive: capture the latest state reference now, but do
      // the expensive full-state clone/write after the current keypress/render.
      // Rapid Enter presses collapse into the newest pending payload instead of
      // serializing the entire DB for every intermediate runtime-only step.
      this.pendingSavePayload = payload;
      if (this.saveInFlight) return this.saveInFlight;

      this.saveInFlight = (async () => {
        try {
          await deferPersistenceWork();
          while (this.pendingSavePayload) {
            const nextPayload = deepClone(this.pendingSavePayload);
            this.pendingSavePayload = null;
            await this.saveSinglePayload(nextPayload);
            if (this.pendingSavePayload) await deferPersistenceWork();
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
