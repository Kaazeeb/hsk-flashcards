window.HSKFlashcards = window.HSKFlashcards || {};

(function (ns) {
  const CONFIG_KEY = "hsk_flashcards_supabase_config_v1";

  const state = {
    config: { url: "", key: "" },
    client: null,
    session: null,
    user: null,
    subscription: null,
    listeners: new Set(),
    lastEvent: "INIT",
    ready: false,
    providerReady: false
  };

  function getCreateClient() {
    return window.supabase && typeof window.supabase.createClient === "function"
      ? window.supabase.createClient
      : null;
  }

  function loadConfig() {
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      if (!raw) return { url: "", key: "" };
      const parsed = JSON.parse(raw);
      return {
        url: String(parsed?.url || "").trim(),
        key: String(parsed?.key || "").trim()
      };
    } catch (error) {
      return { url: "", key: "" };
    }
  }

  function persistConfig() {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(state.config));
  }

  function clearSubscription() {
    const sub = state.subscription;
    state.subscription = null;
    if (!sub) return;
    try {
      if (typeof sub.unsubscribe === "function") sub.unsubscribe();
      if (sub.subscription && typeof sub.subscription.unsubscribe === "function") {
        sub.subscription.unsubscribe();
      }
    } catch (error) {
      console.warn("Failed to unsubscribe Supabase auth listener.", error);
    }
  }

  function getStatus() {
    return {
      ready: state.ready,
      providerReady: state.providerReady,
      configured: !!(state.config.url && state.config.key),
      signedIn: !!state.user,
      email: state.user?.email || "",
      userId: state.user?.id || "",
      config: { ...state.config },
      lastEvent: state.lastEvent
    };
  }

  function notify(event) {
    state.lastEvent = event || state.lastEvent;
    const snapshot = getStatus();
    state.listeners.forEach((listener) => {
      try {
        listener({ event: state.lastEvent, ...snapshot });
      } catch (error) {
        console.error("Auth listener failed.", error);
      }
    });
  }

  async function initializeClient() {
    clearSubscription();
    state.providerReady = !!getCreateClient();
    state.client = null;
    state.session = null;
    state.user = null;

    const createClient = getCreateClient();
    if (!createClient || !state.config.url || !state.config.key) {
      state.ready = true;
      return;
    }

    state.client = createClient(state.config.url, state.config.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    const { data, error } = await state.client.auth.getSession();
    if (error) console.warn("Supabase getSession failed.", error);
    state.session = data?.session || null;
    state.user = state.session?.user || null;

    const subscriptionResult = state.client.auth.onAuthStateChange((event, session) => {
      state.session = session || null;
      state.user = state.session?.user || null;
      notify(event || "AUTH_STATE_CHANGE");
    });

    state.subscription = subscriptionResult?.data?.subscription || subscriptionResult?.data || subscriptionResult;
    state.ready = true;
  }

  async function init() {
    state.config = loadConfig();
    await initializeClient();
    notify("READY");
    return getStatus();
  }

  async function setConfig(url, key) {
    state.config = {
      url: String(url || "").trim(),
      key: String(key || "").trim()
    };
    persistConfig();
    await initializeClient();
    notify("CONFIG_UPDATED");
    return getStatus();
  }

  function getClient() {
    return state.client;
  }

  function getCacheScope() {
    return state.user?.id || "anon";
  }

  function getRemoteAdapter() {
    if (!state.client || !state.user) return null;
    const userId = state.user.id;
    return {
      kind: "supabase",
      async loadAppData() {
        const { data, error } = await state.client
          .from("app_state_documents")
          .select("payload")
          .eq("user_id", userId)
          .maybeSingle();
        if (error) throw error;
        return data?.payload || null;
      },
      async saveAppData(payload) {
        const { error } = await state.client
          .from("app_state_documents")
          .upsert(
            {
              user_id: userId,
              payload,
              updated_at: new Date().toISOString()
            },
            { onConflict: "user_id" }
          );
        if (error) throw error;
      }
    };
  }

  async function signUp(email, password) {
    if (!state.client) throw new Error("Supabase is not configured yet.");
    const { data, error } = await state.client.auth.signUp({
      email: String(email || "").trim(),
      password: String(password || ""),
      options: {
        emailRedirectTo: window.location.href.split("#")[0]
      }
    });
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    if (!state.client) throw new Error("Supabase is not configured yet.");
    const { data, error } = await state.client.auth.signInWithPassword({
      email: String(email || "").trim(),
      password: String(password || "")
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    if (!state.client) return;
    const { error } = await state.client.auth.signOut();
    if (error) throw error;
  }

  function subscribe(listener) {
    if (typeof listener !== "function") return () => {};
    state.listeners.add(listener);
    return () => state.listeners.delete(listener);
  }

  ns.auth = {
    init,
    setConfig,
    getStatus,
    getClient,
    getRemoteAdapter,
    getCacheScope,
    signUp,
    signIn,
    signOut,
    subscribe
  };
})(window.HSKFlashcards);
