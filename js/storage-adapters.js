/*
Persistence adapter layer.
- Local cache is namespaced by current auth scope (anon or user id).
- Remote sync is granular when Supabase auth is active and signed in.
*/
(function (ns) {
  function deepClone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
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

    async loadByScope(scopeOverride) {
      try {
        const scopedKey = this.getKey(scopeOverride);
        const raw = localStorage.getItem(scopedKey);
        if (raw) return JSON.parse(raw);
        const scope = this.getScope(scopeOverride);
        if (scope === "anon") {
          const legacyRaw = localStorage.getItem(this.baseKey);
          if (legacyRaw) {
            localStorage.setItem(scopedKey, legacyRaw);
            return JSON.parse(legacyRaw);
          }
        }
        return null;
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

  function buildSettingsFragment(db) {
    return {
      vocab: deepClone(db?.vocab || []),
      sets: deepClone(db?.sets || {}),
      ui: deepClone(db?.ui || {})
    };
  }

  function buildProgressBaseFragment(db) {
    return {
      progress: deepClone(db?.progress || {}),
      smartBySet: deepClone(db?.smartBySet || {})
    };
  }

  class SwitchableAdapter {
    constructor(localAdapter, remoteProvider) {
      this.local = localAdapter;
      this.remoteProvider = typeof remoteProvider === "function" ? remoteProvider : () => null;
      this.lastSnapshot = null;
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
      if (remote && typeof remote.loadAppData === "function") {
        try {
          const remoteData = await remote.loadAppData();
          if (remoteData) {
            await this.local.saveAppData(remoteData);
            this.lastSnapshot = deepClone(remoteData);
            return remoteData;
          }
        } catch (error) {
          console.warn("Remote adapter load failed, falling back to local cache.", error);
        }
      }
      const localData = await this.local.loadAppData();
      this.lastSnapshot = deepClone(localData);
      return localData;
    }

    async saveAppData(payload) {
      const remote = this.getRemote();
      const previousSnapshot = deepClone(this.lastSnapshot);
      let remoteSaved = !remote || typeof remote.saveAppData !== "function";
      if (remote && typeof remote.saveAppData === "function") {
        try {
          await remote.saveAppData(payload, previousSnapshot || {});
          remoteSaved = true;
        } catch (error) {
          console.warn("Remote adapter save failed, keeping local cache.", error);
        }
      }
      await this.local.saveAppData(payload);
      if (remoteSaved) this.lastSnapshot = deepClone(payload);
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

  ns.adapters = {
    createPersistenceAdapter,
    LocalJsonAdapter,
    SwitchableAdapter,
    buildSettingsFragment,
    buildProgressBaseFragment
  };
})(window.HSKFlashcards);
