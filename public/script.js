const config = window.SITE_CONFIG ?? {};

document.querySelectorAll("[data-brand]").forEach((element) => {
  element.textContent = config.brand || "ICE AI";
});

document.querySelectorAll("[data-email]").forEach((element) => {
  const email = config.email || "hello@ice-ai.co.uk";
  element.textContent = email;
  element.setAttribute("href", `mailto:${email}`);
});

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

if (config.brand && config.title) {
  const pageTitle = document.body.dataset.pageTitle;
  document.title = pageTitle ? `${pageTitle} | ${config.brand}` : `${config.brand} | ${config.title}`;
}

let bookingUrl;
try {
  const candidate = new URL(config.bookingUrl);
  if (candidate.protocol === "https:") bookingUrl = candidate.href;
} catch {
  // Keep the contact route when no Bookings link has been configured yet.
}

if (bookingUrl) {
  document.querySelectorAll("[data-booking-link]").forEach((link) => {
    link.setAttribute("href", bookingUrl);
  });

  const bookingPanel = document.querySelector(".booking-panel");
  const contactForm = document.querySelector(".contact-form");
  if (bookingPanel && contactForm) {
    bookingPanel.hidden = false;
    contactForm.hidden = true;
  }
}

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");
const menuLabel = menuToggle?.querySelector(".sr-only");

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  if (menuLabel) menuLabel.textContent = isOpen ? "Open menu" : "Close menu";
  primaryNav?.classList.toggle("is-open", !isOpen);
});

primaryNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    if (menuLabel) menuLabel.textContent = "Open menu";
    primaryNav.classList.remove("is-open");
  });
});

const contactForm = document.querySelector(".contact-form");
const formStatus = document.querySelector(".form-status");

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!contactForm.checkValidity()) {
    contactForm.reportValidity();
    return;
  }

  formStatus?.removeAttribute("hidden");
  contactForm.classList.add("is-complete");
  formStatus?.focus?.();
});

const decisionMap = document.querySelector(".decision-map");
const decisionConnections = decisionMap?.querySelector(".decision-connections");

if (decisionMap && decisionConnections) {
  const problemItems = [...decisionMap.querySelectorAll(".decision-problems li")];
  const solutionItems = [...decisionMap.querySelectorAll(".decision-solutions li")];
  const valueItems = [...decisionMap.querySelectorAll(".decision-value li")];
  const mutedGroup = decisionConnections.querySelector(".connection-set-muted");
  const signalGroup = decisionConnections.querySelector(".connection-set-signal");
  const namespace = "http://www.w3.org/2000/svg";

  const routes = {
    muted: {
      problemToSolution: [
        [0, 0], [0, 2], [0, 4],
        [1, 0], [1, 1], [1, 3],
        [2, 1], [2, 2], [2, 3],
        [3, 3], [3, 4],
        [4, 0], [4, 2], [4, 4],
      ],
      solutionToValue: [
        [0, 0], [0, 3],
        [1, 1], [1, 4],
        [2, 1], [2, 2], [2, 4],
        [3, 2], [3, 3],
        [4, 0], [4, 3], [4, 4],
      ],
    },
    signal: {
      problemToSolution: [[0, 4], [2, 2]],
      solutionToValue: [[1, 4]],
    },
  };

  const markerCentre = (item, mapBounds) => {
    const markerBounds = item.querySelector("i").getBoundingClientRect();
    return {
      x: markerBounds.left + markerBounds.width / 2 - mapBounds.left,
      y: markerBounds.top + markerBounds.height / 2 - mapBounds.top,
    };
  };

  const railExit = (item, mapBounds) => {
    const railBounds = item.closest(".decision-rail").getBoundingClientRect();
    const marker = markerCentre(item, mapBounds);
    return {
      x: railBounds.right - mapBounds.left,
      y: marker.y,
    };
  };

  const addRoute = (group, sourceItem, targetItem, mapBounds) => {
    const start = railExit(sourceItem, mapBounds);
    const end = markerCentre(targetItem, mapBounds);
    start.x = Math.min(start.x, end.x - 32);
    const curve = Math.max(24, (end.x - start.x) * 0.46);
    const path = document.createElementNS(namespace, "path");

    path.setAttribute(
      "d",
      `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} C ${(start.x + curve).toFixed(1)} ${start.y.toFixed(1)}, ${(end.x - curve).toFixed(1)} ${end.y.toFixed(1)}, ${end.x.toFixed(1)} ${end.y.toFixed(1)}`,
    );
    group.append(path);
  };

  const drawRoutes = (group, routeSet, sources, targets, mapBounds) => {
    routeSet.forEach(([sourceIndex, targetIndex]) => {
      addRoute(group, sources[sourceIndex], targets[targetIndex], mapBounds);
    });
  };

  const drawDecisionConnections = () => {
    mutedGroup.replaceChildren();
    signalGroup.replaceChildren();

    if (window.matchMedia("(max-width: 820px)").matches) {
      return;
    }

    const mapBounds = decisionMap.getBoundingClientRect();
    decisionConnections.setAttribute("viewBox", `0 0 ${mapBounds.width} ${mapBounds.height}`);
    decisionConnections.setAttribute("preserveAspectRatio", "none");

    drawRoutes(mutedGroup, routes.muted.problemToSolution, problemItems, solutionItems, mapBounds);
    drawRoutes(mutedGroup, routes.muted.solutionToValue, solutionItems, valueItems, mapBounds);
    drawRoutes(signalGroup, routes.signal.problemToSolution, problemItems, solutionItems, mapBounds);
    drawRoutes(signalGroup, routes.signal.solutionToValue, solutionItems, valueItems, mapBounds);
  };

  let connectionFrame;
  const scheduleDecisionConnections = () => {
    window.cancelAnimationFrame(connectionFrame);
    connectionFrame = window.requestAnimationFrame(drawDecisionConnections);
  };

  scheduleDecisionConnections();
  window.addEventListener("load", scheduleDecisionConnections, { once: true });
  window.addEventListener("resize", scheduleDecisionConnections);
  document.fonts?.ready?.then(scheduleDecisionConnections);

  if ("ResizeObserver" in window) {
    new ResizeObserver(scheduleDecisionConnections).observe(decisionMap);
  }
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const reveals = document.querySelectorAll(".reveal");

if (reducedMotion || !("IntersectionObserver" in window)) {
  reveals.forEach((element) => element.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  reveals.forEach((element) => observer.observe(element));
}
