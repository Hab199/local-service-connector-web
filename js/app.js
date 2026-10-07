/* ============================================================
   Local Service Connector — Shared Application Shell
   ------------------------------------------------------------
   Responsibilities:
   - Navigation (desktop + mobile) and active link state
   - Toast notifications
   - Modal system (keyboard friendly)
   - Mock authentication (login / signup / logout)
   - Favourite (saved) providers
   - Reusable card renderers
   - Home page sections
   ============================================================ */

(function () {
  "use strict";

  const LSC = (window.LSC = window.LSC || {});

  /* ----------------------------------------------------------
     1. DOM helpers
     ---------------------------------------------------------- */

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  LSC.$ = $;
  LSC.$$ = $$;

  LSC.escapeHtml = function (value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  LSC.formatPrice = function (amount) {
    return "ETB " + Number(amount || 0).toLocaleString("en-US");
  };

  LSC.refreshIcons = function () {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  };

  LSC.getInitials = function (name) {
    return String(name || "?")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  LSC.todayIso = function () {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return now.getFullYear() + "-" + month + "-" + day;
  };

  /* ----------------------------------------------------------
     2. Local storage wrapper
     ---------------------------------------------------------- */

  const KEYS = {
    user: "lsc_user",
    favorites: "lsc_favorites",
    requests: "lsc_requests",
    providerRequests: "lsc_provider_requests",
    reviews: "lsc_reviews",
    messages: "lsc_messages",
    seeded: "lsc_seeded"
  };

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) return JSON.parse(raw);
        const sessionRaw = sessionStorage.getItem(key);
        if (sessionRaw !== null) return JSON.parse(sessionRaw);
        return fallback;
      } catch (error) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        return false;
      }
    },
    setSession(key, value) {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        return false;
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      } catch (error) {
        /* storage unavailable */
      }
    },
    has(key) {
      try {
        return localStorage.getItem(key) !== null || sessionStorage.getItem(key) !== null;
      } catch (error) {
        return false;
      }
    }
  };

  LSC.KEYS = KEYS;
  LSC.store = store;

  /* ----------------------------------------------------------
     3. Toast notifications
     ---------------------------------------------------------- */

  const TOAST_ICONS = {
    success: "circle-check",
    error: "circle-alert",
    info: "info",
    warning: "circle-alert"
  };

  LSC.toast = function (message, type) {
    const root = $("#toast-root");
    if (!root) return;
    const kind = type || "info";
    const item = document.createElement("div");
    item.className = "lsc-toast lsc-toast--" + kind;
    item.setAttribute("role", "status");
    item.innerHTML =
      '<span class="lsc-toast__icon"><i data-lucide="' +
      (TOAST_ICONS[kind] || "info") +
      '"></i></span>' +
      '<p class="lsc-toast__text">' +
      LSC.escapeHtml(message) +
      "</p>" +
      '<button type="button" class="lsc-toast__close" aria-label="Dismiss notification">' +
      '<i data-lucide="x"></i></button>';

    root.appendChild(item);
    LSC.refreshIcons(item);

    const dismiss = () => {
      item.classList.add("is-leaving");
      window.setTimeout(() => item.remove(), 200);
    };
    item.querySelector(".lsc-toast__close").addEventListener("click", dismiss);
    window.setTimeout(dismiss, 4200);
  };

  /* ----------------------------------------------------------
     4. Modal system
     ---------------------------------------------------------- */

  const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const modalStack = [];
  let lastFocused = null;

  function lockScroll() {
    document.body.style.overflow = "hidden";
  }

  function unlockScroll() {
    if (modalStack.length === 0) document.body.style.overflow = "";
  }

  LSC.openModal = function (name) {
    const modal = $('[data-modal="' + name + '"]');
    if (!modal) return;
    if (modalStack.indexOf(name) !== -1) return;
    if (modalStack.length === 0) lastFocused = document.activeElement;

    modal.classList.remove("hidden");
    modalStack.push(name);
    lockScroll();

    const firstField = modal.querySelector("[data-autofocus]") || modal.querySelector(FOCUSABLE);
    window.setTimeout(() => {
      if (firstField) firstField.focus();
    }, 40);
  };

  LSC.closeModal = function (name) {
    const target = name || modalStack[modalStack.length - 1];
    if (!target) return;
    const modal = $('[data-modal="' + target + '"]');
    if (modal) modal.classList.add("hidden");
    const index = modalStack.indexOf(target);
    if (index !== -1) modalStack.splice(index, 1);

    unlockScroll();
    if (modalStack.length === 0 && lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
      lastFocused = null;
    }
  };

  LSC.topModal = function () {
    return modalStack[modalStack.length - 1] || null;
  };

  document.addEventListener("keydown", (event) => {
    const active = modalStack[modalStack.length - 1];
    if (!active) return;
    const modal = $('[data-modal="' + active + '"]');
    if (!modal) return;

    if (event.key === "Escape") {
      event.preventDefault();
      LSC.closeModal(active);
      return;
    }

    if (event.key === "Tab") {
      const focusables = $$(FOCUSABLE, modal).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  /* ----------------------------------------------------------
     5. Mock authentication
     ---------------------------------------------------------- */

  function normaliseUser(user) {
    return {
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      type: user.type === "provider" ? "provider" : "customer"
    };
  }

  LSC.getUser = function () {
    return store.get(KEYS.user, null);
  };

  LSC.saveUser = function (user, remember) {
    store.remove(KEYS.user);
    if (remember === false) {
      store.setSession(KEYS.user, normaliseUser(user));
    } else {
      store.set(KEYS.user, normaliseUser(user));
    }
    updateAuthUI();
  };

  LSC.logout = function () {
    store.remove(KEYS.user);
    updateAuthUI();
    LSC.toast("You have been signed out.", "info");
    if (/dashboard\.html$/.test(window.location.pathname.split("/").pop() || "")) {
      window.setTimeout(() => {
        window.location.href = "index.html";
      }, 600);
    }
  };

  LSC.isValidEmail = function (value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim());
  };

  LSC.isValidPhone = function (value) {
    const digits = String(value).replace(/\D/g, "");
    return digits.length >= 9 && digits.length <= 15;
  };

  function nameFromEmail(email) {
    const raw = String(email).split("@")[0].replace(/[._-]+/g, " ").trim();
    return raw
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  /* ----------------------------------------------------------
     6. Favourite (saved) providers
     ---------------------------------------------------------- */

  LSC.getFavorites = function () {
    const list = store.get(KEYS.favorites, []);
    return Array.isArray(list) ? list : [];
  };

  LSC.isFavorite = function (id) {
    return LSC.getFavorites().indexOf(Number(id)) !== -1;
  };

  LSC.toggleFavorite = function (id) {
    const providerId = Number(id);
    const favorites = LSC.getFavorites();
    const index = favorites.indexOf(providerId);
    let saved;

    if (index === -1) {
      favorites.push(providerId);
      saved = true;
    } else {
      favorites.splice(index, 1);
      saved = false;
    }

    store.set(KEYS.favorites, favorites);
    syncFavoriteButtons(providerId, saved);
    document.dispatchEvent(new CustomEvent("lsc:favorites-changed", { detail: { id: providerId, saved: saved } }));

    const provider = LSC.getProvider(providerId);
    LSC.toast(
      saved
        ? (provider ? provider.name : "Provider") + " saved to your list."
        : (provider ? provider.name : "Provider") + " removed from saved providers.",
      saved ? "success" : "info"
    );
    return saved;
  };

  function syncFavoriteButtons(id, saved) {
    $$('[data-action="favorite"][data-id="' + id + '"]').forEach((button) => {
      button.setAttribute("aria-pressed", String(saved));
      button.classList.toggle("is-active", saved);
      const label = button.getAttribute("data-label") || "provider";
      button.setAttribute(
        "aria-label",
        (saved ? "Remove " + label + " from saved" : "Save " + label + " to your list")
      );
    });
  }

  /* ----------------------------------------------------------
     7. Reusable markup
     ---------------------------------------------------------- */

  function starRow(colorClass) {
    let html = "";
    for (let i = 0; i < 5; i += 1) {
      html += '<i data-lucide="star" class="h-3.5 w-3.5 shrink-0 ' + colorClass + '"></i>';
    }
    return html;
  }

  LSC.starsHtml = function (rating) {
    const pct = Math.max(0, Math.min(100, (Number(rating) / 5) * 100));
    return (
      '<span class="lsc-stars" role="img" aria-label="' +
      Number(rating).toFixed(1) +
      ' out of 5 stars">' +
      '<span class="lsc-stars__track">' +
      starRow("text-amber-200 fill-current") +
      "</span>" +
      '<span class="lsc-stars__fill" style="width:' +
      pct +
      '%">' +
      starRow("text-amber-400 fill-current") +
      "</span>" +
      "</span>"
    );
  };

  LSC.ratingHtml = function (rating, reviews, size) {
    return (
      '<span class="inline-flex items-center gap-1.5 ' +
      (size === "lg" ? "text-sm" : "text-xs") +
      '">' +
      LSC.starsHtml(rating) +
      '<span class="font-semibold text-slate-800">' +
      Number(rating).toFixed(1) +
      "</span>" +
      '<span class="text-slate-500">(' +
      reviews +
      " reviews)</span>" +
      "</span>"
    );
  };

  LSC.favoriteButtonHtml = function (provider) {
    const saved = LSC.isFavorite(provider.id);
    return (
      '<button type="button" class="lsc-fav' +
      (saved ? " is-active" : "") +
      '" data-action="favorite" data-id="' +
      provider.id +
      '" data-label="' +
      LSC.escapeHtml(provider.name) +
      '" aria-pressed="' +
      saved +
      '" aria-label="Save ' +
      LSC.escapeHtml(provider.name) +
      ' to your list" title="Save provider">' +
      '<i data-lucide="heart"></i></button>'
    );
  };

  LSC.availabilityHtml = function (available) {
    return available
      ? '<span class="lsc-badge lsc-badge--green"><span class="lsc-dot"></span>Available today</span>'
      : '<span class="lsc-badge lsc-badge--slate"><span class="lsc-dot"></span>Booked out</span>';
  };

  LSC.providerCardHtml = function (provider) {
    return (
      '<article class="lsc-card group">' +
      '<div class="flex items-start gap-3">' +
      '<img src="' +
      provider.avatar +
      '" alt="" width="48" height="48" class="h-12 w-12 shrink-0 rounded-full shadow-sm">' +
      '<div class="min-w-0 flex-1">' +
      '<div class="flex items-center gap-1.5">' +
      '<h3 class="truncate text-[15px] font-semibold text-slate-900">' +
      LSC.escapeHtml(provider.name) +
      "</h3>" +
      (provider.verified
        ? '<i data-lucide="badge-check" class="h-4 w-4 shrink-0 text-brand-600" aria-label="Verified provider"></i>'
        : "") +
      "</div>" +
      '<p class="mt-0.5 truncate text-sm text-slate-500">' +
      LSC.escapeHtml(provider.category) +
      "</p>" +
      "</div>" +
      LSC.favoriteButtonHtml(provider) +
      "</div>" +

      '<div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">' +
      '<span class="inline-flex items-center gap-1.5"><i data-lucide="map-pin" class="h-4 w-4 text-slate-400"></i>' +
      LSC.escapeHtml(provider.location) +
      "</span>" +
      LSC.ratingHtml(provider.rating, provider.reviews) +
      "</div>" +

      '<div class="mt-4 flex items-end justify-between gap-3 border-t border-dashed border-slate-200 pt-4">' +
      "<div>" +
      '<p class="text-[11px] font-medium uppercase tracking-wide text-slate-400">Starting at</p>' +
      '<p class="mt-0.5 text-sm font-semibold text-slate-900">' +
      LSC.formatPrice(provider.price) +
      "</p>" +
      "</div>" +
      LSC.availabilityHtml(provider.available) +
      "</div>" +

      '<a href="provider.html?id=' +
      provider.id +
      '" class="lsc-btn lsc-btn--secondary lsc-btn--block mt-4">View profile' +
      '<i data-lucide="arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-0.5"></i></a>' +
      "</article>"
    );
  };

  LSC.categoryCardHtml = function (category) {
    return (
      '<article class="lsc-card lsc-card--hover group">' +
      '<div class="flex items-start justify-between gap-3">' +
      '<span class="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors duration-200 group-hover:bg-brand-600 group-hover:text-white">' +
      '<i data-lucide="' +
      category.icon +
      '" class="h-5 w-5"></i></span>' +
      '<span class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">' +
      category.count +
      " provider" +
      (category.count === 1 ? "" : "s") +
      "</span>" +
      "</div>" +
      '<h3 class="mt-4 text-base font-semibold text-slate-900">' +
      LSC.escapeHtml(category.name) +
      "</h3>" +
      '<p class="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500">' +
      LSC.escapeHtml(category.description) +
      "</p>" +
      '<a href="services.html?cat=' +
      encodeURIComponent(category.name) +
      '" class="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700">View services' +
      '<i data-lucide="arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-0.5"></i></a>' +
      "</article>"
    );
  };

  LSC.emptyStateHtml = function (options) {
    const o = options || {};
    return (
      '<div class="lsc-empty">' +
      '<span class="lsc-empty__icon"><i data-lucide="' +
      (o.icon || "inbox") +
      '"></i></span>' +
      '<h3 class="mt-4 text-base font-semibold text-slate-900">' +
      LSC.escapeHtml(o.title || "Nothing here yet") +
      "</h3>" +
      '<p class="mt-1 max-w-sm text-sm text-slate-500">' +
      LSC.escapeHtml(o.text || "") +
      "</p>" +
      (o.actionHref
        ? '<a href="' + o.actionHref + '" class="lsc-btn lsc-btn--primary mt-5">' +
          LSC.escapeHtml(o.actionLabel || "Browse services") +
          "</a>"
        : "") +
      "</div>"
    );
  };

  /* ----------------------------------------------------------
     8. Navigation
     ---------------------------------------------------------- */

  const NAV_ITEMS = [
    { key: "home", href: "index.html", label: "Home" },
    { key: "services", href: "services.html", label: "Services" },
    { key: "about", href: "about.html", label: "About" },
    { key: "contact", href: "contact.html", label: "Contact" }
  ];

  function navLinksHtml(page, mobile) {
    return NAV_ITEMS.map((item) => {
      const active = item.key === page;
      return (
        '<a href="' +
        item.href +
        '" data-nav="' +
        item.key +
        '" class="' +
        (mobile
          ? "lsc-nav-link--mobile" + (active ? " is-active" : "")
          : "lsc-nav-link" + (active ? " is-active" : "")) +
        (active ? '" aria-current="page' : "") +
        '">' +
        item.label +
        "</a>"
      );
    }).join("");
  }

  function headerHtml(page) {
    const user = LSC.getUser();
    const dashboardHref = user && user.type === "provider" ? "provider-dashboard.html" : "dashboard.html";

    const guestDesktop =
      '<button type="button" class="lsc-btn lsc-btn--ghost" data-auth="login">Log in</button>' +
      '<button type="button" class="lsc-btn lsc-btn--primary" data-auth="signup">Get started</button>';

    const providerDashLink =
      '<a href="provider-dashboard.html" class="lsc-nav-link--mobile"><i data-lucide="briefcase" class="h-4 w-4"></i>Provider dashboard</a>';

    const userDesktop = user
      ? '<a href="' +
        dashboardHref +
        '" class="lsc-btn lsc-btn--ghost"><i data-lucide="layout-dashboard" class="h-4 w-4"></i>Dashboard</a>' +
        '<button type="button" class="lsc-btn lsc-btn--ghost !px-2.5" data-action="logout" aria-label="Sign out" title="Sign out">' +
        '<i data-lucide="log-out" class="h-4 w-4"></i></button>' +
        '<a href="' +
        dashboardHref +
        '" class="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 transition hover:border-brand-300">' +
        '<span class="grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-[11px] font-semibold text-white">' +
        LSC.getInitials(user.name) +
        "</span>" +
        '<span class="max-w-[7rem] truncate text-sm font-medium text-slate-700">' +
        LSC.escapeHtml(String(user.name).split(" ")[0]) +
        "</span></a>"
      : "";

    const userMobile = user
      ? '<a href="' +
        dashboardHref +
        '" class="lsc-nav-link--mobile"><i data-lucide="layout-dashboard" class="h-4 w-4"></i>Dashboard</a>' +
        providerDashLink +
        '<button type="button" class="lsc-nav-link--mobile" data-action="logout">' +
        '<i data-lucide="log-out" class="h-4 w-4"></i>Sign out</button>'
      : "";

    const guestMobile =
      '<button type="button" class="lsc-nav-link--mobile" data-auth="login">' +
      '<i data-lucide="log-in" class="h-4 w-4"></i>Log in</button>' +
      '<button type="button" class="lsc-nav-link--mobile" data-auth="signup">' +
      '<i data-lucide="user-plus" class="h-4 w-4"></i>Create account</button>';

    return (
      '<header class="site-header">' +
      '<div class="lsc-container">' +
      '<div class="flex h-16 items-center justify-between gap-4 lg:h-[72px]">' +
      '<a href="index.html" class="flex shrink-0 items-center gap-2.5" aria-label="Local Service Connector home">' +
      '<img src="assets/images/logo.svg" alt="" width="36" height="36" class="h-9 w-9 rounded-xl shadow-sm">' +
      '<span class="text-[15px] font-bold leading-tight tracking-tight text-slate-900 sm:text-base">' +
      "Local Service <span class=\"text-brand-600\">Connector</span></span>" +
      "</a>" +

      '<nav class="hidden items-center gap-1 lg:flex" aria-label="Primary">' +
      navLinksHtml(page, false) +
      "</nav>" +

      '<div class="hidden items-center gap-2 lg:flex">' +
      (user ? userDesktop : guestDesktop) +
      "</div>" +

      '<button type="button" class="lsc-burger lg:hidden" id="mobile-toggle" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu">' +
      '<i data-lucide="menu" class="h-5 w-5"></i></button>' +
      "</div>" +
      "</div>" +

      '<div id="mobile-menu" class="mobile-menu lg:hidden" hidden>' +
      '<nav class="lsc-container flex flex-col gap-1 py-4" aria-label="Mobile">' +
      navLinksHtml(page, true) +
      '<div class="my-2 border-t border-slate-200"></div>' +
      (user ? userMobile : guestMobile) +
      "</nav></div>" +
      "</header>"
    );
  }

  function footerHtml() {
    const year = new Date().getFullYear();
    const serviceLinks = LSC.getPopularCategories()
      .slice(0, 5)
      .map(
        (category) =>
          '<li><a href="services.html?cat=' +
          encodeURIComponent(category.name) +
          '" class="footer-link">' +
          category.name +
          "</a></li>"
      )
      .join("");

    return (
      '<footer class="site-footer">' +
      '<div class="lsc-container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:py-16">' +
      '<div class="sm:col-span-2 lg:col-span-1">' +
      '<div class="flex items-center gap-2.5">' +
      '<img src="assets/images/logo.svg" alt="" width="34" height="34" class="h-[34px] w-[34px] rounded-xl">' +
      '<span class="text-base font-bold tracking-tight text-white">Local Service <span class="text-brand-400">Connector</span></span>' +
      "</div>" +
      '<p class="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">' +
      "Discover and connect with trusted local professionals — plumbers, technicians, tutors, creatives and more — in a few clicks.</p>" +
      '<p class="mt-4 text-xs text-slate-500">A frontend prototype by Nexora Technologies.</p>' +
      "</div>" +

      '<div><h4 class="footer-title">Platform</h4><ul class="footer-list">' +
      '<li><a href="index.html" class="footer-link">Home</a></li>' +
      '<li><a href="services.html" class="footer-link">Browse services</a></li>' +
      '<li><a href="dashboard.html" class="footer-link">Customer dashboard</a></li>' +
      '<li><a href="provider-dashboard.html" class="footer-link">Provider dashboard</a></li>' +
      "</ul></div>" +

      '<div><h4 class="footer-title">Popular services</h4><ul class="footer-list">' +
      serviceLinks +
      "</ul></div>" +

      '<div><h4 class="footer-title">Company</h4><ul class="footer-list">' +
      '<li><a href="about.html" class="footer-link">About us</a></li>' +
      '<li><a href="contact.html" class="footer-link">Contact</a></li>' +
      '<li><a href="about.html#disclaimer" class="footer-link">Demo disclaimer</a></li>' +
      '<li><a href="about.html#team" class="footer-link">Team</a></li>' +
      "</ul></div>" +
      "</div>" +

      '<div class="border-t border-slate-800">' +
      '<div class="lsc-container flex flex-col gap-3 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">' +
      "<p>&copy; " +
      year +
      " Local Service Connector. All provider details are sample data.</p>" +
      '<p class="inline-flex items-center gap-1.5"><i data-lucide="shield-check" class="h-3.5 w-3.5"></i>Built with HTML, Tailwind CSS &amp; vanilla JavaScript</p>' +
      "</div></div>" +
      "</footer>"
    );
  }

  /* ----------------------------------------------------------
     9. Login / signup modal templates
     ---------------------------------------------------------- */

  function fieldHtml(options) {
    const id = options.id;
    const label = options.label;
    const type = options.type || "text";
    const placeholder = options.placeholder || "";
    const autocomplete = options.autocomplete || "off";
    const extra = options.extra || "";
    const withToggle = options.toggle
      ? '<button type="button" class="lsc-input-toggle" data-action="toggle-password" data-target="' +
        id +
        '" aria-label="Show password"><i data-lucide="eye"></i></button>'
      : "";

    return (
      '<div class="lsc-field">' +
      '<label class="lsc-label" for="' +
      id +
      '">' +
      label +
      "</label>" +
      '<div class="relative">' +
      '<input id="' +
      id +
      '" name="' +
      id +
      '" type="' +
      type +
      '" class="lsc-input' +
      (options.toggle ? " pr-11" : "") +
      '" placeholder="' +
      LSC.escapeHtml(placeholder) +
      '" autocomplete="' +
      autocomplete +
      '" ' +
      extra +
      ">" +
      withToggle +
      "</div>" +
      '<p class="lsc-error" id="' +
      id +
      '-error" hidden></p>' +
      "</div>"
    );
  }

  function loginModalHtml() {
    return (
      '<div class="lsc-modal hidden" data-modal="login" role="dialog" aria-modal="true" aria-labelledby="login-title">' +
      '<div class="lsc-modal__backdrop" data-modal-close></div>' +
      '<div class="lsc-modal__scroller" data-modal-close>' +
      '<div class="lsc-modal__panel" data-modal-surface>' +
      '<div class="flex items-start justify-between gap-4">' +
      "<div>" +
      '<span class="lsc-eyebrow">Welcome back</span>' +
      '<h2 id="login-title" class="mt-2 text-xl font-bold tracking-tight text-slate-900">Log in to your account</h2>' +
      '<p class="mt-1 text-sm text-slate-500">Demo mode — use any valid email and a password of 6+ characters.</p>' +
      "</div>" +
      '<button type="button" class="lsc-modal__close" data-modal-close aria-label="Close dialog"><i data-lucide="x"></i></button>' +
      "</div>" +

      '<form id="login-form" class="mt-6 space-y-4" novalidate>' +
      fieldHtml({ id: "login-email", label: "Email address", type: "email", placeholder: "you@example.com", autocomplete: "email", extra: 'data-autofocus' }) +
      fieldHtml({ id: "login-password", label: "Password", type: "password", placeholder: "••••••••", autocomplete: "current-password", toggle: true }) +

      '<div class="flex items-center justify-between gap-3 pt-1">' +
      '<label class="lsc-check"><input type="checkbox" id="login-remember" checked><span>Remember me</span></label>' +
      '<button type="button" class="text-sm font-semibold text-brand-600 hover:text-brand-700" data-action="forgot-password">Forgot password?</button>' +
      "</div>" +

      '<button type="submit" class="lsc-btn lsc-btn--primary lsc-btn--block">Log in</button>' +
      "</form>" +

      '<p class="mt-5 text-center text-sm text-slate-500">New here? ' +
      '<button type="button" class="font-semibold text-brand-600 hover:text-brand-700" data-auth="signup">Create an account</button></p>' +
      "</div></div></div>"
    );
  }

  function signupModalHtml() {
    return (
      '<div class="lsc-modal hidden" data-modal="signup" role="dialog" aria-modal="true" aria-labelledby="signup-title">' +
      '<div class="lsc-modal__backdrop" data-modal-close></div>' +
      '<div class="lsc-modal__scroller" data-modal-close>' +
      '<div class="lsc-modal__panel" data-modal-surface>' +
      '<div class="flex items-start justify-between gap-4">' +
      "<div>" +
      '<span class="lsc-eyebrow">Get started free</span>' +
      '<h2 id="signup-title" class="mt-2 text-xl font-bold tracking-tight text-slate-900">Create your account</h2>' +
      '<p class="mt-1 text-sm text-slate-500">No real account is created — this is a local demo.</p>' +
      "</div>" +
      '<button type="button" class="lsc-modal__close" data-modal-close aria-label="Close dialog"><i data-lucide="x"></i></button>' +
      "</div>" +

      '<form id="signup-form" class="mt-6 space-y-4" novalidate>' +
      fieldHtml({ id: "signup-name", label: "Full name", placeholder: "e.g. Selamawit Tesfaye", autocomplete: "name", extra: "data-autofocus" }) +
      fieldHtml({ id: "signup-email", label: "Email address", type: "email", placeholder: "you@example.com", autocomplete: "email" }) +
      fieldHtml({ id: "signup-phone", label: "Phone number", type: "tel", placeholder: "+251 9XX XXX XXX", autocomplete: "tel" }) +
      fieldHtml({ id: "signup-password", label: "Password", type: "password", placeholder: "At least 6 characters", autocomplete: "new-password", toggle: true }) +
      fieldHtml({ id: "signup-confirm", label: "Confirm password", type: "password", placeholder: "Repeat your password", autocomplete: "new-password", toggle: true }) +

      '<fieldset class="lsc-field">' +
      '<legend class="lsc-label">Account type</legend>' +
      '<div class="grid grid-cols-2 gap-3">' +
      '<label class="lsc-radio-card is-selected">' +
      '<input type="radio" name="account-type" value="customer" checked class="sr-only">' +
      '<i data-lucide="user"></i><span><strong>Customer</strong><small>Find &amp; book services</small></span></label>' +
      '<label class="lsc-radio-card">' +
      '<input type="radio" name="account-type" value="provider" class="sr-only">' +
      '<i data-lucide="briefcase"></i><span><strong>Provider</strong><small>Offer your services</small></span></label>' +
      "</div></fieldset>" +

      '<p class="lsc-error" id="signup-general-error" hidden></p>' +
      '<button type="submit" class="lsc-btn lsc-btn--primary lsc-btn--block">Create account</button>' +
      "</form>" +

      '<p class="mt-5 text-center text-sm text-slate-500">Already registered? ' +
      '<button type="button" class="font-semibold text-brand-600 hover:text-brand-700" data-auth="login">Log in</button></p>' +
      "</div></div></div>"
    );
  }

  /* ----------------------------------------------------------
     10. Form helpers
     ---------------------------------------------------------- */

  LSC.setFieldError = function (inputId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(inputId + "-error");
    if (input) {
      input.classList.toggle("is-invalid", Boolean(message));
      input.setAttribute("aria-invalid", message ? "true" : "false");
      if (error) input.setAttribute("aria-describedby", inputId + "-error");
    }
    if (error) {
      error.textContent = message || "";
      error.hidden = !message;
    }
  };

  LSC.clearFormErrors = function (form) {
    $$(".lsc-error", form).forEach((el) => {
      el.textContent = "";
      el.hidden = true;
    });
    $$(".is-invalid", form).forEach((el) => el.classList.remove("is-invalid"));
    $$("input, textarea, select", form).forEach((el) => el.removeAttribute("aria-invalid"));
  };

  LSC.setButtonLoading = function (button, label) {
    if (!button) return;
    button.dataset.originalHtml = button.innerHTML;
    button.disabled = true;
    button.innerHTML =
      '<span class="lsc-spinner" aria-hidden="true"></span>' + LSC.escapeHtml(label || "Please wait");
  };

  LSC.clearButtonLoading = function (button) {
    if (!button) return;
    button.disabled = false;
    if (button.dataset.originalHtml) button.innerHTML = button.dataset.originalHtml;
    LSC.refreshIcons(button);
  };

  /* ----------------------------------------------------------
     11. Home page rendering
     ---------------------------------------------------------- */

  function renderHome() {
    const popularRoot = $("#popular-services");
    if (popularRoot) {
      const categories = LSC.categoryCounts().filter((category) => category.popular);
      popularRoot.innerHTML = categories.map(LSC.categoryCardHtml).join("");
    }

    const featuredRoot = $("#featured-providers");
    if (featuredRoot) {
      const providers = LSC.getTopRated(6);
      featuredRoot.innerHTML = providers.map(LSC.providerCardHtml).join("");
    }

    const statsRoot = $("#platform-stats");
    if (statsRoot) {
      statsRoot.innerHTML = LSC.PLATFORM_STATS.map(
        (stat) =>
          '<div class="lsc-stat">' +
          '<span class="lsc-stat__icon"><i data-lucide="' +
          stat.icon +
          '"></i></span>' +
          "<div><p class=\"lsc-stat__value\">" +
          stat.value +
          "</p>" +
          '<p class="lsc-stat__label">' +
          stat.label +
          "</p></div></div>"
      ).join("");
    }

    const heroSearch = $("#hero-search");
    if (heroSearch) {
      const catSelect = $("#hero-category");
      if (catSelect && catSelect.options.length <= 1) {
        catSelect.innerHTML =
          '<option value="">All categories</option>' +
          LSC.CATEGORIES.map(
            (category) =>
              '<option value="' + LSC.escapeHtml(category.name) + '">' + LSC.escapeHtml(category.name) + "</option>"
          ).join("");
      }

      heroSearch.addEventListener("submit", (event) => {
        event.preventDefault();
        const query = ($("#hero-query").value || "").trim();
        const category = $("#hero-category").value || "";
        const location = ($("#hero-location").value || "").trim();

        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (category) params.set("cat", category);
        if (location) params.set("loc", location);

        const target = "services.html" + (params.toString() ? "?" + params.toString() : "");
        const button = heroSearch.querySelector('button[type="submit"]');
        LSC.setButtonLoading(button, "Searching");
        window.setTimeout(() => {
          window.location.href = target;
        }, 350);
      });
    }
  }

  /* ----------------------------------------------------------
     12. Global event delegation
     ---------------------------------------------------------- */

  function handleModalCloseClick(event) {
    const closer = event.target.closest("[data-modal-close]");
    if (!closer) return;
    const surface = closer.querySelector("[data-modal-surface]");
    if (surface && surface.contains(event.target)) return;
    const modal = closer.closest("[data-modal]");
    if (modal) LSC.closeModal(modal.getAttribute("data-modal"));
  }

  function handleAuthClick(event) {
    const trigger = event.target.closest("[data-auth]");
    if (!trigger) return;
    const action = trigger.getAttribute("data-auth");
    closeMobileMenu();
    if (LSC.topModal()) LSC.closeModal();
    window.setTimeout(() => LSC.openModal(action), 60);
  }

  function closeMobileMenu() {
    const menu = document.getElementById("mobile-menu");
    const toggle = document.getElementById("mobile-toggle");
    if (menu) menu.hidden = true;
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      toggle.innerHTML = '<i data-lucide="menu" class="h-5 w-5"></i>';
      LSC.refreshIcons(toggle);
    }
  }
  LSC.closeMobileMenu = closeMobileMenu;

  function handleActionClick(event) {
    const trigger = event.target.closest("[data-action]");
    if (!trigger) return;
    const action = trigger.getAttribute("data-action");

    if (action === "favorite") {
      event.preventDefault();
      LSC.toggleFavorite(trigger.getAttribute("data-id"));
      return;
    }

    if (action === "logout") {
      LSC.logout();
      return;
    }

    if (action === "forgot-password") {
      LSC.toast("Password reset is not available in this demo build.", "info");
      return;
    }

    if (action === "toggle-password") {
      const input = document.getElementById(trigger.getAttribute("data-target"));
      if (!input) return;
      const showing = input.type === "text";
      input.type = showing ? "password" : "text";
      trigger.innerHTML = '<i data-lucide="' + (showing ? "eye" : "eye-off") + '"></i>';
      trigger.setAttribute("aria-label", showing ? "Show password" : "Hide password");
      LSC.refreshIcons(trigger);
    }
  }

  function handleMobileToggle(event) {
    const toggle = event.target.closest("#mobile-toggle");
    if (!toggle) return;
    const menu = document.getElementById("mobile-menu");
    if (!menu) return;
    const isOpen = !menu.hidden;
    menu.hidden = isOpen;
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
    toggle.innerHTML = '<i data-lucide="' + (isOpen ? "menu" : "x") + '" class="h-5 w-5"></i>';
    LSC.refreshIcons(toggle);
  }

  /* ----------------------------------------------------------
     13. Auth form handling
     ---------------------------------------------------------- */

  function wireAuthForms() {
    const loginForm = $("#login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        LSC.clearFormErrors(loginForm);

        const email = $("#login-email").value.trim();
        const password = $("#login-password").value;
        let valid = true;

        if (!LSC.isValidEmail(email)) {
          LSC.setFieldError("login-email", "Enter a valid email address.");
          valid = false;
        }
        if (password.length < 6) {
          LSC.setFieldError("login-password", "Password must be at least 6 characters.");
          valid = false;
        }
        if (!valid) return;

        const submit = loginForm.querySelector('button[type="submit"]');
        LSC.setButtonLoading(submit, "Logging in");

        window.setTimeout(() => {
          LSC.saveUser(
            { name: nameFromEmail(email) || "Demo User", email: email, type: "customer" },
            $("#login-remember").checked
          );
          LSC.clearButtonLoading(submit);
          loginForm.reset();
          LSC.closeModal("login");
          LSC.toast("Welcome back, " + (LSC.getUser().name || "there") + "!", "success");
        }, 700);
      });
    }

    const signupForm = $("#signup-form");
    if (signupForm) {
      signupForm.addEventListener("submit", (event) => {
        event.preventDefault();
        LSC.clearFormErrors(signupForm);

        const name = $("#signup-name").value.trim();
        const email = $("#signup-email").value.trim();
        const phone = $("#signup-phone").value.trim();
        const password = $("#signup-password").value;
        const confirm = $("#signup-confirm").value;
        const typeInput = signupForm.querySelector('input[name="account-type"]:checked');
        const type = typeInput ? typeInput.value : "customer";
        let valid = true;

        if (name.length < 2) {
          LSC.setFieldError("signup-name", "Please enter your full name.");
          valid = false;
        }
        if (!LSC.isValidEmail(email)) {
          LSC.setFieldError("signup-email", "Enter a valid email address.");
          valid = false;
        }
        if (!LSC.isValidPhone(phone)) {
          LSC.setFieldError("signup-phone", "Enter a valid phone number (9+ digits).");
          valid = false;
        }
        if (password.length < 6) {
          LSC.setFieldError("signup-password", "Password must be at least 6 characters.");
          valid = false;
        }
        if (confirm !== password || confirm.length === 0) {
          LSC.setFieldError("signup-confirm", "Passwords do not match.");
          valid = false;
        }
        if (!valid) return;

        const submit = signupForm.querySelector('button[type="submit"]');
        LSC.setButtonLoading(submit, "Creating account");

        window.setTimeout(() => {
          LSC.saveUser({ name: name, email: email, phone: phone, type: type }, true);
          LSC.clearButtonLoading(submit);
          signupForm.reset();
          LSC.closeModal("signup");
          LSC.toast("Account created. Welcome, " + name.split(" ")[0] + "!", "success");
          if (type === "provider") {
            window.setTimeout(() => {
              window.location.href = "provider-dashboard.html";
            }, 900);
          }
        }, 800);
      });

      signupForm.addEventListener("change", (event) => {
        if (event.target.name !== "account-type") return;
        $$(".lsc-radio-card", signupForm).forEach((card) => {
          const input = card.querySelector("input");
          card.classList.toggle("is-selected", Boolean(input && input.checked));
        });
      });
    }
  }

  /* ----------------------------------------------------------
     14. Contact form
     ---------------------------------------------------------- */

  function wireContactForm() {
    const form = $("#contact-form");
    if (!form) return;
    const success = $("#contact-success");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      LSC.clearFormErrors(form);

      const name = $("#contact-name").value.trim();
      const email = $("#contact-email").value.trim();
      const phone = $("#contact-phone").value.trim();
      const subject = $("#contact-subject").value;
      const message = $("#contact-message").value.trim();
      let valid = true;

      if (name.length < 2) {
        LSC.setFieldError("contact-name", "Please enter your name.");
        valid = false;
      }
      if (!LSC.isValidEmail(email)) {
        LSC.setFieldError("contact-email", "Enter a valid email address.");
        valid = false;
      }
      if (!LSC.isValidPhone(phone)) {
        LSC.setFieldError("contact-phone", "Enter a valid phone number (9+ digits).");
        valid = false;
      }
      if (!subject) {
        LSC.setFieldError("contact-subject", "Choose a subject.");
        valid = false;
      }
      if (message.length < 10) {
        LSC.setFieldError("contact-message", "Your message must be at least 10 characters.");
        valid = false;
      }

      if (!valid) {
        const firstInvalid = form.querySelector(".is-invalid");
        if (firstInvalid) firstInvalid.focus();
        LSC.toast("Please fix the highlighted fields.", "error");
        return;
      }

      const submit = form.querySelector('button[type="submit"]');
      LSC.setButtonLoading(submit, "Sending");

      window.setTimeout(() => {
        const stored = store.get(KEYS.messages, []);
        const messages = Array.isArray(stored) ? stored : [];
        messages.unshift({
          id: "MSG-" + Date.now().toString(36).toUpperCase(),
          name: name,
          email: email,
          phone: phone,
          subject: subject,
          message: message,
          createdAt: new Date().toISOString()
        });
        store.set(KEYS.messages, messages);

        LSC.clearButtonLoading(submit);
        form.reset();
        form.classList.add("hidden");
        if (success) {
          success.classList.remove("hidden");
          LSC.refreshIcons();
        }
        LSC.toast("Message sent successfully!", "success");
      }, 900);
    });

    const resetButton = $("#contact-reset");
    if (resetButton) {
      resetButton.addEventListener("click", () => {
        if (success) success.classList.add("hidden");
        form.classList.remove("hidden");
        const firstField = $("#contact-name");
        if (firstField) firstField.focus();
      });
    }
  }

  /* ----------------------------------------------------------
     15. Boot
     ---------------------------------------------------------- */

  function updateAuthUI() {
    const headerHost = $("#site-header");
    if (!headerHost) return;
    const page = document.body.dataset.page || "home";
    headerHost.innerHTML = headerHtml(page);
    LSC.refreshIcons(headerHost);
  }
  LSC.updateAuthUI = updateAuthUI;

  function renderShell() {
    const headerHost = $("#site-header");
    const footerHost = $("#site-footer");
    const page = document.body.dataset.page || "home";

    if (headerHost) {
      headerHost.innerHTML = headerHtml(page);
      LSC.refreshIcons(headerHost);
    }
    if (footerHost) {
      footerHost.innerHTML = footerHtml();
      LSC.refreshIcons(footerHost);
    }

    const modalRoot = $("#modal-root");
    if (modalRoot) {
      modalRoot.innerHTML = loginModalHtml() + signupModalHtml();
      LSC.refreshIcons(modalRoot);
      wireAuthForms();
    }
  }

  function init() {
    renderShell();
    renderHome();
    wireContactForm();

    document.addEventListener("click", (event) => {
      handleMobileToggle(event);
      handleModalCloseClick(event);
      handleAuthClick(event);
      handleActionClick(event);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !LSC.topModal()) {
        const menu = document.getElementById("mobile-menu");
        if (menu && !menu.hidden) closeMobileMenu();
      }
    });

    // Close the mobile menu when a link inside it is chosen.
    document.addEventListener("click", (event) => {
      if (event.target.closest("#mobile-menu a")) closeMobileMenu();
    });

    LSC.refreshIcons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
