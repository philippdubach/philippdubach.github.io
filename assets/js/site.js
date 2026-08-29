(() => {
  const root = document.documentElement;
  const themeButtons = [...document.querySelectorAll("[data-theme-toggle]")];
  const darkModeQuery = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

  function systemTheme() {
    return darkModeQuery?.matches ? "dark" : "light";
  }

  function syncThemeControls(theme) {
    const dark = theme === "dark";
    for (const button of themeButtons) {
      button.setAttribute("aria-checked", String(dark));
      button.setAttribute("aria-label", dark ? "Use light theme" : "Use dark theme");
      button.title = dark ? "Use light theme" : "Use dark theme";
    }
  }

  function applyTheme(theme, persist = false) {
    root.dataset.theme = theme;
    if (persist) {
      try {
        localStorage.setItem("pdd-theme", theme);
      } catch {}
    }
    syncThemeControls(theme);
  }

  function hasSavedTheme() {
    try {
      const savedTheme = localStorage.getItem("pdd-theme");
      return savedTheme === "dark" || savedTheme === "light";
    } catch {
      return false;
    }
  }

  syncThemeControls(root.dataset.theme ?? systemTheme());

  for (const button of themeButtons) {
    button.addEventListener("click", () => {
      applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
    });
  }

  darkModeQuery?.addEventListener?.("change", (event) => {
    if (!hasSavedTheme()) applyTheme(event.matches ? "dark" : "light");
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== "pdd-theme") return;
    const theme = event.newValue === "dark" || event.newValue === "light"
      ? event.newValue
      : systemTheme();
    applyTheme(theme);
  });

  const menu = document.querySelector("[data-mobile-menu]");
  const menuOpenButtons = [...document.querySelectorAll("[data-menu-open]")];
  const menuCloseButton = document.querySelector("[data-menu-close]");
  let menuInvoker = null;

  function openMenu(invoker) {
    if (!(menu instanceof HTMLDialogElement) || menu.open) return;
    menuInvoker = invoker;
    invoker.setAttribute("aria-expanded", "true");
    menu.showModal();
  }

  function closeMenu() {
    if (menu instanceof HTMLDialogElement && menu.open) menu.close();
  }

  for (const button of menuOpenButtons) {
    button.addEventListener("click", () => openMenu(button));
  }

  menuCloseButton?.addEventListener("click", closeMenu);
  menu?.addEventListener("click", (event) => {
    if (event.target === menu) closeMenu();
  });
  menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  menu?.addEventListener("close", () => {
    if (menuInvoker instanceof HTMLElement) {
      menuInvoker.setAttribute("aria-expanded", "false");
      menuInvoker.focus();
    }
    menuInvoker = null;
  });

  const topicFilter = document.querySelector("[data-topic-filter]");
  const writingItems = [...document.querySelectorAll("[data-writing-index] > li")];
  const filterStatus = document.querySelector("[data-filter-status]");

  function applyTopic(topic, updateHistory = false) {
    if (!topicFilter || writingItems.length === 0) return;
    const normalizedTopic = topic || "all";
    let visibleCount = 0;
    for (const item of writingItems) {
      const topics = (item.dataset.topics ?? "").split(/\s+/).filter(Boolean);
      const visible = normalizedTopic === "all" || topics.includes(normalizedTopic);
      item.hidden = !visible;
      if (visible) visibleCount += 1;
    }
    for (const link of topicFilter.querySelectorAll("[data-topic]")) {
      if (link.dataset.topic === normalizedTopic) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
    if (filterStatus) {
      filterStatus.textContent = normalizedTopic === "all"
        ? ""
        : `${visibleCount} ${visibleCount === 1 ? "article" : "articles"} shown.`;
    }
    if (updateHistory) {
      const url = new URL(location.href);
      if (normalizedTopic === "all") url.searchParams.delete("topic");
      else url.searchParams.set("topic", normalizedTopic);
      history.pushState({ topic: normalizedTopic }, "", url);
    }
  }

  if (topicFilter && writingItems.length > 0) {
    const initialTopic = new URL(location.href).searchParams.get("topic") || "all";
    applyTopic(initialTopic);
    topicFilter.addEventListener("click", (event) => {
      const link = event.target.closest("[data-topic]");
      if (!(link instanceof HTMLAnchorElement)) return;
      event.preventDefault();
      applyTopic(link.dataset.topic || "all", true);
    });
    window.addEventListener("popstate", () => {
      applyTopic(new URL(location.href).searchParams.get("topic") || "all");
    });
  }

  for (const form of document.querySelectorAll("[data-newsletter-preview]")) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const message = form.querySelector("[data-newsletter-message]");
      if (!(input instanceof HTMLInputElement) || !(message instanceof HTMLElement)) return;
      if (!input.checkValidity()) {
        message.textContent = "Enter a valid email address.";
        input.reportValidity();
        return;
      }
      message.textContent = "Preview only — no subscription was created";
    });
  }

  const localHosts = ["localhost", "127.0.0.1"];

  for (const form of document.querySelectorAll("[data-newsletter-endpoint]")) {
    const note = form.querySelector("[data-newsletter-note]");
    const countEndpoint = form.dataset.newsletterCountEndpoint;
    if (note instanceof HTMLElement && countEndpoint && !localHosts.includes(location.hostname)) {
      fetch(countEndpoint)
        .then((response) => response.json())
        .then((data) => {
          if (!data || !data.display) return;
          note.insertBefore(document.createTextNode(`Join ${data.display} readers. `), note.firstChild);
        })
        .catch(() => {});
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const message = form.querySelector("[data-newsletter-message]");
      const button = form.querySelector('button[type="submit"]');
      if (!(input instanceof HTMLInputElement) || !(message instanceof HTMLElement)) return;
      if (!input.checkValidity() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
        message.textContent = "Enter a valid email address.";
        input.reportValidity();
        return;
      }
      if (localHosts.includes(location.hostname)) {
        message.textContent = "Preview only — no subscription was created";
        return;
      }
      if (button instanceof HTMLButtonElement) {
        button.disabled = true;
        button.textContent = "Subscribing…";
      }
      fetch(form.dataset.newsletterEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: input.value.trim() }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data && data.success) {
            if (window.goatcounter && window.goatcounter.count) {
              window.goatcounter.count({ path: `subscribe${location.pathname}`, title: "Newsletter subscribe", event: true });
            }
            const controls = form.querySelector(".newsletter-preview__controls");
            if (controls instanceof HTMLElement) controls.hidden = true;
            message.textContent = "Thanks for subscribing! You'll receive the next newsletter in your inbox.";
          } else {
            message.textContent = (data && data.error) || "Something went wrong. Please try again.";
            if (button instanceof HTMLButtonElement) {
              button.disabled = false;
              button.textContent = "Subscribe";
            }
          }
        })
        .catch(() => {
          message.textContent = "Something went wrong. Please try again later.";
          if (button instanceof HTMLButtonElement) {
            button.disabled = false;
            button.textContent = "Subscribe";
          }
        });
    });
  }

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const ambientVideos = [...document.querySelectorAll("[data-ambient-video]")];

  function syncAmbientVideos(reduceMotion) {
    for (const video of ambientVideos) {
      if (!(video instanceof HTMLVideoElement)) continue;
      if (reduceMotion) video.pause();
      else video.play().catch(() => {});
    }
  }

  if (ambientVideos.length > 0) {
    syncAmbientVideos(reducedMotionQuery.matches);
    reducedMotionQuery.addEventListener("change", (event) => syncAmbientVideos(event.matches));
  }

  for (const trigger of document.querySelectorAll("[data-lightbox-target]")) {
    trigger.addEventListener("click", () => {
      const id = trigger.getAttribute("data-lightbox-target");
      const dialog = id ? document.getElementById(id) : null;
      if (!(dialog instanceof HTMLDialogElement)) return;
      const image = dialog.querySelector("img");
      if (image instanceof HTMLImageElement && !image.src) image.src = dialog.dataset.hires ?? "";
      dialog.showModal();
    });
  }

  const article = document.querySelector(".article-body");
  if (article) {
    const headings = [...article.querySelectorAll(":scope > h2[id], :scope > h3[id]")];
    const tocLinks = [...document.querySelectorAll("[data-desktop-toc] a, [data-mobile-toc] a")];
    const timelineGroups = [...document.querySelectorAll("[data-timeline-section]")];

    function sectionForHeading(heading) {
      if (heading.tagName === "H2") return heading.id;
      const index = headings.indexOf(heading);
      for (let position = index - 1; position >= 0; position -= 1) {
        if (headings[position].tagName === "H2") return headings[position].id;
      }
      return heading.id;
    }

    function updateTimeline(sectionID) {
      for (const group of timelineGroups) {
        const active = group.dataset.timelineSection === sectionID;
        group.classList.toggle("is-active", active);
        group.setAttribute("aria-hidden", String(!active));
      }
    }

    function setCurrentHeading(heading) {
      const activeIndex = headings.indexOf(heading);
      for (const link of tocLinks) {
        const id = decodeURIComponent(link.getAttribute("href")?.replace(/^#/, "") ?? "");
        const linkedIndex = headings.findIndex((candidate) => candidate.id === id);
        const current = linkedIndex === activeIndex;
        link.classList.toggle("is-current", current);
        link.classList.toggle("is-passed", linkedIndex >= 0 && linkedIndex < activeIndex);
        if (current) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }
      updateTimeline(sectionForHeading(heading));
    }

    if (headings.length > 0) {
      const hashHeading = location.hash
        ? headings.find((heading) => heading.id === decodeURIComponent(location.hash.slice(1)))
        : null;
      setCurrentHeading(hashHeading ?? headings[0]);

      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
          const candidates = entries
            .filter((entry) => entry.isIntersecting)
            .sort((left, right) => Math.abs(left.boundingClientRect.top) - Math.abs(right.boundingClientRect.top));
          if (candidates[0]) setCurrentHeading(candidates[0].target);
        }, { rootMargin: "-16% 0px -72% 0px", threshold: 0 });
        headings.forEach((heading) => observer.observe(heading));

        const finalContent = article.lastElementChild;
        if (finalContent) {
          const endObserver = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) setCurrentHeading(headings.at(-1));
          }, { threshold: 0.5 });
          endObserver.observe(finalContent);
        }
      }
    }

    document.querySelectorAll("[data-mobile-toc] a").forEach((link) => {
      link.addEventListener("click", () => {
        const disclosure = link.closest("details");
        if (disclosure instanceof HTMLDetailsElement) disclosure.open = false;
      });
    });
  }

  const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (finePointerQuery.matches) {
    const previewTriggers = [...document.querySelectorAll("[data-preview-trigger]")];
    let activeCard = null;
    let hideTimer = 0;

    function hidePreview(card = activeCard) {
      window.clearTimeout(hideTimer);
      if (!(card instanceof HTMLElement)) return;
      if (typeof card.hidePopover === "function" && card.matches(":popover-open")) card.hidePopover();
      card.removeAttribute("data-open");
      card.style.removeProperty("left");
      card.style.removeProperty("top");
      if (activeCard === card) activeCard = null;
    }

    function positionPreview(trigger, card) {
      const triggerRect = trigger.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const inset = 16;
      const gap = 10;
      const left = Math.min(
        Math.max(inset, triggerRect.left),
        window.innerWidth - cardRect.width - inset,
      );
      const roomBelow = window.innerHeight - triggerRect.bottom;
      const top = roomBelow >= cardRect.height + gap
        ? triggerRect.bottom + gap
        : Math.max(inset, triggerRect.top - cardRect.height - gap);
      card.style.left = `${Math.round(left)}px`;
      card.style.top = `${Math.round(top)}px`;
    }

    function showPreview(trigger) {
      window.clearTimeout(hideTimer);
      const cardID = trigger.getAttribute("aria-describedby");
      const card = cardID ? document.getElementById(cardID) : null;
      if (!(card instanceof HTMLElement)) return;
      if (activeCard && activeCard !== card) hidePreview(activeCard);
      try {
        if (typeof card.showPopover === "function") card.showPopover();
        else card.dataset.open = "true";
      } catch {
        card.dataset.open = "true";
      }
      activeCard = card;
      positionPreview(trigger, card);
    }

    for (const trigger of previewTriggers) {
      trigger.addEventListener("pointerenter", () => showPreview(trigger));
      trigger.addEventListener("pointerleave", () => {
        hideTimer = window.setTimeout(() => hidePreview(), 90);
      });
      trigger.addEventListener("focus", () => showPreview(trigger));
      trigger.addEventListener("blur", () => hidePreview());
      trigger.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          hidePreview();
          trigger.focus();
        }
      });
    }

    window.addEventListener("resize", () => hidePreview(), { passive: true });
    window.addEventListener("scroll", () => hidePreview(), { passive: true });
  }
})();
