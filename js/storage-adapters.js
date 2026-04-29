/*
Persistence adapter layer.

The UI works with one normalized state object. This module decides whether that
state is loaded/saved from localStorage only or from Supabase plus a local cache.
Remote writes are serialized so quick UI actions cannot race each other.
*/
(function (ns) {
  function deepClone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function getReviewEpochTime(payload) {
    const value = payload?.meta?.reviewEpochAt;
    const time = value ? new Date(value).getTime() : 0;
    return Number.isFinite(time) ? time : 0;
  }

  function remoteEpochIsNewer(localData, remoteData) {
    const localTime = getReviewEpochTime(localData);
    const remoteTime = getReviewEpochTime(remoteData);
    return remoteTime > localTime;
  }

  class LocalJsonAdapter {
    constructor(baseKey, scopeProvider) {
      this.baseKey = baseKey;
      this.scopeProvider = typeof scopeProvider === "function" ? scopeProvider : () => "anon";
      this.kind = "local";
    }

    getScope(scopeOverride) {
      return String(scopeOverride || this.scopeProvider() || "anon");
    }

    getKey(scopeOverride) {
      return `${this.baseKey}::${this.getScope(scopeOverride)}`;
    }

    getMetaKey(scopeOverride) {
      return `${this.getKey(scopeOverride)}::sync_meta`;
    }

    async loadMeta(scopeOverride) {
      try {
        return JSON.parse(localStorage.getItem(this.getMetaKey(scopeOverride)) || "{}");
      } catch (error) {
        return {};
      }
    }

    async saveMeta(scopeOverride, meta) {
      localStorage.setItem(this.getMetaKey(scopeOverride), JSON.stringify(meta || {}));
    }

    async loadByScope(scopeOverride) {
      try {
        const raw = localStorage.getItem(this.getKey(scopeOverride));
        return raw ? JSON.parse(raw) : null;
      } catch (error) {
        return null;
      }
    }

    async saveByScope(scopeOverride, payload) {
      localStorage.setItem(this.getKey(scopeOverride), JSON.stringify(payload));
    }

    async loadAppData() {
      return this.loadByScope();
    }

    async saveAppData(payload) {
      return this.saveByScope(undefined, payload);
    }
  }

  class SwitchableAdapter {
    constructor(localAdapter, remoteProvider) {
      this.local = localAdapter;
      this.remoteProvider = typeof remoteProvider === "function" ? remoteProvider : () => null;
      this.lastSnapshot = null;
      this.pendingSavePayload = null;
      this.saveInFlight = null;
    }

    getRemote() {
      return this.remoteProvider() || null;
    }

    get kind() {
      return this.getRemote() ? "remote" : "local";
    }

    async loadLocalOnly(scopeOverride) {
      return this.local.loadByScope(scopeOverride);
    }

    async loadAppData() {
      const remote = this.getRemote();
      const localData = await this.local.loadAppData();
      const meta = await this.local.loadMeta();

      if (!remote || typeof remote.loadAppData !== "function") {
        this.lastSnapshot = deepClone(localData);
        return localData;
      }

      try {
        const remoteData = await remote.loadAppData();

        if (meta.unsynced && localData && typeof remote.saveAppData === "function") {
          if (remoteData && remoteEpochIsNewer(localData, remoteData)) {
            await this.local.saveAppData(remoteData);
            await this.local.saveMeta(undefined, {
              unsynced: false,
              lastRemoteLoadAt: new Date().toISOString(),
              conflict: "remote_review_epoch_won"
            });
            this.lastSnapshot = deepClone(remoteData);
            return remoteData;
          }
          this.lastSnapshot = deepClone(remoteData || {});
          await remote.saveAppData(localData, remoteData || {});
          await this.local.saveMeta(undefined, { unsynced: false, lastRemoteSaveAt: new Date().toISOString() });
          this.lastSnapshot = deepClone(localData);
          return localData;
        }

        if (remoteData) {
          await this.local.saveAppData(remoteData);
          await this.local.saveMeta(undefined, { unsynced: false, lastRemoteLoadAt: new Date().toISOString() });
          this.lastSnapshot = deepClone(remoteData);
          return remoteData;
        }
      } catch (error) {
        console.warn("Remote adapter load failed, falling back to local cache.", error);
      }

      this.lastSnapshot = deepClone(localData);
      return localData;
    }

    async saveSinglePayload(payload) {
      const remote = this.getRemote();
      const previousSnapshot = deepClone(this.lastSnapshot);
      let remoteSaved = !remote || typeof remote.saveAppData !== "function";
      let remoteError = null;

      if (remote && typeof remote.saveAppData === "function") {
        try {
          await remote.saveAppData(payload, previousSnapshot || {});
          remoteSaved = true;
        } catch (error) {
          remoteError = error;
          console.warn("Remote adapter save failed, keeping local cache.", error);
        }
      }

      await this.local.saveAppData(payload);
      await this.local.saveMeta(undefined, {
        unsynced: !remoteSaved,
        lastRemoteSaveAt: remoteSaved ? new Date().toISOString() : undefined,
        lastError: remoteError ? String(remoteError.message || remoteError) : ""
      });

      if (remoteSaved) this.lastSnapshot = deepClone(payload);
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
    const local = new LocalJsonAdapter(
      ns.constants.STORAGE_KEY,
      () => (ns.auth && typeof ns.auth.getCacheScope === "function" ? ns.auth.getCacheScope() : "anon")
    );

    return new SwitchableAdapter(
      local,
      () => (ns.auth && typeof ns.auth.getRemoteAdapter === "function" ? ns.auth.getRemoteAdapter() : null)
    );
  }

  ns.adapters = { createPersistenceAdapter, LocalJsonAdapter, SwitchableAdapter };
})(window.HSKFlashcards);
