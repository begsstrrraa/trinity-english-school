(() => {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav__links");
  const closeMenu = () => {
    menu?.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  };
  toggle?.addEventListener("click", () => {
    const open = !menu.classList.contains("is-open");
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-open", open);
  });
  menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  addEventListener("resize", () => { if (innerWidth > 980) closeMenu(); });

  // Stable shared smooth scrolling. Touch devices retain their native momentum.
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const smoothScroll = !reducedMotion.matches && typeof Lenis === "function"
    ? new Lenis({
        autoRaf: true,
        smoothWheel: true,
        syncTouch: false,
        duration: 1.05,
        wheelMultiplier: .9,
        anchors: { offset: -86 },
        easing: (value) => Math.min(1, 1.001 - Math.pow(2, -10 * value)),
        prevent: (node) => Boolean(node.closest?.(".lightbox"))
      })
    : null;

  // One shared reveal system is used by the home page and every subpage.
  const reveals = document.querySelectorAll("[data-reveal], .page-hero__content, .footer-grid > *, .footer-bottom");
  if ("IntersectionObserver" in window) {
    const revealOrder = new Map([...reveals].map((item, index) => [item, index % 4]));
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        entry.target.animate(
          [{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 650, delay: revealOrder.get(entry.target) * 65, easing: "cubic-bezier(.2,.75,.25,1)", fill: "both" }
        );
      }
      observer.unobserve(entry.target);
    }), { threshold: .12 });
    reveals.forEach((item) => observer.observe(item));
  }

  const topButton = document.querySelector(".back-to-top");
  const updateTop = () => topButton?.classList.toggle("is-visible", scrollY > 500);
  addEventListener("scroll", updateTop, { passive: true });
  updateTop();
  topButton?.addEventListener("click", () => {
    if (smoothScroll) smoothScroll.scrollTo(0, { duration: 1.05 });
    else scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
  });

  const gallery = [...document.querySelectorAll(".gallery-item")];
  const lightbox = document.querySelector(".lightbox");
  const lightboxImage = lightbox?.querySelector("img");
  let current = 0;
  const show = (index) => {
    if (!lightbox || !lightboxImage || !gallery.length) return;
    current = (index + gallery.length) % gallery.length;
    lightboxImage.src = gallery[current].querySelector("img").src;
    lightboxImage.alt = gallery[current].querySelector("img").alt;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    smoothScroll?.stop();
    document.body.style.overflow = "hidden";
  };
  const hide = () => {
    lightbox?.classList.remove("is-open");
    lightbox?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    smoothScroll?.start();
  };
  gallery.forEach((item, index) => item.addEventListener("click", () => show(index)));
  lightbox?.querySelector(".lightbox__close")?.addEventListener("click", hide);
  lightbox?.querySelector(".lightbox__prev")?.addEventListener("click", () => show(current - 1));
  lightbox?.querySelector(".lightbox__next")?.addEventListener("click", () => show(current + 1));
  lightbox?.addEventListener("click", (event) => { if (event.target === lightbox) hide(); });
  addEventListener("keydown", (event) => {
    if (!lightbox?.classList.contains("is-open")) return;
    if (event.key === "Escape") hide();
    if (event.key === "ArrowLeft") show(current - 1);
    if (event.key === "ArrowRight") show(current + 1);
  });

  document.querySelector(".contact-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    event.currentTarget.reset();
    event.currentTarget.querySelector(".form-status")?.classList.add("is-visible");
  });

  // Wall of Fame Filter
  const fameFilterBtns = document.querySelectorAll(".fame-filter-btn");
  const fameCards = document.querySelectorAll(".fame-card");
  const fameCountEl = document.querySelector(".fame-count-number");

  if (fameFilterBtns.length && fameCards.length) {
    fameFilterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        fameFilterBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const filterVal = btn.getAttribute("data-filter");
        let visibleCount = 0;

        fameCards.forEach((card) => {
          const cardCat = card.getAttribute("data-category");
          if (filterVal === "all" || cardCat === filterVal) {
            card.style.display = "";
            visibleCount++;
            if (!reducedMotion.matches) {
              card.animate(
                [{ opacity: 0, transform: "scale(0.95) translateY(10px)" }, { opacity: 1, transform: "scale(1) translateY(0)" }],
                { duration: 320, easing: "cubic-bezier(.2,.75,.25,1)", fill: "both" }
              );
            }
          } else {
            card.style.display = "none";
          }
        });

        if (fameCountEl) {
          fameCountEl.textContent = String(visibleCount);
        }
      });
    });
  }
})();

