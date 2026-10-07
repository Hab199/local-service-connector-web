/* ============================================================
   Local Service Connector — Services & Provider pages
   ------------------------------------------------------------
   - services.html : search, filters, sorting, result grid
   - provider.html : provider profile, reviews, request modal
   ============================================================ */

(function () {
  "use strict";

  const LSC = (window.LSC = window.LSC || {});
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ==========================================================
     1. Services listing page
     ========================================================== */

  const state = {
    q: "",
    cat: "",
    loc: "",
    rating: "",
    price: "",
    availability: "",
    sort: "recommended"
  };

  let debounceTimer = null;

  function readUrlParams() {
    const params = new URLSearchParams(window.location.search);
    state.q = params.get("q") || "";
    state.cat = params.get("cat") || "";
    state.loc = params.get("loc") || "";
    state.rating = params.get("rating") || "";
    state.price = params.get("price") || "";
    state.availability = params.get("avail") || "";
    state.sort = params.get("sort") || "recommended";
  }

  function writeUrlParams() {
    const params = new URLSearchParams();
    if (state.q) params.set("q", state.q);
    if (state.cat) params.set("cat", state.cat);
    if (state.loc) params.set("loc", state.loc);
    if (state.rating) params.set("rating", state.rating);
    if (state.price) params.set("price", state.price);
    if (state.availability) params.set("avail", state.availability);
    if (state.sort !== "recommended") params.set("sort", state.sort);

    const query = params.toString();
    const next = window.location.pathname + (query ? "?" + query : "");
    window.history.replaceState({}, "", next);
  }

  function buildCategoryFilter() {
    const host = $("#category-filter");
    if (!host) return;

    const counts = LSC.categoryCounts();
    const total = LSC.PROVIDERS.length;

    const allButton =
      '<button type="button" class="lsc-chip w-full justify-between" data-cat="" aria-pressed="false">' +
      "<span>All services</span><span class=\"text-xs font-semibold text-slate-400\">" +
      total +
      "</span></button>";

    const items = counts
      .map(
        (category) =>
          '<button type="button" class="lsc-chip w-full justify-between" data-cat="' +
          LSC.escapeHtml(category.name) +
          '" aria-pressed="false">' +
          "<span>" +
          LSC.escapeHtml(category.name) +
          '</span><span class="text-xs font-semibold text-slate-400">' +
          category.count +
          "</span></button>"
      )
      .join("");

    host.innerHTML = allButton + items;
  }

  function buildLocationFilter() {
    const select = $("#filter-location");
    if (!select) return;
    select.innerHTML =
      '<option value="">All locations</option>' +
      LSC.locationCounts()
        .map(
          (entry) =>
            '<option value="' +
            LSC.escapeHtml(entry.name) +
            '">' +
            LSC.escapeHtml(entry.name) +
            " (" +
            entry.count +
            ")</option>"
        )
        .join("");
  }

  function syncControls() {
    const queryInput = $("#services-query");
    if (queryInput) queryInput.value = state.q;

    const locationSelect = $("#filter-location");
    if (locationSelect) locationSelect.value = state.loc;

    const ratingSelect = $("#filter-rating");
    if (ratingSelect) ratingSelect.value = state.rating;

    const priceSelect = $("#filter-price");
    if (priceSelect) priceSelect.value = state.price;

    const availabilitySelect = $("#filter-availability");
    if (availabilitySelect) availabilitySelect.value = state.availability;

    const sortSelect = $("#sort-by");
    if (sortSelect) sortSelect.value = state.sort;

    $$("#category-filter [data-cat]").forEach((button) => {
      const active = button.getAttribute("data-cat") === state.cat;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function filterProviders() {
    let list = LSC.PROVIDERS.slice();
    const query = state.q.trim().toLowerCase();

    if (query) {
      list = list.filter((provider) => {
        const haystack = [
          provider.name,
          provider.category,
          provider.location,
          provider.tagline,
          provider.services.map((service) => service.name).join(" ")
        ]
          .join(" ")
          .toLowerCase();
        return haystack.indexOf(query) !== -1;
      });
    }

    if (state.cat) list = list.filter((provider) => provider.category === state.cat);
    if (state.loc) list = list.filter((provider) => provider.location === state.loc);
    if (state.rating) {
      const minimum = Number(state.rating);
      list = list.filter((provider) => provider.rating >= minimum);
    }
    if (state.price) {
      const parts = state.price.split("-");
      const min = Number(parts[0]);
      const max = Number(parts[1]);
      list = list.filter((provider) => provider.price >= min && provider.price <= max);
    }
    if (state.availability === "available") {
      list = list.filter((provider) => provider.available);
    } else if (state.availability === "booked") {
      list = list.filter((provider) => !provider.available);
    }

    const sorters = {
      recommended: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
      rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
      reviews: (a, b) => b.reviews - a.reviews,
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      name: (a, b) => a.name.localeCompare(b.name)
    };

    list.sort(sorters[state.sort] || sorters.recommended);
    return list;
  }

  function activeFilterSummary() {
    const parts = [];
    if (state.q) parts.push('“' + state.q + '”');
    if (state.cat) parts.push(state.cat);
    if (state.loc) parts.push(state.loc);
    if (state.rating) parts.push(state.rating + "+ stars");
    if (state.price) {
      const labels = {
        "0-300": "Under ETB 300",
        "300-800": "ETB 300 – 800",
        "800-999999": "ETB 800+"
      };
      parts.push(labels[state.price] || "Price filter");
    }
    if (state.availability === "available") parts.push("Available today");
    if (state.availability === "booked") parts.push("Booked out");
    return parts;
  }

  function emptyResultsHtml() {
    return (
      '<div class="lsc-empty">' +
      '<span class="lsc-empty__icon"><i data-lucide="search-x"></i></span>' +
      '<h3 class="mt-4 text-base font-semibold text-slate-900">No providers match these filters</h3>' +
      '<p class="mt-1 max-w-sm text-sm text-slate-500">' +
      "Try widening your search — remove a filter or search for a different service." +
      "</p>" +
      '<button type="button" class="lsc-btn lsc-btn--primary mt-5" data-action="clear-filters">Reset all filters</button>' +
      "</div>"
    );
  }

  function renderResults() {
    const grid = $("#providers-grid");
    if (!grid) return;

    const list = filterProviders();
    const count = $("#result-count");
    const summary = $("#active-filter-label");
    const emptyPanel = $("#results-empty");
    const emptyContent = $("#results-empty-content");

    if (count) {
      count.textContent =
        "Showing " + list.length + " of " + LSC.PROVIDERS.length + " providers";
    }

    const parts = activeFilterSummary();
    if (summary) {
      summary.textContent = parts.length ? parts.join("  ·  ") : "Showing the full catalogue";
    }

    if (list.length === 0) {
      grid.innerHTML = "";
      if (emptyPanel) emptyPanel.classList.remove("hidden");
      if (emptyContent) {
        emptyContent.innerHTML = emptyResultsHtml();
        LSC.refreshIcons();
      }
    } else {
      if (emptyPanel) emptyPanel.classList.add("hidden");
      grid.innerHTML = list.map(LSC.providerCardHtml).join("");
      LSC.refreshIcons();
    }

    writeUrlParams();
  }

  function resetFilters() {
    state.q = "";
    state.cat = "";
    state.loc = "";
    state.rating = "";
    state.price = "";
    state.availability = "";
    state.sort = "recommended";
    syncControls();
    renderResults();
  }

  function wireServicesPage() {
    const form = $("#services-search");
    if (!form) return;

    buildCategoryFilter();
    buildLocationFilter();
    readUrlParams();
    syncControls();
    renderResults();

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      state.q = $("#services-query").value.trim();
      renderResults();
    });

    const queryInput = $("#services-query");
    if (queryInput) {
      queryInput.addEventListener("input", () => {
        window.clearTimeout(debounceTimer);
        debounceTimer = window.setTimeout(() => {
          state.q = queryInput.value.trim();
          renderResults();
        }, 220);
      });
    }

    ["filter-location", "filter-rating", "filter-price", "filter-availability", "sort-by"].forEach(
      (id) => {
        const control = document.getElementById(id);
        if (!control) return;
        control.addEventListener("change", () => {
          if (id === "filter-location") state.loc = control.value;
          if (id === "filter-rating") state.rating = control.value;
          if (id === "filter-price") state.price = control.value;
          if (id === "filter-availability") state.availability = control.value;
          if (id === "sort-by") state.sort = control.value;
          renderResults();
        });
      }
    );

    const categoryHost = $("#category-filter");
    if (categoryHost) {
      categoryHost.addEventListener("click", (event) => {
        const button = event.target.closest("[data-cat]");
        if (!button) return;
        state.cat = button.getAttribute("data-cat");
        syncControls();
        renderResults();
      });
    }

    const clearButton = $("#clear-filters");
    if (clearButton) clearButton.addEventListener("click", resetFilters);

    document.addEventListener("click", (event) => {
      if (event.target.closest('[data-action="clear-filters"]')) resetFilters();
    });
  }

  /* ==========================================================
     2. Provider detail page
     ========================================================== */

  function notFoundHtml() {
    return (
      '<div class="lsc-panel"><div class="lsc-panel__body">' +
      '<div class="lsc-empty">' +
      '<span class="lsc-empty__icon"><i data-lucide="user-x"></i></span>' +
      '<h3 class="mt-4 text-base font-semibold text-slate-900">Provider not found</h3>' +
      '<p class="mt-1 max-w-sm text-sm text-slate-500">' +
      "This profile does not exist in the demo catalogue. It may have been a stale link." +
      "</p>" +
      '<a href="services.html" class="lsc-btn lsc-btn--primary mt-5">Browse all services</a>' +
      "</div></div></div>"
    );
  }

  function ratingBreakdownHtml(provider) {
    const reviews = LSC.getReviews(provider);
    const totals = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      totals[review.rating] = (totals[review.rating] || 0) + 1;
    });

    const rows = [5, 4, 3, 2, 1]
      .map((star) => {
        const count = totals[star] || 0;
        const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
        return (
          '<div class="flex items-center gap-3 text-xs text-slate-500">' +
          '<span class="w-6 shrink-0 font-semibold text-slate-600">' +
          star +
          "★</span>" +
          '<span class="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">' +
          '<span class="block h-full rounded-full bg-amber-400" style="width:' +
          pct +
          '%"></span></span>' +
          '<span class="w-8 shrink-0 text-right">' +
          count +
          "</span></div>"
        );
      })
      .join("");

    return (
      '<div class="flex items-center gap-6">' +
      '<div class="text-center">' +
      '<p class="text-4xl font-bold tracking-tight text-slate-900">' +
      provider.rating.toFixed(1) +
      "</p>" +
      '<div class="mt-1.5">' +
      LSC.starsHtml(provider.rating) +
      "</div>" +
      '<p class="mt-1 text-xs text-slate-500">' +
      provider.reviews +
      " reviews</p>" +
      "</div>" +
      '<div class="flex-1 space-y-1.5">' +
      rows +
      "</div></div>"
    );
  }

  function reviewListHtml(provider) {
    const reviews = LSC.getReviews(provider);
    return reviews
      .map(
        (review) =>
          '<article class="border-b border-slate-100 py-5 last:border-b-0">' +
          '<div class="flex items-start justify-between gap-4">' +
          '<div class="flex items-center gap-3">' +
          '<span class="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">' +
          LSC.getInitials(review.author) +
          "</span>" +
          "<div>" +
          '<p class="text-sm font-semibold text-slate-900">' +
          LSC.escapeHtml(review.author) +
          "</p>" +
          '<p class="text-xs text-slate-500">' +
          LSC.escapeHtml(review.service) +
          " · " +
          LSC.escapeHtml(review.date) +
          "</p>" +
          "</div></div>" +
          '<span class="lsc-badge lsc-badge--amber">' +
          review.rating +
          ".0 ★</span>" +
          "</div>" +
          '<p class="mt-3 text-sm leading-relaxed text-slate-600">' +
          LSC.escapeHtml(review.text) +
          "</p>" +
          "</article>"
      )
      .join("");
  }

  function relatedProvidersHtml(provider) {
    const sameCategory = LSC.PROVIDERS.filter(
      (item) => item.category === provider.category && item.id !== provider.id
    );
    const others = LSC.PROVIDERS.filter(
      (item) => item.id !== provider.id && item.category !== provider.category
    ).sort((a, b) => b.rating - a.rating);

    const related = sameCategory.concat(others).slice(0, 3);
    return related.map(LSC.providerCardHtml).join("");
  }

  function requestModalHtml(provider) {
    const user = LSC.getUser();
    const serviceOptions = provider.services
      .map(
        (service) =>
          '<option value="' +
          LSC.escapeHtml(service.name) +
          '">' +
          LSC.escapeHtml(service.name) +
          " — " +
          LSC.formatPrice(service.price) +
          "</option>"
      )
      .join("");

    const timeOptions = LSC.TIME_SLOTS.map(
      (slot) => '<option value="' + slot + '">' + slot + "</option>"
    ).join("");

    return (
      '<div class="lsc-modal hidden" data-modal="request" role="dialog" aria-modal="true" aria-labelledby="request-title">' +
      '<div class="lsc-modal__backdrop" data-modal-close></div>' +
      '<div class="lsc-modal__scroller" data-modal-close>' +
      '<div class="lsc-modal__panel" data-modal-surface>' +
      '<div class="flex items-start justify-between gap-4">' +
      "<div>" +
      '<span class="lsc-eyebrow">Service request</span>' +
      '<h2 id="request-title" class="mt-2 text-xl font-bold tracking-tight text-slate-900">Request ' +
      LSC.escapeHtml(provider.name) +
      "</h2>" +
      '<p class="mt-1 text-sm text-slate-500">Demo request — it is stored in your browser only.</p>' +
      "</div>" +
      '<button type="button" class="lsc-modal__close" data-modal-close aria-label="Close dialog"><i data-lucide="x"></i></button>' +
      "</div>" +

      '<form id="request-form" class="mt-6 space-y-4" novalidate>' +
      '<div class="lsc-field">' +
      '<label class="lsc-label" for="request-service">Service</label>' +
      '<select id="request-service" class="lsc-input" data-autofocus>' +
      '<option value="">Select a service</option>' +
      serviceOptions +
      "</select>" +
      '<p class="lsc-error" id="request-service-error" hidden></p>' +
      "</div>" +

      '<div class="grid gap-4 sm:grid-cols-2">' +
      '<div class="lsc-field">' +
      '<label class="lsc-label" for="request-date">Preferred date</label>' +
      '<input id="request-date" type="date" class="lsc-input" min="' +
      LSC.todayIso() +
      '">' +
      '<p class="lsc-error" id="request-date-error" hidden></p>' +
      "</div>" +
      '<div class="lsc-field">' +
      '<label class="lsc-label" for="request-time">Preferred time</label>' +
      '<select id="request-time" class="lsc-input">' +
      '<option value="">Select a time</option>' +
      timeOptions +
      "</select>" +
      '<p class="lsc-error" id="request-time-error" hidden></p>' +
      "</div>" +
      "</div>" +

      '<div class="lsc-field">' +
      '<label class="lsc-label" for="request-description">Description</label>' +
      '<textarea id="request-description" class="lsc-input" placeholder="Describe what you need done, including any model numbers or access details."></textarea>' +
      '<p class="lsc-error" id="request-description-error" hidden></p>' +
      "</div>" +

      '<div class="lsc-field">' +
      '<label class="lsc-label" for="request-phone">Phone number</label>' +
      '<input id="request-phone" type="tel" class="lsc-input" placeholder="+251 9XX XXX XXX" value="' +
      LSC.escapeHtml(user && user.phone ? user.phone : "") +
      '">' +
      '<p class="lsc-error" id="request-phone-error" hidden></p>' +
      "</div>" +

      '<button type="submit" class="lsc-btn lsc-btn--primary lsc-btn--block">Submit request</button>' +
      "</form>" +
      "</div></div></div>"
    );
  }

  function wireRequestForm(provider) {
    const form = $("#request-form");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      LSC.clearFormErrors(form);

      const service = $("#request-service").value;
      const date = $("#request-date").value;
      const time = $("#request-time").value;
      const description = $("#request-description").value.trim();
      const phone = $("#request-phone").value.trim();
      let valid = true;

      if (!service) {
        LSC.setFieldError("request-service", "Please choose a service.");
        valid = false;
      }
      if (!date) {
        LSC.setFieldError("request-date", "Choose your preferred date.");
        valid = false;
      } else if (date < LSC.todayIso()) {
        LSC.setFieldError("request-date", "The date cannot be in the past.");
        valid = false;
      }
      if (!time) {
        LSC.setFieldError("request-time", "Choose a preferred time slot.");
        valid = false;
      }
      if (description.length < 10) {
        LSC.setFieldError("request-description", "Please add at least 10 characters of detail.");
        valid = false;
      }
      if (!LSC.isValidPhone(phone)) {
        LSC.setFieldError("request-phone", "Enter a valid phone number (9+ digits).");
        valid = false;
      }
      if (!valid) return;

      const submit = form.querySelector('button[type="submit"]');
      LSC.setButtonLoading(submit, "Sending request");

      window.setTimeout(() => {
        const user = LSC.getUser();
        const selectedService = provider.services.find((entry) => entry.name === service);
        const requestId = "REQ-" + Date.now().toString(36).toUpperCase();

        const request = {
          id: requestId,
          providerId: provider.id,
          providerName: provider.name,
          providerAvatar: provider.avatar,
          category: provider.category,
          location: provider.location,
          service: service,
          price: selectedService ? selectedService.price : provider.price,
          date: date,
          time: time,
          description: description,
          phone: phone,
          customer: user ? user.name : "Guest Customer",
          status: "Pending",
          createdAt: new Date().toISOString(),
          demo: true
        };

        const saved = LSC.store.get(LSC.KEYS.requests, []);
        const requestList = Array.isArray(saved) ? saved : [];
        requestList.unshift(request);
        LSC.store.set(LSC.KEYS.requests, requestList);

        const queueKey = LSC.KEYS.providerRequests;
        const queueSaved = LSC.store.get(queueKey, []);
        const queue = Array.isArray(queueSaved) ? queueSaved : [];
        queue.unshift({
          id: requestId,
          customer: request.customer,
          service: service,
          date: date,
          time: time,
          amount: request.price,
          status: "Pending",
          createdAt: request.createdAt
        });
        LSC.store.set(queueKey, queue);

        LSC.clearButtonLoading(submit);
        form.reset();
        LSC.closeModal("request");
        LSC.toast(
          "Request sent to " + provider.name + ". Reference " + requestId + ".",
          "success"
        );
        document.dispatchEvent(new CustomEvent("lsc:request-created", { detail: request }));
      }, 800);
    });
  }

  function renderProvider(provider) {
    const root = $("#provider-root");
    if (!root) return;

    const badges = provider.badges
      .map((badge) => {
        const style =
          badge === "Available Today"
            ? "lsc-badge--green"
            : badge === "Top Rated"
            ? "lsc-badge--amber"
            : "lsc-badge--brand";
        return '<span class="lsc-badge ' + style + '">' + LSC.escapeHtml(badge) + "</span>";
      })
      .join("");

    const services = provider.services
      .map(
        (service) =>
          '<div class="service-line">' +
          "<div>" +
          '<p class="text-sm font-semibold text-slate-900">' +
          LSC.escapeHtml(service.name) +
          "</p>" +
          '<p class="mt-0.5 text-xs text-slate-500">Typical duration: ' +
          LSC.escapeHtml(service.duration) +
          "</p>" +
          "</div>" +
          '<div class="flex items-center gap-4">' +
          '<span class="text-sm font-semibold text-slate-900">' +
          LSC.formatPrice(service.price) +
          "</span>" +
          '<button type="button" class="lsc-btn lsc-btn--soft lsc-btn--sm" data-action="request-service">Book</button>' +
          "</div></div>"
      )
      .join("");

    const hours = provider.hours
      .map(
        (entry) =>
          '<div class="hour-line">' +
          '<span class="' +
          (entry.hours === "Closed" ? "text-slate-400" : "text-slate-600") +
          '">' +
          entry.day +
          "</span>" +
          '<span class="' +
          (entry.hours === "Closed" ? "font-medium text-slate-400" : "font-semibold text-slate-800") +
          '">' +
          entry.hours +
          "</span></div>"
      )
      .join("");

    root.innerHTML =
      /* --- profile header --- */
      '<div class="provider-header-card">' +
      '<div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">' +
      '<div class="flex flex-col gap-5 sm:flex-row sm:items-start">' +
      '<img src="' +
      provider.avatar +
      '" alt="" width="88" height="88" class="lsc-avatar h-20 w-20 shrink-0">' +
      "<div>" +
      '<div class="flex flex-wrap items-center gap-2">' +
      '<h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">' +
      LSC.escapeHtml(provider.name) +
      "</h1>" +
      (provider.verified
        ? '<i data-lucide="badge-check" class="h-5 w-5 text-brand-600" aria-label="Verified provider"></i>'
        : "") +
      "</div>" +
      '<p class="mt-1 text-sm font-medium text-slate-600">' +
      LSC.escapeHtml(provider.category) +
      " · " +
      LSC.escapeHtml(provider.location) +
      "</p>" +
      '<div class="mt-3 flex flex-wrap items-center gap-2">' +
      badges +
      "</div>" +
      '<div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">' +
      LSC.ratingHtml(provider.rating, provider.reviews) +
      '<span class="inline-flex items-center gap-1.5"><i data-lucide="briefcase" class="h-4 w-4 text-slate-400"></i>' +
      provider.jobs +
      "+ jobs completed</span>" +
      '<span class="inline-flex items-center gap-1.5"><i data-lucide="calendar" class="h-4 w-4 text-slate-400"></i>Since ' +
      provider.since +
      "</span>" +
      "</div></div></div>" +

      '<div class="flex flex-col gap-3 lg:min-w-[15rem] lg:items-end">' +
      '<div class="rounded-xl bg-slate-50 px-4 py-3 text-left lg:text-right">' +
      '<p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Starting at</p>' +
      '<p class="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">' +
      LSC.formatPrice(provider.price) +
      "</p></div>" +
      '<div class="flex w-full flex-wrap gap-2 lg:justify-end">' +
      '<button type="button" class="lsc-btn lsc-btn--primary flex-1 lg:flex-none" data-action="request-service">' +
      '<i data-lucide="calendar-check" class="h-4 w-4"></i>Request service</button>' +
      '<button type="button" class="lsc-btn lsc-btn--secondary" data-action="favorite" data-id="' +
      provider.id +
      '" data-label="' +
      LSC.escapeHtml(provider.name) +
      '" aria-pressed="' +
      LSC.isFavorite(provider.id) +
      '">' +
      '<i data-lucide="heart" class="h-4 w-4"></i>Save</button>' +
      '<button type="button" class="lsc-btn lsc-btn--ghost" data-action="share-provider" aria-label="Copy profile link">' +
      '<i data-lucide="share-2" class="h-4 w-4"></i></button>' +
      "</div></div></div></div>" +

      /* --- body --- */
      '<div class="mt-6 grid gap-6 lg:grid-cols-3">' +
      '<div class="space-y-6 lg:col-span-2">' +

      '<section class="lsc-panel"><div class="lsc-panel__head"><h2 class="lsc-panel__title">About ' +
      LSC.escapeHtml(provider.name) +
      "</h2></div>" +
      '<div class="lsc-panel__body"><p class="text-sm leading-relaxed text-slate-600">' +
      LSC.escapeHtml(provider.about) +
      "</p>" +
      '<div class="mt-5 grid gap-3 sm:grid-cols-3">' +
      '<div class="rounded-xl border border-slate-200 p-4"><p class="text-lg font-bold text-slate-900">' +
      provider.jobs +
      '+</p><p class="mt-0.5 text-xs text-slate-500">Jobs completed</p></div>' +
      '<div class="rounded-xl border border-slate-200 p-4"><p class="text-lg font-bold text-slate-900">' +
      provider.rating.toFixed(1) +
      '/5</p><p class="mt-0.5 text-xs text-slate-500">Average rating</p></div>' +
      '<div class="rounded-xl border border-slate-200 p-4"><p class="text-lg font-bold text-slate-900">' +
      (new Date().getFullYear() - provider.since) +
      " yrs</p><p class=\"mt-0.5 text-xs text-slate-500\">In business</p></div>" +
      "</div></div></section>" +

      '<section class="lsc-panel"><div class="lsc-panel__head"><h2 class="lsc-panel__title">Services &amp; pricing</h2>' +
      '<span class="text-xs text-slate-500">Indicative prices</span></div>' +
      '<div class="lsc-panel__body py-1">' +
      services +
      "</div></section>" +

      '<section class="lsc-panel"><div class="lsc-panel__head"><h2 class="lsc-panel__title">Customer reviews</h2>' +
      '<span class="text-xs text-slate-500">Sample reviews</span></div>' +
      '<div class="lsc-panel__body">' +
      ratingBreakdownHtml(provider) +
      '<div class="mt-6">' +
      reviewListHtml(provider) +
      "</div></div></section>" +
      "</div>" +

      /* --- sidebar --- */
      '<div class="space-y-6 lg:col-span-1">' +
      '<section class="lsc-panel"><div class="lsc-panel__head"><h2 class="lsc-panel__title">Contact information</h2></div>' +
      '<div class="lsc-panel__body space-y-4">' +
      '<div class="flex items-start gap-3"><span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600"><i data-lucide="phone" class="h-4 w-4"></i></span>' +
      '<div><p class="text-xs text-slate-500">Phone</p><p class="text-sm font-semibold text-slate-900">' +
      LSC.escapeHtml(provider.phone) +
      "</p></div></div>" +
      '<div class="flex items-start gap-3"><span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600"><i data-lucide="mail" class="h-4 w-4"></i></span>' +
      '<div class="min-w-0"><p class="text-xs text-slate-500">Email</p><p class="truncate text-sm font-semibold text-slate-900">' +
      LSC.escapeHtml(provider.email) +
      "</p></div></div>" +
      '<div class="flex items-start gap-3"><span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600"><i data-lucide="map-pin" class="h-4 w-4"></i></span>' +
      '<div><p class="text-xs text-slate-500">Service area</p><p class="text-sm font-semibold text-slate-900">' +
      LSC.escapeHtml(provider.location) +
      " &amp; nearby</p></div></div>" +
      '<div class="lsc-divider"></div>' +
      LSC.availabilityHtml(provider.available) +
      "</div></section>" +

      '<section class="lsc-panel"><div class="lsc-panel__head"><h2 class="lsc-panel__title">Working hours</h2></div>' +
      '<div class="lsc-panel__body py-2">' +
      hours +
      "</div></section>" +

      '<section class="rounded-2xl bg-navy-900 p-6 text-center">' +
      '<span class="lsc-eyebrow text-brand-400">Ready to get started?</span>' +
      '<p class="mt-3 text-sm text-slate-300">Send a request with your preferred date and time — it takes under a minute.</p>' +
      '<button type="button" class="lsc-btn lsc-btn--primary lsc-btn--block mt-5" data-action="request-service">Request service</button>' +
      "</section>" +
      "</div></div>";

    LSC.refreshIcons();
  }

  function wireProviderPage() {
    const root = $("#provider-root");
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const provider = LSC.getProvider(params.get("id"));

    if (!provider) {
      root.innerHTML = notFoundHtml();
      LSC.refreshIcons();
      return;
    }

    document.title = provider.name + " — " + provider.category + " | Local Service Connector";
    renderProvider(provider);

    const relatedRoot = $("#related-providers");
    if (relatedRoot) {
      relatedRoot.innerHTML = relatedProvidersHtml(provider);
    }

    const modalRoot = $("#modal-root");
    if (modalRoot && !document.querySelector('[data-modal="request"]')) {
      modalRoot.insertAdjacentHTML("beforeend", requestModalHtml(provider));
      LSC.refreshIcons();
      wireRequestForm(provider);
    }

    document.addEventListener("click", (event) => {
      if (event.target.closest('[data-action="request-service"]')) {
        LSC.openModal("request");
        return;
      }

      if (event.target.closest('[data-action="share-provider"]')) {
        const url = window.location.href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText(url)
            .then(() => LSC.toast("Profile link copied to your clipboard.", "success"))
            .catch(() => LSC.toast("Could not copy the link — please copy it from the address bar.", "error"));
        } else {
          LSC.toast("Copy the link from your address bar to share this profile.", "info");
        }
      }
    });

    const crumb = $("#provider-crumb");
    if (crumb) crumb.textContent = provider.name;
  }

  /* ==========================================================
     3. Boot
     ========================================================== */

  function init() {
    wireServicesPage();
    wireProviderPage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
