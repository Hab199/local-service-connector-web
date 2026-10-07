/* ============================================================
   Local Service Connector — Mock Data Layer
   ------------------------------------------------------------
   All content in this file is demo data used to power the
   frontend prototype. No backend or database is involved.
   ============================================================ */

window.LSC = window.LSC || {};

(function (LSC) {
  "use strict";

  /* ----------------------------------------------------------
     1. Service categories
     ---------------------------------------------------------- */

  const CATEGORIES = [
    {
      id: "plumbing",
      name: "Plumbing",
      icon: "wrench",
      popular: true,
      description: "Leak repairs, pipe fitting, and emergency call-outs."
    },
    {
      id: "electrical",
      name: "Electrical",
      icon: "zap",
      popular: true,
      description: "Safe wiring, fixtures, and fault finding."
    },
    {
      id: "computer-repair",
      name: "Computer Repair",
      icon: "laptop",
      popular: true,
      description: "Laptop and desktop diagnostics and tune-ups."
    },
    {
      id: "phone-repair",
      name: "Phone Repair",
      icon: "smartphone",
      popular: true,
      description: "Screen, battery, and software fixes."
    },
    {
      id: "cleaning",
      name: "Cleaning",
      icon: "sparkles",
      popular: true,
      description: "Homes, offices, and move-in deep cleans."
    },
    {
      id: "tutoring",
      name: "Tutoring",
      icon: "graduation-cap",
      popular: true,
      description: "Private lessons and exam preparation."
    },
    {
      id: "mechanics",
      name: "Mechanics",
      icon: "car",
      popular: true,
      description: "Vehicle servicing, diagnostics, and repairs."
    },
    {
      id: "graphic-design",
      name: "Graphic Design",
      icon: "palette",
      popular: true,
      description: "Logos, branding, and marketing visuals."
    },
    {
      id: "barbers",
      name: "Barbers",
      icon: "scissors",
      popular: false,
      description: "Precision cuts, fades, and grooming."
    },
    {
      id: "tailoring",
      name: "Tailoring",
      icon: "shirt",
      popular: false,
      description: "Custom garments, alterations, and repairs."
    },
    {
      id: "photography",
      name: "Photography",
      icon: "camera",
      popular: false,
      description: "Events, portraits, and product photography."
    }
  ];

  const LOCATIONS = [
    "Addis Ababa",
    "Dire Dawa",
    "Bahir Dar",
    "Hawassa",
    "Mekelle",
    "Adama",
    "Gondar",
    "Jimma"
  ];

  /* ----------------------------------------------------------
     2. Per-category content (tagline, about, price list)
     ---------------------------------------------------------- */

  const CATEGORY_DETAILS = {
    Plumbing: {
      tagline: "Leak repairs, pipe fitting, and 24/7 emergency plumbing.",
      about:
        "Certified plumbers who handle everything from a dripping tap to full bathroom installations for homes, offices, and hotels.",
      services: [
        { name: "General plumbing inspection", price: 250, duration: "45 min" },
        { name: "Leak detection & repair", price: 400, duration: "1–2 hrs" },
        { name: "Pipe fitting & replacement", price: 600, duration: "2–3 hrs" },
        { name: "Emergency plumbing call-out", price: 800, duration: "Same day" },
        { name: "Water heater installation", price: 1500, duration: "3–4 hrs" }
      ]
    },
    Electrical: {
      tagline: "Safe wiring, installations, and electrical fault finding.",
      about:
        "Licensed electricians delivering residential and commercial wiring, fixture installation, and rapid fault diagnosis with safety-first practices.",
      services: [
        { name: "Electrical safety check", price: 300, duration: "1 hr" },
        { name: "Fault finding & repair", price: 500, duration: "1–2 hrs" },
        { name: "Light & fixture installation", price: 450, duration: "1–2 hrs" },
        { name: "House wiring project", price: 3500, duration: "2–4 days" },
        { name: "Generator installation", price: 2500, duration: "1 day" }
      ]
    },
    "Computer Repair": {
      tagline: "Laptop and desktop diagnostics, repair, and tune-ups.",
      about:
        "A workshop team that diagnoses hardware and software faults, recovers data, and gets machines back to work with genuine parts.",
      services: [
        { name: "Diagnostic & repair quote", price: 200, duration: "30 min" },
        { name: "Operating system installation", price: 400, duration: "1–2 hrs" },
        { name: "Virus & malware removal", price: 450, duration: "1–3 hrs" },
        { name: "Hardware upgrade (RAM/SSD)", price: 1200, duration: "1 hr" },
        { name: "Data recovery", price: 900, duration: "1–2 days" }
      ]
    },
    "Phone Repair": {
      tagline: "Screen replacements, battery swaps, and water damage recovery.",
      about:
        "Same-day phone repairs using quality replacement parts, with a workmanship warranty on every screen and battery we fit.",
      services: [
        { name: "Screen replacement", price: 1200, duration: "1 hr" },
        { name: "Battery replacement", price: 700, duration: "45 min" },
        { name: "Charging port repair", price: 600, duration: "1 hr" },
        { name: "Software & OS fix", price: 350, duration: "1–2 hrs" },
        { name: "Water damage recovery", price: 800, duration: "24 hrs" }
      ]
    },
    Cleaning: {
      tagline: "Deep cleaning for homes, offices, and move-in spaces.",
      about:
        "Insured cleaning crews with their own equipment and eco-friendly products, available for one-off deep cleans or recurring visits.",
      services: [
        { name: "Standard home cleaning", price: 600, duration: "3 hrs" },
        { name: "Deep cleaning", price: 1500, duration: "6 hrs" },
        { name: "Office cleaning", price: 1200, duration: "4 hrs" },
        { name: "Move-in / move-out clean", price: 1800, duration: "6 hrs" },
        { name: "Sofa & carpet shampoo", price: 900, duration: "2–3 hrs" }
      ]
    },
    Tutoring: {
      tagline: "Private lessons in math, science, and exam prep.",
      about:
        "Experienced tutors who build a personal study plan for every learner, from primary school support to university entrance preparation.",
      services: [
        { name: "Single tutoring session", price: 350, duration: "1 hr" },
        { name: "Weekly tutoring package", price: 1400, duration: "4 sessions" },
        { name: "Exam preparation course", price: 2500, duration: "3 weeks" },
        { name: "Homework support plan", price: 1000, duration: "Monthly" },
        { name: "Group study session", price: 600, duration: "2 hrs" }
      ]
    },
    Mechanics: {
      tagline: "Diagnostics, servicing, and engine repair for all vehicles.",
      about:
        "A full-service garage covering routine maintenance, brake and suspension work, and engine diagnostics for cars, vans, and pickups.",
      services: [
        { name: "Vehicle diagnostics", price: 500, duration: "1 hr" },
        { name: "Routine service & oil change", price: 1800, duration: "2 hrs" },
        { name: "Brake repair", price: 2200, duration: "3 hrs" },
        { name: "Engine repair", price: 5500, duration: "2–5 days" },
        { name: "AC servicing", price: 1600, duration: "2 hrs" }
      ]
    },
    "Graphic Design": {
      tagline: "Logos, brand identities, and marketing visuals.",
      about:
        "A creative studio producing logos, brand systems, social media artwork, and print-ready collateral for startups and established businesses.",
      services: [
        { name: "Logo design", price: 2500, duration: "5 days" },
        { name: "Social media kit", price: 1800, duration: "3 days" },
        { name: "Business card & stationery", price: 900, duration: "2 days" },
        { name: "Flyer / poster design", price: 700, duration: "2 days" },
        { name: "Brand identity package", price: 6500, duration: "2 weeks" }
      ]
    },
    Barbers: {
      tagline: "Precision cuts, fades, and grooming.",
      about:
        "Barbers who specialise in classic cuts, skin fades, and beard sculpting, with walk-in availability and online booking.",
      services: [
        { name: "Classic haircut", price: 250, duration: "40 min" },
        { name: "Skin fade", price: 350, duration: "50 min" },
        { name: "Beard trim & shape", price: 200, duration: "30 min" },
        { name: "Hot towel shave", price: 300, duration: "40 min" },
        { name: "Kids' haircut", price: 200, duration: "30 min" }
      ]
    },
    Tailoring: {
      tagline: "Custom garments, alterations, and repairs.",
      about:
        "Tailors offering made-to-measure clothing, traditional wear, and fast alterations with a free first fitting.",
      services: [
        { name: "Trouser hem & alteration", price: 300, duration: "2 days" },
        { name: "Shirt tailoring", price: 800, duration: "4 days" },
        { name: "Custom suit", price: 4500, duration: "2 weeks" },
        { name: "Traditional dress", price: 3500, duration: "10 days" },
        { name: "Zipper & minor repair", price: 250, duration: "Same day" }
      ]
    },
    Photography: {
      tagline: "Events, portraits, and product photography.",
      about:
        "Photographers covering weddings, corporate events, family portraits, and product shoots with same-week edited gallery delivery.",
      services: [
        { name: "Portrait session", price: 2000, duration: "1 hr" },
        { name: "Event coverage", price: 5000, duration: "Full day" },
        { name: "Product photography", price: 3000, duration: "Half day" },
        { name: "Family session", price: 2500, duration: "2 hrs" },
        { name: "Photo editing pack", price: 1200, duration: "3 days" }
      ]
    }
  };

  /* ----------------------------------------------------------
     3. Working hour templates
     ---------------------------------------------------------- */

  const HOUR_SETS = {
    standard: [
      { day: "Monday", hours: "8:00 AM – 6:00 PM" },
      { day: "Tuesday", hours: "8:00 AM – 6:00 PM" },
      { day: "Wednesday", hours: "8:00 AM – 6:00 PM" },
      { day: "Thursday", hours: "8:00 AM – 6:00 PM" },
      { day: "Friday", hours: "8:00 AM – 6:00 PM" },
      { day: "Saturday", hours: "9:00 AM – 4:00 PM" },
      { day: "Sunday", hours: "Closed" }
    ],
    extended: [
      { day: "Monday", hours: "7:30 AM – 7:00 PM" },
      { day: "Tuesday", hours: "7:30 AM – 7:00 PM" },
      { day: "Wednesday", hours: "7:30 AM – 7:00 PM" },
      { day: "Thursday", hours: "7:30 AM – 7:00 PM" },
      { day: "Friday", hours: "7:30 AM – 7:00 PM" },
      { day: "Saturday", hours: "7:30 AM – 7:00 PM" },
      { day: "Sunday", hours: "10:00 AM – 4:00 PM" }
    ],
    evening: [
      { day: "Monday", hours: "Closed" },
      { day: "Tuesday", hours: "10:00 AM – 7:00 PM" },
      { day: "Wednesday", hours: "10:00 AM – 7:00 PM" },
      { day: "Thursday", hours: "10:00 AM – 7:00 PM" },
      { day: "Friday", hours: "10:00 AM – 7:00 PM" },
      { day: "Saturday", hours: "10:00 AM – 7:00 PM" },
      { day: "Sunday", hours: "12:00 PM – 6:00 PM" }
    ]
  };

  /* ----------------------------------------------------------
     4. Providers
     ---------------------------------------------------------- */

  const RAW_PROVIDERS = [
    { id: 1, name: "Abebe Tech Solutions", category: "Computer Repair", location: "Dire Dawa", rating: 4.9, reviews: 127, price: 300, available: true, since: 2016, hours: "standard" },
    { id: 2, name: "Addis Computech", category: "Computer Repair", location: "Addis Ababa", rating: 4.7, reviews: 214, price: 350, available: true, since: 2014, hours: "extended" },
    { id: 3, name: "Blue Nile PC Care", category: "Computer Repair", location: "Bahir Dar", rating: 4.6, reviews: 86, price: 280, available: false, since: 2018, hours: "standard" },
    { id: 4, name: "Hawassa Laptop Lab", category: "Computer Repair", location: "Hawassa", rating: 4.4, reviews: 62, price: 250, available: true, since: 2019, hours: "standard" },

    { id: 5, name: "Mobile Fix Center", category: "Phone Repair", location: "Addis Ababa", rating: 4.8, reviews: 312, price: 350, available: true, since: 2015, hours: "extended" },
    { id: 6, name: "Pixel Phone Works", category: "Phone Repair", location: "Adama", rating: 4.6, reviews: 98, price: 300, available: true, since: 2017, hours: "standard" },
    { id: 7, name: "Smartphone Care Ethiopia", category: "Phone Repair", location: "Mekelle", rating: 4.5, reviews: 143, price: 320, available: false, since: 2016, hours: "standard" },
    { id: 8, name: "QuickScreen Repairs", category: "Phone Repair", location: "Jimma", rating: 4.2, reviews: 54, price: 280, available: true, since: 2020, hours: "evening" },

    { id: 9, name: "Tana Plumbing Works", category: "Plumbing", location: "Bahir Dar", rating: 4.8, reviews: 76, price: 250, available: true, since: 2013, hours: "standard" },
    { id: 10, name: "Reliable Pipes & Plumbing", category: "Plumbing", location: "Addis Ababa", rating: 4.7, reviews: 189, price: 300, available: true, since: 2012, hours: "extended" },
    { id: 11, name: "Hawassa Flow Plumbing", category: "Plumbing", location: "Hawassa", rating: 4.3, reviews: 48, price: 220, available: false, since: 2019, hours: "standard" },

    { id: 12, name: "Volt & Current Electric", category: "Electrical", location: "Addis Ababa", rating: 4.9, reviews: 201, price: 300, available: true, since: 2011, hours: "standard" },
    { id: 13, name: "Gondar Electric Services", category: "Electrical", location: "Gondar", rating: 4.5, reviews: 67, price: 260, available: true, since: 2018, hours: "standard" },
    { id: 14, name: "Sunrise Electrical", category: "Electrical", location: "Adama", rating: 4.2, reviews: 39, price: 240, available: false, since: 2020, hours: "evening" },

    { id: 15, name: "FreshSpace Cleaning Co.", category: "Cleaning", location: "Addis Ababa", rating: 4.8, reviews: 167, price: 600, available: true, since: 2017, hours: "extended" },
    { id: 16, name: "Sparkle Home Services", category: "Cleaning", location: "Hawassa", rating: 4.6, reviews: 74, price: 550, available: true, since: 2019, hours: "standard" },
    { id: 17, name: "Mekelle Clean Pros", category: "Cleaning", location: "Mekelle", rating: 4.4, reviews: 52, price: 500, available: false, since: 2020, hours: "standard" },

    { id: 18, name: "MindEdge Tutors", category: "Tutoring", location: "Addis Ababa", rating: 4.9, reviews: 118, price: 350, available: true, since: 2016, hours: "evening" },
    { id: 19, name: "Chemayalem Learning Centre", category: "Tutoring", location: "Bahir Dar", rating: 4.7, reviews: 91, price: 300, available: true, since: 2015, hours: "standard" },
    { id: 20, name: "Gondar Study Hub", category: "Tutoring", location: "Gondar", rating: 4.5, reviews: 45, price: 280, available: false, since: 2021, hours: "evening" },

    { id: 21, name: "Nile Auto Garage", category: "Mechanics", location: "Addis Ababa", rating: 4.7, reviews: 236, price: 500, available: true, since: 2010, hours: "standard" },
    { id: 22, name: "Dire Dawa Motor Works", category: "Mechanics", location: "Dire Dawa", rating: 4.5, reviews: 129, price: 450, available: true, since: 2014, hours: "standard" },
    { id: 23, name: "Ras Auto Clinic", category: "Mechanics", location: "Mekelle", rating: 4.3, reviews: 71, price: 400, available: false, since: 2018, hours: "standard" },

    { id: 24, name: "Tesfa Creative Studio", category: "Graphic Design", location: "Addis Ababa", rating: 4.9, reviews: 96, price: 900, available: true, since: 2017, hours: "evening" },
    { id: 25, name: "Inkwell Designs", category: "Graphic Design", location: "Hawassa", rating: 4.6, reviews: 58, price: 750, available: true, since: 2019, hours: "evening" },
    { id: 26, name: "Bahir Dar Brand Lab", category: "Graphic Design", location: "Bahir Dar", rating: 4.4, reviews: 34, price: 700, available: false, since: 2021, hours: "evening" },

    { id: 27, name: "Crown & Blade Barbers", category: "Barbers", location: "Addis Ababa", rating: 4.8, reviews: 264, price: 150, available: true, since: 2016, hours: "extended" },
    { id: 28, name: "Jimma Style Studio", category: "Barbers", location: "Jimma", rating: 4.5, reviews: 83, price: 120, available: true, since: 2019, hours: "standard" },

    { id: 29, name: "Sew Fine Tailors", category: "Tailoring", location: "Addis Ababa", rating: 4.7, reviews: 112, price: 400, available: true, since: 2013, hours: "standard" },
    { id: 30, name: "Adama Fashion House", category: "Tailoring", location: "Adama", rating: 4.4, reviews: 65, price: 380, available: false, since: 2018, hours: "standard" },

    { id: 31, name: "Lens & Light Studios", category: "Photography", location: "Addis Ababa", rating: 4.9, reviews: 141, price: 1500, available: true, since: 2015, hours: "evening" },
    { id: 32, name: "Blue Nile Photography", category: "Photography", location: "Bahir Dar", rating: 4.6, reviews: 79, price: 1400, available: true, since: 2017, hours: "evening" }
  ];

  function slugify(value) {
    return String(value)
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function buildPhone(id) {
    const digits = String(((id * 8675309) % 80000000) + 10000000);
    return "+251 9" + digits.slice(0, 2) + " " + digits.slice(2, 5) + " " + digits.slice(5, 8);
  }

  function buildAbout(provider, details) {
    const years = new Date().getFullYear() - provider.since;
    const jobs = Math.round(provider.reviews * 1.7);
    return (
      details.about +
      " Operating from " +
      provider.location +
      " since " +
      provider.since +
      ", the team has completed " +
      jobs +
      "+ jobs over " +
      years +
      " years and maintains a " +
      provider.rating.toFixed(1) +
      "-star rating from " +
      provider.reviews +
      " verified customer reviews."
    );
  }

  function hydrate(provider) {
    const details = CATEGORY_DETAILS[provider.category];
    const jobs = Math.round(provider.reviews * 1.7);
    const badges = [];
    if (provider.rating >= 4.8) badges.push("Top Rated");
    if (provider.rating >= 4.4) badges.push("Verified");
    if (provider.available) badges.push("Available Today");

    return {
      id: provider.id,
      name: provider.name,
      slug: slugify(provider.name),
      category: provider.category,
      location: provider.location,
      rating: provider.rating,
      reviews: provider.reviews,
      price: provider.price,
      available: provider.available,
      since: provider.since,
      jobs: jobs,
      verified: provider.rating >= 4.4,
      badges: badges,
      tagline: details.tagline,
      about: buildAbout(provider, details),
      services: details.services,
      hours: HOUR_SETS[provider.hours || "standard"],
      phone: buildPhone(provider.id),
      email: slugify(provider.name) + "@example.com",
      avatar: ""
    };
  }

  const PROVIDERS = RAW_PROVIDERS.map(hydrate);

  /* ----------------------------------------------------------
     5. Customer reviews (generated deterministically)
     ---------------------------------------------------------- */

  const REVIEWER_NAMES = [
    "Selamawit T.", "Dawit G.", "Meron A.", "Yonas K.", "Hana M.", "Biniam S.",
    "Rahel D.", "Nebiyu F.", "Lidiya A.", "Kalkidan B.", "Solomon T.", "Eden H.",
    "Mikiyas J.", "Sara N.", "Abel W.", "Tigist H."
  ];

  const REVIEW_TEXTS = [
    "Booked in the morning and the work was finished the same afternoon. Clear pricing and very professional.",
    "Arrived on time, explained the problem in plain language, and left everything tidy. Highly recommended.",
    "Quick response through the platform and the final price matched the quote. Would use again.",
    "Friendly team, solid workmanship, and they followed up after the job to make sure everything was fine.",
    "The best experience I have had with this service. Fast, clean, and fairly priced for the quality.",
    "Good communication from start to finish. They showed me what was wrong before starting any work.",
    "Handled a tricky issue that two other places could not fix. Worth every birr.",
    "Professional and patient with all of my questions. The result looks better than I expected.",
    "Service was fine overall. They were a little late but called ahead to let me know.",
    "Solid work at a fair price. Nothing fancy, but the job was done properly and on schedule.",
    "Very organised — I got a written quote, a clear timeline, and updates while the work was in progress.",
    "They took real care with my belongings and cleaned up completely before leaving.",
    "Easy booking, transparent charges, and the technician was clearly experienced.",
    "Happy with the result. I would have liked a faster reply the first time, but once we connected everything went smoothly."
  ];

  const REVIEW_DATES = [
    "5 days ago", "1 week ago", "2 weeks ago", "3 weeks ago", "1 month ago",
    "6 weeks ago", "2 months ago", "3 months ago"
  ];

  function buildReviews(provider) {
    const count = 3 + (provider.id % 2);
    const list = [];
    for (let i = 0; i < count; i += 1) {
      const seed = provider.id * 7 + i * 5;
      const ratingPattern = [5, 5, 4, 5, 4, 5, 3, 5];
      list.push({
        author: REVIEWER_NAMES[seed % REVIEWER_NAMES.length],
        rating: ratingPattern[(seed + i) % ratingPattern.length],
        date: REVIEW_DATES[(seed + i * 3) % REVIEW_DATES.length],
        service: provider.services[(provider.id + i) % provider.services.length].name,
        text: REVIEW_TEXTS[(seed + i * 2) % REVIEW_TEXTS.length]
      });
    }
    return list;
  }

  /* ----------------------------------------------------------
     6. Platform statistics (demo figures)
     ---------------------------------------------------------- */

  const PLATFORM_STATS = [
    { value: "500+", label: "Service Providers", icon: "users" },
    { value: "1,200+", label: "Services Completed", icon: "circle-check" },
    { value: "4.8/5", label: "Average Rating", icon: "star" },
    { value: "10+", label: "Service Categories", icon: "layout-grid" }
  ];

  const TIME_SLOTS = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  /* ----------------------------------------------------------
     7. Helpers
     ---------------------------------------------------------- */

  const AVATAR_COLORS = ["#2563EB", "#1E40AF", "#0E7490", "#4338CA", "#B45309", "#047857", "#BE123C", "#6D28D9"];

  function initialsAvatar(name) {
    const initials = String(name)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (word) { return word.charAt(0).toUpperCase(); })
      .join("");
    let sum = 0;
    for (let i = 0; i < name.length; i += 1) sum += name.charCodeAt(i);
    const bg = AVATAR_COLORS[sum % AVATAR_COLORS.length];
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">' +
      '<rect width="120" height="120" rx="60" fill="' + bg + '"/>' +
      '<text x="60" y="61" fill="#FFFFFF" font-family="Inter, Arial, sans-serif" ' +
      'font-size="44" font-weight="600" text-anchor="middle" dominant-baseline="central">' +
      initials +
      "</text></svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  function getProvider(id) {
    const numeric = Number(id);
    return PROVIDERS.find(function (provider) { return provider.id === numeric; }) || null;
  }

  function getProvidersByCategory(categoryName) {
    return PROVIDERS.filter(function (provider) { return provider.category === categoryName; });
  }

  function getCategory(name) {
    return CATEGORIES.find(function (category) { return category.name === name; }) || null;
  }

  function getPopularCategories() {
    return CATEGORIES.filter(function (category) { return category.popular; });
  }

  function categoryCounts() {
    return CATEGORIES.map(function (category) {
      return Object.assign({}, category, {
        count: getProvidersByCategory(category.name).length
      });
    });
  }

  function locationCounts() {
    return LOCATIONS.map(function (location) {
      return {
        name: location,
        count: PROVIDERS.filter(function (provider) { return provider.location === location; }).length
      };
    });
  }

  function getTopRated(limit) {
    return PROVIDERS.slice()
      .sort(function (a, b) {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviews - a.reviews;
      })
      .slice(0, limit || 6);
  }

  LSC.CATEGORIES = CATEGORIES;
  LSC.CATEGORY_DETAILS = CATEGORY_DETAILS;
  LSC.LOCATIONS = LOCATIONS;
  LSC.PROVIDERS = PROVIDERS;
  LSC.PLATFORM_STATS = PLATFORM_STATS;
  LSC.TIME_SLOTS = TIME_SLOTS;
  LSC.REVIEW_DATES = REVIEW_DATES;

  LSC.getProvider = getProvider;
  LSC.getProvidersByCategory = getProvidersByCategory;
  LSC.getCategory = getCategory;
  LSC.getPopularCategories = getPopularCategories;
  LSC.categoryCounts = categoryCounts;
  LSC.locationCounts = locationCounts;
  LSC.getTopRated = getTopRated;
  LSC.getReviews = buildReviews;
  LSC.initialsAvatar = initialsAvatar;
  LSC.slugify = slugify;

  PROVIDERS.forEach(function (provider) {
    provider.avatar = initialsAvatar(provider.name);
  });
})(window.LSC);
