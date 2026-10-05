/** Keeps embedded Reveal decks resized and grants keyboard ownership to one focused deck. */
import type { RevealApi } from "reveal.js";
export class RevealPresentationService {
  private static active?: RevealApi;
  private observer?: ResizeObserver;
  attach(element: HTMLElement, deck: RevealApi): () => void {
    this.observer = new ResizeObserver(() => deck.layout());
    this.observer.observe(element);
    const focus = () => {
      RevealPresentationService.active?.configure({ keyboard: false });
      RevealPresentationService.active = deck;
      deck.configure({ keyboard: true, keyboardCondition: () => element.contains(document.activeElement) });
    };
    const blur = (event: FocusEvent) => {
      if (!element.contains(event.relatedTarget as Node | null)) {
        deck.configure({ keyboard: false });
        if (RevealPresentationService.active === deck) RevealPresentationService.active = undefined;
      }
    };
    element.addEventListener("focusin", focus);
    element.addEventListener("focusout", blur);
    return () => {
      this.observer?.disconnect();
      element.removeEventListener("focusin", focus);
      element.removeEventListener("focusout", blur);
      if (RevealPresentationService.active === deck) RevealPresentationService.active = undefined;
    };
  }
}
