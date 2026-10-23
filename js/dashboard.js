/* ============================================================
   Local Service Connector — Dashboards
   ------------------------------------------------------------
   Handles both dashboard.html (customer) and
   provider-dashboard.html (service provider).
   ============================================================ */

(function () {
  "use strict";

  const LSC = (window.LSC = window.LSC || {});
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const ACTIVE_STATUSES = ["Pending", "Accepted", "In Progress"];
  const DEMO_PROVIDER_ID = 1;

  let providerStatusFilter = "All";

  /* ----------------------------------------------------------
     1. Small helpers
     ---------------------------------------------------------- */

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function isoOffset(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const parts = String(iso).split("-");
    if (parts.length !== 3) return iso;
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function statusBadge(status) {
    const s = LSC.normalizeStatus ? LSC.normalizeStatus(status) : status;
    const styles = {
      Pending: "lsc-badge--amber",
      Accepted: "lsc-badge--brand",
      "In Progress": "lsc-badge--brand",
      Completed: "lsc-badge--green",
      Cancelled: "lsc-badge--slate"
    };
    return (
      '<span class="lsc-badge ' +
      (styles[s] || "lsc-badge--slate") +
      '"><span class="lsc-dot"></span>' +
      LSC.escapeHtml(s) +
      "</span>"
    );
  }

  function statCard(icon, value, label) {
    return (
      '<div class="lsc-stat">' +
      '<span class="lsc-stat__icon"><i data-lucide="' +
      icon +
      '"></i></span>' +
      "<div><p class=\"lsc-stat__value\">" +
      LSC.escapeHtml(String(value)) +
      "</p>" +
      '<p class="lsc-stat__label">' +
      LSC.escapeHtml(label) +
      "</p></div></div>"
    );
  }

  function initialsAvatar(name) {
    return (
      '<span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">' +
      LSC.getInitials(name) +
      "</span>"
    );
  }

  /* ----------------------------------------------------------
     2. Demo seeding
     ---------------------------------------------------------- */

  function mergeSeed(key, flagName, seeds) {
    const flags = LSC.store.get("lsc_seeded", {}) || {};
    if (flags[flagName]) return;

    const current = LSC.store.get(key, null);
    const list = Array.isArray(current) ? current : [];
    const existing = {};
    list.forEach((item) => {
      existing[item.id] = true;
    });

    LSC.store.set(
      key,
      list.concat(seeds.filter((seed) => !existing[seed.id]))
    );

    flags[flagName] = true;
    LSC.store.set("lsc_seeded", flags);
  }

  function seedCustomerRequests() {
    const provider = LSC.getProvider(1);
    const fixer = LSC.getProvider(5);
    const plumber = LSC.getProvider(10);

    return [
      {
        id: "REQ-DEMO-1",
        providerId: provider.id,
        providerName: provider.name,
        providerAvatar: provider.avatar,
        category: provider.category,
        location: provider.location,
        service: "Operating system installation",
        price: 400,
        date: isoOffset(3),
        time: "10:00 AM",
        description: "Laptop boots slowly after the last update and needs a clean install.",
        phone: "+251 911 000 001",
        customer: "Demo Customer",
        status: "Accepted",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        demo: true
      },
      {
        id: "REQ-DEMO-2",
        providerId: fixer.id,
        providerName: fixer.name,
        providerAvatar: fixer.avatar,
        category: fixer.category,
        location: fixer.location,
        service: "Screen replacement",
        price: 1200,
        date: isoOffset(-9),
        time: "02:00 PM",
        description: "Cracked screen on a 2022 handset, glass still responsive.",
        phone: "+251 911 000 001",
        customer: "Demo Customer",
        status: "Completed",
        createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        demo: true
      },
      {
        id: "REQ-DEMO-3",
        providerId: plumber.id,
        providerName: plumber.name,
        providerAvatar: plumber.avatar,
        category: plumber.category,
        location: plumber.location,
        service: "Leak detection & repair",
        price: 400,
        date: isoOffset(6),
        time: "11:00 AM",
        description: "Kitchen sink cabinet is damp and the pipe joint drips overnight.",
        phone: "+251 911 000 001",
        customer: "Demo Customer",
        status: "Pending",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        demo: true
      }
    ];
  }

  function seedProviderRequests() {
    return [
      {
        id: "REQ-DEMO-4",
        customer: "Yonas Kebede",
        service: "Virus & malware removal",
        date: isoOffset(0),
        time: "09:00 AM",
        amount: 450,
        status: "Pending",
        providerId: 1,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: "REQ-DEMO-5",
        customer: "Hanna Meles",
        service: "Hardware upgrade (RAM/SSD)",
        date: isoOffset(2),
        time: "03:00 PM",
        amount: 1200,
        status: "Accepted",
        providerId: 1,
        createdAt: new Date(Date.now() - 3600000 * 26).toISOString()
      },
      {
        id: "REQ-DEMO-1",
        customer: "Demo Customer",
        service: "Operating system installation",
        date: isoOffset(3),
        time: "10:00 AM",
        amount: 400,
        status: "Accepted",
        providerId: 1,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: "REQ-DEMO-6",
        customer: "Biniam Solomon",
        service: "Diagnostic & repair quote",
        date: isoOffset(-3),
        time: "11:00 AM",
        amount: 200,
        status: "Completed",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: "REQ-DEMO-7",
        customer: "Rahel Desta",
        service: "Data recovery",
        date: isoOffset(-6),
        time: "04:00 PM",
        amount: 900,
        status: "Completed",
        createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
      },
      {
        id: "REQ-DEMO-8",
        customer: "Nebiyu Fikru",
        service: "Charging port repair",
        date: isoOffset(-8),
        time: "10:00 AM",
        amount: 600,
        status: "Cancelled",
        providerId: 1,
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
      }
    ];
  }

  function seedReviews() {
    return [
      {
        id: "REV-DEMO-1",
        providerId: 5,
        providerName: "Mobile Fix Center",
        rating: 5,
        text: "Screen was replaced in under an hour and they tested everything with me before I left.",
        date: "2 weeks ago"
      },
      {
        id: "REV-DEMO-2",
        providerId: 15,
        providerName: "FreshSpace Cleaning Co.",
        rating: 4,
        text: "Thorough deep clean of the apartment. Arrived on time and brought their own supplies.",
        date: "1 month ago"
      }
    ];
  }

  function ensureSeeded() {
    mergeSeed(LSC.KEYS.requests, "requests", seedCustomerRequests());
    mergeSeed(LSC.KEYS.providerRequests, "providerRequests", seedProviderRequests());
    mergeSeed(LSC.KEYS.reviews, "reviews", seedReviews());

    const flags = LSC.store.get("lsc_seeded", {}) || {};
    if (!flags.favorites) {
      if (LSC.store.get(LSC.KEYS.favorites, null) === null) {
        LSC.store.set(LSC.KEYS.favorites, [1, 5]);
      }
      flags.favorites = true;
      LSC.store.set("lsc_seeded", flags);
    }
  }

  function getList(key) {
    const value = LSC.store.get(key, []);
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const normalized = Object.assign({}, item);
        if (LSC.normalizeStatus) normalized.status = LSC.normalizeStatus(normalized.status);
        if (normalized.providerId !== undefined && normalized.providerId !== null) normalized.providerId = Number(normalized.providerId);
        if (!normalized.id) normalized.id = LSC.generateRequestId ? LSC.generateRequestId() : "REQ-" + Math.random().toString(36).substr(2, 9);
        return normalized;
      })
      .filter(Boolean);
  }

  /* ----------------------------------------------------------
     3. Customer dashboard
     ---------------------------------------------------------- */

  function progressTimelineHtml(status) {
    const s = LSC.normalizeStatus ? LSC.normalizeStatus(status) : status;
    const steps = ["Pending", "Accepted", "In Progress", "Completed"];
    if (s === "Cancelled") {
      return (
        '<div class="mt-2 flex items-center gap-2 text-xs text-slate-500">' +
        '<span class="lsc-badge lsc-badge--slate"><span class="lsc-dot"></span>Cancelled</span>' +
        '<span>Request was cancelled</span>' +
        "</div>"
      );
    }
    return (
      '<div class="mt-3 flex items-center gap-1.5" aria-label="Request progress">' +
      steps
        .map((step, idx) => {
          const currentIndex = steps.indexOf(s);
          const active = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            '<div class="flex flex-1 items-center gap-1.5">' +
            '<div class="h-1.5 flex-1 rounded-full ' +
            (active ? "bg-brand-500" : "bg-slate-200") +
            (isCurrent ? " ring-2 ring-brand-200" : "") +
            '"></div>' +
            (idx < steps.length - 1
              ? '<span class="text-[10px] text-slate-400">' +
                (active ? "›" : "•") +
                "</span>"
              : "") +
            "</div>"
          );
        })
        .join("") +
      "</div>" +
      '<div class="mt-1 flex justify-between text-[10px] text-slate-500">' +
      steps
        .map((step, idx) => {
          const currentIndex = steps.indexOf(s);
          const active = idx <= currentIndex;
          return (
            '<span class="' + (active ? "font-medium text-brand-700" : "") + '">' +
            step +
            "</span>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function requestRowHtml(request, options) {
    const opts = options || {};
    const status = LSC.normalizeStatus ? LSC.normalizeStatus(request.status) : request.status;
    const cancellable = LSC.canCustomerCancel ? LSC.canCustomerCancel(status) : status === "Pending";
    const provider = LSC.getProvider ? LSC.getProvider(request.providerId) : null;

    return (
      '<div class="lsc-row">' +
      initialsAvatar(request.providerName || (provider ? provider.name : "Provider")) +
      '<div class="min-w-0 flex-1">' +
      '<p class="truncate text-sm font-semibold text-slate-900">' +
      LSC.escapeHtml(request.service || "Service request") +
      "</p>" +
      '<p class="mt-0.5 truncate text-xs text-slate-500">' +
      LSC.escapeHtml(request.providerName || (provider ? provider.name : "Provider")) +
      (request.date ? " · " + formatDate(request.date) : "") +
      (request.time ? " · " + LSC.escapeHtml(request.time) : "") +
      (request.id ? " · " + LSC.escapeHtml(request.id) : "") +
      "</p>" +
      (opts.showTimeline ? progressTimelineHtml(status) : "") +
      "</div>" +
      '<div class="flex items-center gap-2">' +
      statusBadge(status) +
      (opts.showProfile && provider
        ? '<a href="provider.html?id=' +
          provider.id +
          '" class="lsc-btn lsc-btn--ghost lsc-btn--sm">Profile</a>'
        : "") +
      (opts.showDetails
        ? '<button type="button" class="lsc-btn lsc-btn--soft lsc-btn--sm" data-action="view-request-details" data-id="' +
          LSC.escapeHtml(request.id) +
          '">Details</button>'
        : "") +
      (cancellable
        ? '<button type="button" class="lsc-btn lsc-btn--danger lsc-btn--sm" data-action="cancel-request" data-id="' +
          LSC.escapeHtml(request.id) +
          '">Cancel</button>'
        : "") +
      "</div></div>"
    );
  }

  function renderCustomerDashboard() {
    const statsHost = $("#dash-stats");
    if (!statsHost) return;

    const user = LSC.getUser();
    const welcome = $("#dash-welcome");
    if (welcome) {
      welcome.textContent = "Welcome back" + (user ? ", " + String(user.name).split(" ")[0] : "") + "!";
    }

    let requests = getList(LSC.KEYS.requests);
    if (user && user.email) {
      // keep existing behavior; also try to associate by customer name if possible
    }
    const favorites = LSC.getFavorites();
    const reviews = getList(LSC.KEYS.reviews);

    const active = requests.filter((entry) => ACTIVE_STATUSES.indexOf(entry.status) !== -1);
    const completed = requests.filter((entry) => entry.status === "Completed");
    const upcoming = requests
      .filter((entry) => ACTIVE_STATUSES.indexOf(entry.status) !== -1 && entry.date && entry.date >= LSC.todayIso())
      .sort((a, b) => a.date.localeCompare(b.date));

    statsHost.innerHTML =
      statCard("clipboard-list", active.length, "Active requests") +
      statCard("circle-check", completed.length, "Completed services") +
      statCard("heart", favorites.length, "Saved providers") +
      statCard("star", reviews.length, "Reviews given");

    const filterSelect = $("#customer-request-filter");
    let filter = "All";
    if (filterSelect) {
      filter = filterSelect.value || "All";
    }
    let filteredRequests = requests.slice();
    if (filter !== "All") {
      filteredRequests = filteredRequests.filter((entry) => entry.status === filter);
    }
    filteredRequests.sort((a, b) => String(b.createdAt || b.updatedAt || 0).localeCompare(String(a.createdAt || a.updatedAt || 0)));

    const requestsListHost = $("#customer-requests-list");
    const requestsEmptyHost = $("#customer-requests-empty");
    const counter = $("#requests-count");
    if (counter) counter.textContent = requests.length + " total";

    if (requestsListHost) {
      if (!filteredRequests.length) {
        requestsListHost.innerHTML = "";
        if (requestsEmptyHost) {
          requestsEmptyHost.classList.remove("hidden");
          requestsEmptyHost.innerHTML = LSC.emptyStateHtml({
            icon: "inbox",
            title: "No requests found",
            text: filter === "All"
              ? "Find a professional and send your first request — it will show up here instantly."
              : "No requests match the selected filter.",
            actionHref: filter === "All" ? "services.html" : null,
            actionLabel: filter === "All" ? "Browse services" : undefined
          });
        }
      } else {
        if (requestsEmptyHost) {
          requestsEmptyHost.classList.add("hidden");
          requestsEmptyHost.innerHTML = "";
        }
        requestsListHost.innerHTML = filteredRequests
          .map((entry) => requestRowHtml(entry, { showProfile: true, showTimeline: true, showDetails: true }))
          .join("");
      }
    }

    const recentHost = $("#recent-requests");
    if (recentHost) {
      const recent = requests
        .slice()
        .sort((a, b) => String(b.createdAt || 0).localeCompare(String(a.createdAt || 0)))
        .slice(0, 6);

      recentHost.innerHTML = recent.length
        ? recent.map((entry) => requestRowHtml(entry, { showProfile: true })).join("")
        : LSC.emptyStateHtml({
            icon: "inbox",
            title: "No service requests yet",
            text: "Find a professional and send your first request — it will show up here instantly.",
            actionHref: "services.html",
            actionLabel: "Browse services"
          });
    }

    const upcomingHost = $("#upcoming-requests");
    if (upcomingHost) {
      upcomingHost.innerHTML = upcoming.length
        ? upcoming.map((entry) => requestRowHtml(entry, {})).join("")
        : LSC.emptyStateHtml({
            icon: "calendar-x",
            title: "Nothing scheduled",
            text: "Pending or accepted requests with a future date appear here."
          });
    }

    renderSavedProviders();
    renderRecentReviews(reviews);
    LSC.refreshIcons();
  }

  function renderSavedProviders() {
    const host = $("#saved-providers");
    if (!host) return;

    const favorites = LSC.getFavorites();
    const providers = favorites.map(LSC.getProvider).filter(Boolean);

    const counter = $("#saved-count");
    if (counter) counter.textContent = providers.length + " saved";

    if (!providers.length) {
      host.innerHTML = LSC.emptyStateHtml({
        icon: "heart",
        title: "No saved providers",
        text: "Tap the heart on any provider card to keep them handy here.",
        actionHref: "services.html",
        actionLabel: "Find providers"
      });
      return;
    }

    host.innerHTML = providers
      .map(
        (provider) =>
          '<div class="lsc-row">' +
          '<a href="provider.html?id=' +
          provider.id +
          '" class="flex min-w-0 flex-1 items-center gap-3">' +
          '<img src="' +
          provider.avatar +
          '" alt="" class="h-9 w-9 shrink-0 rounded-full">' +
          '<span class="min-w-0"><span class="block truncate text-sm font-semibold text-slate-900">' +
          LSC.escapeHtml(provider.name) +
          '</span><span class="block truncate text-xs text-slate-500">' +
          LSC.escapeHtml(provider.category) +
          " · " +
          LSC.escapeHtml(provider.location) +
          "</span></span></a>" +
          '<button type="button" class="lsc-fav is-active" data-action="favorite" data-id="' +
          provider.id +
          '" data-label="' +
          LSC.escapeHtml(provider.name) +
          '" aria-pressed="true" aria-label="Remove ' +
          LSC.escapeHtml(provider.name) +
          ' from saved"><i data-lucide="heart"></i></button>' +
          "</div>"
      )
      .join("");

    LSC.refreshIcons();
  }

  function renderRecentReviews(reviews) {
    const host = $("#recent-reviews");
    if (!host) return;

    if (!reviews.length) {
      host.innerHTML = LSC.emptyStateHtml({
        icon: "message-square",
        title: "No reviews yet",
        text: "Reviews you leave after a completed service will be listed here."
      });
      return;
    }

    host.innerHTML = reviews
      .slice(0, 4)
      .map(
        (review) =>
          '<div class="lsc-row !block">' +
          '<div class="flex items-center justify-between gap-3">' +
          '<p class="truncate text-sm font-semibold text-slate-900">' +
          LSC.escapeHtml(review.providerName) +
          "</p>" +
          '<span class="lsc-badge lsc-badge--amber">' +
          review.rating +
          ".0 ★</span></div>" +
          '<p class="mt-2 text-sm leading-relaxed text-slate-600">' +
          LSC.escapeHtml(review.text) +
          "</p>" +
          '<p class="mt-1.5 text-xs text-slate-400">' +
          LSC.escapeHtml(review.date) +
          "</p></div>"
      )
      .join("");
  }

  /* ----------------------------------------------------------
     4. Provider dashboard
     ---------------------------------------------------------- */

  function renderProviderDashboard() {
    const statsHost = $("#provider-stats");
    if (!statsHost) return;

    const user = LSC.getUser();
    const provider = LSC.getProvider(DEMO_PROVIDER_ID);
    const welcome = $("#provider-welcome");
    if (welcome) {
      welcome.textContent = "Welcome back" + (user ? ", " + String(user.name).split(" ")[0] : "") + "!";
    }

    let queue = getList(LSC.KEYS.providerRequests);
    // Also merge in customer requests that are linked to this provider for completeness
    const customerRequests = getList(LSC.KEYS.requests);
    const mergedMap = {};
    queue.forEach((entry) => {
      mergedMap[entry.id] = Object.assign({}, entry);
    });
    customerRequests.forEach((entry) => {
      if (Number(entry.providerId) === Number(DEMO_PROVIDER_ID)) {
        if (!mergedMap[entry.id]) {
          mergedMap[entry.id] = {
            id: entry.id,
            customer: entry.customer || entry.customerName || "Customer",
            customerId: entry.customerId,
            service: entry.service,
            date: entry.date,
            time: entry.time,
            amount: entry.price || entry.amount,
            status: entry.status,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
            providerId: entry.providerId,
            phone: entry.phone,
            description: entry.description
          };
        } else {
          // sync status/details
          mergedMap[entry.id].status = entry.status || mergedMap[entry.id].status;
          mergedMap[entry.id].service = entry.service || mergedMap[entry.id].service;
          mergedMap[entry.id].date = entry.date || mergedMap[entry.id].date;
          mergedMap[entry.id].time = entry.time || mergedMap[entry.id].time;
          mergedMap[entry.id].amount = entry.price || mergedMap[entry.id].amount || mergedMap[entry.id].amount;
          mergedMap[entry.id].customer = entry.customer || mergedMap[entry.id].customer;
          mergedMap[entry.id].providerId = entry.providerId || mergedMap[entry.id].providerId;
        }
      }
    });
    queue = Object.values(mergedMap);

    const completed = queue.filter((entry) => entry.status === "Completed");
    const earnings = completed.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

    statsHost.innerHTML =
      statCard("inbox", queue.length, "Total requests") +
      statCard("circle-check", completed.length, "Completed jobs") +
      statCard("star", provider ? provider.rating.toFixed(1) + "/5" : "—", "Average rating") +
      statCard("wallet", LSC.formatPrice(earnings), "Earnings");

    renderStatusFilter(queue);
    renderProviderRequests(queue);
    renderProviderProfile(provider);
    renderStatusBreakdown(queue);
    LSC.refreshIcons();
  }

  function renderStatusFilter(queue) {
    const host = $("#status-filter");
    if (!host) return;

    const statuses = ["All", "Pending", "Accepted", "In Progress", "Completed", "Cancelled"];
    host.innerHTML = statuses
      .map((status) => {
        const active = status === providerStatusFilter;
        const count = status === "All" ? queue.length : queue.filter((e) => e.status === status).length;
        return (
          '<button type="button" class="lsc-chip' +
          (active ? " is-active" : "") +
          '" data-status="' +
          status +
          '" aria-pressed="' +
          active +
          '">' +
          status +
          ' <span class="text-xs opacity-70">(' +
          count +
          ")</span></button>"
        );
      })
      .join("");
  }

  function renderProviderRequests(queue) {
    const body = $("#provider-requests-body");
    if (!body) return;

    const filtered =
      providerStatusFilter === "All"
        ? queue
        : queue.filter((entry) => entry.status === providerStatusFilter);

    const count = $("#provider-request-count");
    if (count) {
      count.textContent =
        "Showing " + filtered.length + " of " + queue.length + " requests";
    }

    const emptyPanel = $("#provider-requests-empty");
    const emptyContent = $("#provider-requests-empty-content");

    if (!filtered.length) {
      body.innerHTML = "";
      if (emptyPanel) emptyPanel.classList.remove("hidden");
      if (emptyContent) {
        emptyContent.innerHTML = LSC.emptyStateHtml({
          icon: "inbox",
          title: "No " + providerStatusFilter.toLowerCase() + " requests",
          text: "Change the status filter to see other requests in your queue.",
          actionHref: null
        });
        LSC.refreshIcons();
      }
      return;
    }

    if (emptyPanel) emptyPanel.classList.add("hidden");

    body.innerHTML = filtered
      .map((entry) => {
        const status = LSC.normalizeStatus ? LSC.normalizeStatus(entry.status) : entry.status;
        const pending = status === "Pending";
        const accepted = status === "Accepted";
        const inProgress = status === "In Progress";
        const closed = ["Completed", "Cancelled"].indexOf(status) !== -1;

        let actions = '<span class="text-xs font-medium text-slate-400">No actions</span>';
        if (pending) {
          actions =
            '<button type="button" class="lsc-btn lsc-btn--soft lsc-btn--sm" data-action="accept-request" data-id="' +
            LSC.escapeHtml(entry.id) +
            '">Accept</button>' +
            '<button type="button" class="lsc-btn lsc-btn--danger lsc-btn--sm" data-action="cancel-request-provider" data-id="' +
            LSC.escapeHtml(entry.id) +
            '">Cancel</button>';
        } else if (accepted) {
          actions =
            '<button type="button" class="lsc-btn lsc-btn--primary lsc-btn--sm" data-action="start-progress-request" data-id="' +
            LSC.escapeHtml(entry.id) +
            '">Start Progress</button>' +
            '<button type="button" class="lsc-btn lsc-btn--danger lsc-btn--sm" data-action="cancel-request-provider" data-id="' +
            LSC.escapeHtml(entry.id) +
            '">Cancel</button>';
        } else if (inProgress) {
          actions =
            '<button type="button" class="lsc-btn lsc-btn--primary lsc-btn--sm" data-action="complete-request" data-id="' +
            LSC.escapeHtml(entry.id) +
            '">Mark Completed</button>' +
            '<button type="button" class="lsc-btn lsc-btn--danger lsc-btn--sm" data-action="cancel-request-provider" data-id="' +
            LSC.escapeHtml(entry.id) +
            '">Cancel</button>';
        } else if (closed) {
          actions = '<span class="text-xs font-medium text-slate-400">Closed</span>';
        }

        return (
          "<tr>" +
          '<td><div class="flex items-center gap-2.5">' +
          initialsAvatar(entry.customer) +
          '<span class="whitespace-nowrap font-medium text-slate-800">' +
          LSC.escapeHtml(entry.customer || "Customer") +
          "</span></div>" +
          (entry.phone ? '<p class="mt-1 text-[11px] text-slate-500">' + LSC.escapeHtml(entry.phone) + "</p>" : "") +
          "</td>" +
          '<td><p class="font-medium text-slate-800">' +
          LSC.escapeHtml(entry.service || "Service") +
          "</p>" +
          '<p class="text-xs text-slate-500">' +
          LSC.escapeHtml(entry.id) +
          " · " +
          LSC.formatPrice(entry.amount || 0) +
          (entry.time ? " · " + LSC.escapeHtml(entry.time) : "") +
          (entry.description ? '<br/><span class="line-clamp-2">' + LSC.escapeHtml(entry.description) + "</span>" : "") +
          "</p></td>" +
          '<td class="whitespace-nowrap">' +
          formatDate(entry.date) +
          "</td>" +
          "<td>" +
          statusBadge(status) +
          "</td>" +
          '<td><div class="flex flex-wrap gap-2">' +
          actions +
          "</div></td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function renderProviderProfile(provider) {
    const host = $("#provider-profile-card");
    if (!host || !provider) return;

    host.innerHTML =
      '<div class="flex items-center gap-3">' +
      '<img src="' +
      provider.avatar +
      '" alt="" class="h-12 w-12 rounded-full">' +
      "<div class=\"min-w-0\">" +
      '<p class="truncate text-sm font-semibold text-slate-900">' +
      LSC.escapeHtml(provider.name) +
      "</p>" +
      '<p class="truncate text-xs text-slate-500">' +
      LSC.escapeHtml(provider.category) +
      " · " +
      LSC.escapeHtml(provider.location) +
      "</p></div></div>" +
      '<div class="mt-4 grid grid-cols-2 gap-3 text-center">' +
      '<div class="rounded-xl bg-slate-50 p-3"><p class="text-sm font-bold text-slate-900">' +
      provider.rating.toFixed(1) +
      '</p><p class="text-[11px] text-slate-500">Rating</p></div>' +
      '<div class="rounded-xl bg-slate-50 p-3"><p class="text-sm font-bold text-slate-900">' +
      provider.reviews +
      '</p><p class="text-[11px] text-slate-500">Reviews</p></div>' +
      "</div>" +
      '<a href="provider.html?id=' +
      provider.id +
      '" class="lsc-btn lsc-btn--secondary lsc-btn--block mt-4">View public profile</a>';
  }

  function renderStatusBreakdown(queue) {
    const host = $("#status-breakdown");
    if (!host) return;

    const statuses = ["Pending", "Accepted", "In Progress", "Completed", "Cancelled"];
    const total = queue.length || 1;

    host.innerHTML = statuses
      .map((status) => {
        const count = queue.filter((entry) => entry.status === status).length;
        const pct = Math.round((count / total) * 100);
        const color =
          status === "Completed"
            ? "bg-emerald-500"
            : status === "Cancelled"
            ? "bg-rose-500"
            : status === "In Progress"
            ? "bg-sky-500"
            : status === "Accepted"
            ? "bg-brand-500"
            : "bg-amber-500";

        return (
          '<div class="py-2">' +
          '<div class="flex items-center justify-between text-xs">' +
          '<span class="font-medium text-slate-600">' +
          status +
          "</span>" +
          '<span class="font-semibold text-slate-900">' +
          count +
          "</span></div>" +
          '<div class="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">' +
          '<div class="h-full rounded-full ' +
          color +
          '" style="width:' +
          pct +
          '%"></div></div></div>'
        );
      })
      .join("");
  }

  /* ----------------------------------------------------------
     5. Actions
     ---------------------------------------------------------- */

  function updateStatus(id, nextStatus) {
    const normalizedNext = LSC.normalizeStatus ? LSC.normalizeStatus(nextStatus) : nextStatus;
    const queue = getList(LSC.KEYS.providerRequests);
    const entry = queue.find((item) => item.id === id);
    if (!entry) {
      // try to create/update from customer requests if exists
      const customerRequests = getList(LSC.KEYS.requests);
      const linkedCustomer = customerRequests.find((item) => item.id === id);
      if (linkedCustomer && Number(linkedCustomer.providerId) !== Number(DEMO_PROVIDER_ID)) {
        // prevent modifying other providers' requests
        return false;
      }
    } else {
      if (entry.providerId && Number(entry.providerId) !== Number(DEMO_PROVIDER_ID)) {
        return false;
      }
    }

    // validate transition if coming from existing state
    const customerRequests = getList(LSC.KEYS.requests);
    const linkedCustomer = customerRequests.find((item) => item.id === id);
    const currentStatus = entry ? entry.status : (linkedCustomer ? linkedCustomer.status : null);
    if (LSC.isValidStatusTransition && currentStatus && !LSC.isValidStatusTransition(currentStatus, normalizedNext)) {
      LSC.toast("Invalid status transition.", "error");
      return false;
    }

    if (entry) {
      entry.status = normalizedNext;
      entry.updatedAt = new Date().toISOString();
      LSC.store.set(LSC.KEYS.providerRequests, queue);
    }

    if (linkedCustomer) {
      if (Number(linkedCustomer.providerId) !== Number(DEMO_PROVIDER_ID)) {
        LSC.toast("You cannot update requests belonging to other providers.", "error");
        return false;
      }
      linkedCustomer.status = normalizedNext;
      linkedCustomer.updatedAt = new Date().toISOString();
      LSC.store.set(LSC.KEYS.requests, customerRequests);
    }

    // if only in provider queue
    if (entry && !linkedCustomer) {
      LSC.store.set(LSC.KEYS.providerRequests, queue);
    }
    return true;
  }

  function cancelRequest(id) {
    const requests = getList(LSC.KEYS.requests);
    const entry = requests.find((item) => item.id === id);
    if (!entry) return false;
    if (LSC.canCustomerCancel && !LSC.canCustomerCancel(entry.status)) {
      LSC.toast("Only pending requests can be cancelled.", "error");
      return false;
    }

    entry.status = "Cancelled";
    entry.updatedAt = new Date().toISOString();
    LSC.store.set(LSC.KEYS.requests, requests);

    const queue = getList(LSC.KEYS.providerRequests);
    const linked = queue.find((item) => item.id === id);
    if (linked) {
      linked.status = "Cancelled";
      linked.updatedAt = entry.updatedAt;
      LSC.store.set(LSC.KEYS.providerRequests, queue);
    }
    return true;
  }

  function cancelRequestAsProvider(id) {
    const normalizedNext = "Cancelled";
    const customerRequests = getList(LSC.KEYS.requests);
    const linkedCustomer = customerRequests.find((item) => item.id === id);
    if (linkedCustomer && Number(linkedCustomer.providerId) !== Number(DEMO_PROVIDER_ID)) {
      LSC.toast("You cannot update requests belonging to other providers.", "error");
      return false;
    }

    const queue = getList(LSC.KEYS.providerRequests);
    const entry = queue.find((item) => item.id === id);
    if (entry && entry.providerId && Number(entry.providerId) !== Number(DEMO_PROVIDER_ID)) {
      LSC.toast("You cannot update requests belonging to other providers.", "error");
      return false;
    }

    if (linkedCustomer) {
      linkedCustomer.status = normalizedNext;
      linkedCustomer.updatedAt = new Date().toISOString();
      LSC.store.set(LSC.KEYS.requests, customerRequests);
    }
    if (entry) {
      entry.status = normalizedNext;
      entry.updatedAt = new Date().toISOString();
      LSC.store.set(LSC.KEYS.providerRequests, queue);
    }
    return true;
  }

  function handleActionClick(event) {
    const trigger = event.target.closest("[data-action]");
    if (!trigger) return;
    const action = trigger.getAttribute("data-action");
    const id = trigger.getAttribute("data-id");

    if (action === "accept-request") {
      if (updateStatus(id, "Accepted")) {
        LSC.toast("Request " + id + " accepted.", "success");
        renderProviderDashboard();
        renderCustomerDashboard();
      }
      return;
    }

    if (action === "start-progress-request") {
      if (updateStatus(id, "In Progress")) {
        LSC.toast("Request " + id + " marked as In Progress.", "success");
        renderProviderDashboard();
        renderCustomerDashboard();
      }
      return;
    }

    if (action === "reject-request") {
      if (updateStatus(id, "Cancelled")) {
        LSC.toast("Request " + id + " cancelled.", "info");
        renderProviderDashboard();
        renderCustomerDashboard();
      }
      return;
    }

    if (action === "complete-request") {
      if (updateStatus(id, "Completed")) {
        LSC.toast("Nice work! Request " + id + " marked as completed.", "success");
        renderProviderDashboard();
        renderCustomerDashboard();
      }
      return;
    }

    if (action === "cancel-request-provider") {
      const confirmed = window.confirm("Cancel this request? This action cannot be undone.");
      if (!confirmed) return;
      if (cancelRequestAsProvider(id)) {
        LSC.toast("Request " + id + " cancelled.", "info");
        renderProviderDashboard();
        renderCustomerDashboard();
      }
      return;
    }

    if (action === "cancel-request") {
      const confirmed = window.confirm("Cancel this pending request?");
      if (!confirmed) return;
      if (cancelRequest(id)) {
        LSC.toast("Request " + id + " cancelled.", "info");
        renderCustomerDashboard();
      }
      return;
    }

    if (action === "view-request-details") {
      const requests = getList(LSC.KEYS.requests);
      const entry = requests.find((item) => item.id === id);
      if (!entry) {
        LSC.toast("Request details not found.", "error");
        return;
      }
      const provider = LSC.getProvider ? LSC.getProvider(entry.providerId) : null;
      const status = LSC.normalizeStatus ? LSC.normalizeStatus(entry.status) : entry.status;
      const details = [
        "Request ID: " + entry.id,
        "Service: " + (entry.service || "-"),
        "Provider: " + (entry.providerName || (provider ? provider.name : "-")),
        "Status: " + status,
        "Date: " + (entry.date || "-") + (entry.time ? " " + entry.time : ""),
        "Price: " + LSC.formatPrice(entry.price || entry.amount || 0),
        "Phone: " + (entry.phone || "-"),
        "Description: " + (entry.description || "-"),
        "Created: " + (entry.createdAt ? formatDate(entry.createdAt.split("T")[0]) : "-")
      ].join("\n");
      window.alert(details);
      return;
    }

    if (action === "reset-demo") {
      const confirmed = window.confirm(
        "Reset all demo data? This clears requests, saved providers, and reviews stored in this browser."
      );
      if (!confirmed) return;
      [
        LSC.KEYS.requests,
        LSC.KEYS.providerRequests,
        LSC.KEYS.favorites,
        LSC.KEYS.reviews,
        LSC.KEYS.messages,
        "lsc_seeded"
      ].forEach((key) => LSC.store.remove(key));
      LSC.toast("Demo data reset. Reloading…", "info");
      window.setTimeout(() => window.location.reload(), 500);
    }
  }

  /* ----------------------------------------------------------
     6. Boot
     ---------------------------------------------------------- */

  function init() {
    if (!$("#dash-stats") && !$("#provider-stats")) return;

    ensureSeeded();

    if ($("#dash-stats")) renderCustomerDashboard();
    if ($("#provider-stats")) renderProviderDashboard();

    const customerFilter = $("#customer-request-filter");
    if (customerFilter) {
      customerFilter.addEventListener("change", () => {
        if ($("#dash-stats")) renderCustomerDashboard();
      });
    }

    document.addEventListener("click", (event) => {
      handleActionClick(event);

      const chip = event.target.closest("#status-filter [data-status]");
      if (chip) {
        providerStatusFilter = chip.getAttribute("data-status");
        renderProviderDashboard();
      }
    });

    document.addEventListener("lsc:favorites-changed", () => {
      if ($("#dash-stats")) renderCustomerDashboard();
    });

    document.addEventListener("lsc:request-created", () => {
      if ($("#dash-stats")) renderCustomerDashboard();
      if ($("#provider-stats")) renderProviderDashboard();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
