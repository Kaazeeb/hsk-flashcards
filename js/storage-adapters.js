/*
Remote adapter hook for future DB use (Supabase or similar):
provide window.HSK_APP_REMOTE_ADAPTER with async methods:
- loadAppData() -> object | null
- saveAppData(payload) -> void
The UI and business logic talk only to the store layer, not directly to localStorage.
*/
(function (ns) {
  class LocalJsonAdapter {
    constructor(key) {
      this.key = key;
      this.kind = "local";
    }

    async loadAppData() {
      try {
        const raw = localStorage.getItem(this.key);
        return raw ? JSON.parse(raw) : null;
      } catch (error) {
        return null;
      }
    }

    async saveAppData(payload) {
      localStorage.setItem(this.key, JSON.stringify(payload));
    }
  }

  class ExternalAdapterWrapper {
    constructor(delegate, fallbackKey) {
      this.delegate = delegate;
      this.fallback = new LocalJsonAdapter(fallbackKey);
      this.kind = "remote";
    }

    async loadAppData() {
      try {
        if (this.delegate && typeof this.delegate.loadAppData === "function") {
          return await this.delegate.loadAppData();
        }
      } catch (error) {
        console.warn("Remote adapter load failed, falling back to local cache.", error);
      }
      return this.fallback.loadAppData();
    }

    async saveAppData(payload) {
      try {
        if (this.delegate && typeof this.delegate.saveAppData === "function") {
          await this.delegate.saveAppData(payload);
        }
      } catch (error) {
        console.warn("Remote adapter save failed, keeping local cache.", error);
      }
      await this.fallback.saveAppData(payload);
    }
  }

  function createPersistenceAdapter() {
    const remote = window.HSK_APP_REMOTE_ADAPTER;
    if (remote && typeof remote.loadAppData === "function" && typeof remote.saveAppData === "function") {
      return new ExternalAdapterWrapper(remote, ns.constants.STORAGE_KEY);
    }
    return new LocalJsonAdapter(ns.constants.STORAGE_KEY);
  }

  ns.adapters = {
    createPersistenceAdapter,
    LocalJsonAdapter,
    ExternalAdapterWrapper
  };
})(window.HSKFlashcards);
