"use client";

import { useEffect, useRef, type RefObject } from "react";

// Matches resources/js/Pages/Home.vue and AOS's original 100px / .6 scale effects.
const transforms: Record<string, string> = {
  "fade-up": "translate3d(0, 100px, 0)",
  "fade-down": "translate3d(0, -100px, 0)",
  "fade-right": "translate3d(-100px, 0, 0)",
  "fade-left": "translate3d(100px, 0, 0)",
  "fade-up-right": "translate3d(-100px, 100px, 0)",
  "fade-down-left": "translate3d(100px, -100px, 0)",
  "zoom-in": "scale(0.6)",
  "zoom-in-right": "translate3d(-100px, 0, 0) scale(0.6)",
  "flip-left": "perspective(2500px) rotateY(-100deg)",
};

// Read layout coordinates, ignoring the reveal transforms on nested sections.
function layoutTop(element: HTMLElement) {
  let top = 0;
  let current: HTMLElement | null = element;
  while (current) {
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }
  return top;
}

export default function useHomeMotion(root: RefObject<HTMLDivElement | null>, contentKey: unknown) {
  const seen = useRef(new WeakSet<Element>());

  useEffect(() => {
    const element = root.current;
    if (!element || !window.matchMedia) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Map<HTMLElement, Animation>();
    const pending = new Set<HTMLElement>();
    let frame = 0;

    const cancel = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      animations.forEach((animation) => animation.cancel());
      animations.clear();
      pending.clear();
    };

    const reveal = (target: HTMLElement) => {
      seen.current.add(target);
      pending.delete(target);
      animations.get(target)?.play();
    };

    const update = () => {
      frame = 0;
      const bottom = window.scrollY + window.innerHeight;
      pending.forEach((target) => {
        if (bottom > layoutTop(target) + 50) reveal(target);
      });
    };
    const schedule = () => {
      if (!frame && pending.size) frame = requestAnimationFrame(update);
    };

    const setup = () => {
      cancel();
      if (preference.matches) return;
      element.querySelectorAll<HTMLElement>("[data-home-reveal]").forEach((target) => {
        if (seen.current.has(target) || !target.animate) return;
        if (target.contains(document.activeElement)) {
          seen.current.add(target);
          return;
        }
        const effect = target.dataset.homeReveal || "fade-up";
        const flip = effect === "flip-left";
        const animation = target.animate([
          { opacity: flip ? 1 : 0, transform: transforms[effect] || transforms["fade-up"] },
          { opacity: 1, transform: flip ? "perspective(2500px) rotateY(0deg)" : "translate3d(0, 0, 0) scale(1)" },
        ], {
          duration: 1000,
          delay: Number(target.dataset.homeDelay ?? 100),
          easing: "cubic-bezier(0.42, 0, 0.58, 1)",
          fill: "both",
        });
        animation.pause();
        animation.currentTime = 0;
        animations.set(target, animation);
        pending.add(target);
        animation.onfinish = () => {
          animation.cancel();
          animations.delete(target);
        };
      });
      schedule();
    };

    const onFocus = (event: FocusEvent) => {
      animations.forEach((animation, target) => {
        if (event.target instanceof Node && target.contains(event.target)) {
          seen.current.add(target);
          pending.delete(target);
          animation.cancel();
          animations.delete(target);
        }
      });
    };

    setup();
    const resize = new ResizeObserver(schedule);
    resize.observe(element);
    preference.addEventListener("change", setup);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("beforeprint", cancel);
    window.addEventListener("afterprint", setup);
    element.addEventListener("load", schedule, true);
    element.addEventListener("focusin", onFocus);
    return () => {
      cancel();
      resize.disconnect();
      preference.removeEventListener("change", setup);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("beforeprint", cancel);
      window.removeEventListener("afterprint", setup);
      element.removeEventListener("load", schedule, true);
      element.removeEventListener("focusin", onFocus);
    };
  }, [root, contentKey]);
}
