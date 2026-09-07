/**
 * BINA Privacy Center
 *
 * The page has one template (this file) and one content file
 * (policy-data.js). To add, remove, or edit a policy document,
 * change policy-data.js only — nothing here needs to change.
 */
(() => {
  "use strict";

  const DOCS = window.POLICY_DATA.docs;
  const DOC_IDS = DOCS.map((doc) => doc.id);
  const root = document.documentElement;

  // ---------------------------------------------------------------
  // Safe localStorage — private browsing / disabled storage should
  // degrade quietly instead of throwing.
  // ---------------------------------------------------------------
  const storage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        /* ignore */
      }
    },
  };

  // ---------------------------------------------------------------
  // Rendering: build the DOM for each document from POLICY_DATA.
  // ---------------------------------------------------------------
  function renderTabs() {
    const switcher = document.getElementById("doc-switcher");
    switcher.innerHTML = DOCS.map(
      (doc, i) => `
      <button class="doc-tab${i === 0 ? " active" : ""}"
              id="tab-${doc.id}" data-doc="${doc.id}"
              role="tab" aria-selected="${i === 0}">${doc.tabLabel}</button>`,
    ).join("");
  }

  function renderFooterLinks() {
    const links = document.getElementById("footer-links");
    links.innerHTML = DOCS.map(
      (doc) => `<a href="#${doc.id}">${doc.tabLabel}</a>`,
    ).join("");
  }

  function renderFacts(facts) {
    return `<div class="factgrid">${facts
      .map(
        (f) =>
          `<div class="factcard"><h3>${f.title}</h3><p>${f.body}</p></div>`,
      )
      .join("")}</div>`;
  }

  function renderCompare(compare) {
    if (!compare) return "";
    const headRow = compare.headers
      .map((h) => `<th scope="col">${h}</th>`)
      .join("");
    const bodyRows = compare.rows
      .map((row) => {
        const [label, ...cells] = row;
        return `<tr><th>${label}</th>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;
      })
      .join("");
    return `
      <div class="compare-wrap">
        <table class="compare">
          <caption>${compare.caption}</caption>
          <thead><tr>${headRow}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>`;
  }

  function renderSection(section) {
    return `
      <section id="${section.id}" data-num="${section.num}" data-title="${section.title}">
        <h2><span class="secnum">${section.num}.</span> ${section.title}</h2>
        ${section.html}
      </section>`;
  }

  function renderPanel(doc, index) {
    const chips = doc.chips
      .map((c) => `<span class="chip${c.good ? " good" : ""}">${c.text}</span>`)
      .join("");

    return `
      <section id="panel-${doc.id}" class="doc-panel" role="tabpanel"
                aria-labelledby="tab-${doc.id}" ${index === 0 ? "" : "hidden"}>
        <div class="hero">
          <p class="eyebrow">${doc.eyebrow}</p>
          <h1 data-doctitle>${doc.title}</h1>
          <p class="dek">${doc.dek}</p>
          <div class="meta-row">${chips}</div>
          ${renderFacts(doc.facts)}
          ${renderCompare(doc.compare)}
        </div>
        <div class="doc-layout">
          <nav class="toc-wrap" aria-label="${doc.title} sections">
            <input type="search" class="toc-search" placeholder="Search this policy…"
                   aria-label="Search ${doc.title}">
            <p class="toc-title">On this page</p>
            <ul class="toc">${doc.sections
              .map(
                (s) => `
              <li><a href="#${doc.id}/${s.id}" data-target="${s.id}">
                <span class="n">${s.num}</span><span>${s.title}</span>
              </a></li>`,
              )
              .join("")}</ul>
          </nav>
          <div class="doc-content">
            <p class="search-status" role="status"></p>
            <article class="doc-body">
              ${doc.sections.map(renderSection).join("")}
            </article>
          </div>
        </div>
      </section>`;
  }

  function renderPanels() {
    document.getElementById("main").innerHTML = DOCS.map(renderPanel).join("");
  }

  // ---------------------------------------------------------------
  // Theme (light / dark)
  // ---------------------------------------------------------------
  function initTheme() {
    const saved = storage.get("bina-theme");
    if (saved) root.setAttribute("data-theme", saved);

    const button = document.getElementById("theme-toggle");
    const sync = () => {
      const isDark = root.getAttribute("data-theme") === "dark";
      button.textContent = isDark ? "\u2600" : "\u263D";
    };
    button.addEventListener("click", () => {
      const next =
        root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      storage.set("bina-theme", next);
      sync();
    });
    sync();
  }

  // ---------------------------------------------------------------
  // Document switching, driven by the URL hash: "#doc" or
  // "#doc/section-id".
  // ---------------------------------------------------------------
  function parseHash() {
    const [doc, sectionId] = window.location.hash.replace("#", "").split("/");
    return { doc, sectionId };
  }

  function initialDoc() {
    const { doc } = parseHash();
    if (DOC_IDS.includes(doc)) return doc;
    const saved = storage.get("bina-doc");
    return DOC_IDS.includes(saved) ? saved : DOC_IDS[0];
  }

  function showDoc(docId, sectionId) {
    DOC_IDS.forEach((id) => {
      document.getElementById(`panel-${id}`).hidden = id !== docId;
      const tab = document.getElementById(`tab-${id}`);
      tab.classList.toggle("active", id === docId);
      tab.setAttribute("aria-selected", id === docId);
    });
    storage.set("bina-doc", docId);
    clearSearch(docId);

    const panel = document.getElementById(`panel-${docId}`);
    document.title = `${panel.querySelector("[data-doctitle]").textContent} — BINA Privacy Center`;

    if (sectionId) {
      const target = document.getElementById(sectionId);
      if (target) {
        // Wait for the panel to become visible before scrolling.
        requestAnimationFrame(() =>
          target.scrollIntoView({ behavior: "smooth", block: "start" }),
        );
      }
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  function initDocSwitching() {
    document
      .getElementById("doc-switcher")
      .addEventListener("click", (event) => {
        const tab = event.target.closest(".doc-tab");
        if (!tab) return;
        window.location.hash = `#${tab.dataset.doc}`;
        showDoc(tab.dataset.doc);
      });

    window.addEventListener("hashchange", () => {
      const { doc, sectionId } = parseHash();
      if (DOC_IDS.includes(doc)) showDoc(doc, sectionId);
    });
  }

  // ---------------------------------------------------------------
  // Table of contents: click-to-scroll plus scrollspy highlighting.
  // ---------------------------------------------------------------
  function initToc() {
    DOC_IDS.forEach((docId) => {
      const panel = document.getElementById(`panel-${docId}`);
      const links = panel.querySelectorAll(".toc a");

      links.forEach((link) => {
        link.addEventListener("click", (event) => {
          event.preventDefault();
          const sectionId = link.dataset.target;
          window.location.hash = `#${docId}/${sectionId}`;
          document
            .getElementById(sectionId)
            .scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries
            .filter((entry) => entry.isIntersecting)
            .forEach((entry) => {
              const link = panel.querySelector(
                `.toc a[data-target="${entry.target.id}"]`,
              );
              if (!link) return;
              links.forEach((l) => l.classList.remove("active"));
              link.classList.add("active");
            });
        },
        { rootMargin: "-15% 0px -70% 0px" },
      );
      panel
        .querySelectorAll("article.doc-body section")
        .forEach((section) => observer.observe(section));
    });
  }

  // ---------------------------------------------------------------
  // In-page search: filters sections (and their TOC entries) by
  // plain-text match.
  // ---------------------------------------------------------------
  function clearSearch(docId) {
    const panel = document.getElementById(`panel-${docId}`);
    panel
      .querySelectorAll("article.doc-body section")
      .forEach((s) => s.classList.remove("hidden"));
    panel
      .querySelectorAll(".toc a")
      .forEach((a) => a.classList.remove("hidden"));
    const status = panel.querySelector(".search-status");
    status.classList.remove("show");
    status.textContent = "";
    const input = panel.querySelector(".toc-search");
    if (input) input.value = "";
  }

  function initSearch() {
    DOC_IDS.forEach((docId) => {
      const panel = document.getElementById(`panel-${docId}`);
      const input = panel.querySelector(".toc-search");
      const status = panel.querySelector(".search-status");
      const sections = panel.querySelectorAll("article.doc-body section");

      input.addEventListener("input", () => {
        const query = input.value.trim().toLowerCase();
        if (!query) {
          clearSearch(docId);
          return;
        }

        let matchCount = 0;
        sections.forEach((section) => {
          const matches = section.textContent.toLowerCase().includes(query);
          section.classList.toggle("hidden", !matches);
          const link = panel.querySelector(
            `.toc a[data-target="${section.id}"]`,
          );
          if (link) link.classList.toggle("hidden", !matches);
          if (matches) matchCount += 1;
        });

        status.classList.add("show");
        status.textContent =
          matchCount === 0
            ? `No sections match "${input.value.trim()}".`
            : `${matchCount} section${matchCount === 1 ? "" : "s"} match "${input.value.trim()}".`;
      });
    });
  }

  // ---------------------------------------------------------------
  // Print and back-to-top
  // ---------------------------------------------------------------
  function initPrint() {
    document
      .getElementById("print-btn")
      .addEventListener("click", () => window.print());
  }

  function initBackToTop() {
    const button = document.getElementById("backtotop");
    window.addEventListener(
      "scroll",
      () => button.classList.toggle("show", window.scrollY > 500),
      { passive: true },
    );
    button.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" }),
    );
  }

  // ---------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------
  renderTabs();
  renderFooterLinks();
  renderPanels();

  initTheme();
  initDocSwitching();
  initToc();
  initSearch();
  initPrint();
  initBackToTop();

  const { sectionId } = parseHash();
  showDoc(initialDoc(), sectionId);
})();
