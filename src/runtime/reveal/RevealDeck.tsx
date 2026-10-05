/** Provides the author-facing Deck with isolated hash, keyboard and resize lifecycles. */
import { useEffect, useMemo, useRef, useState } from "react";
import { Deck as RevealReactDeck, type DeckProps } from "@revealjs/react";
import type { RevealApi } from "reveal.js";
import { Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RevealPresentationService } from "./RevealPresentationService";
import "reveal.js/reveal.css";
export { Slide, Stack, Fragment } from "@revealjs/react";
export function RevealDeck({ children, config, ...props }: DeckProps) {
  const host = useRef<HTMLDivElement>(null);
  const [deck, setDeck] = useState<RevealApi | null>(null);
  const options = useMemo(() => ({ width: 960, height: 600, controls: true, progress: true, transition: "slide" as const,
    ...config, embedded: true, hash: false, respondToHashChanges: false, history: false, keyboard: false, touch: true, help: false }), [config]);
  useEffect(() => {
    if (!host.current || !deck) return;
    return new RevealPresentationService().attach(host.current, deck);
  }, [deck]);
  return <div className="presentation-host" ref={host} tabIndex={0} aria-label="Interactive presentation. Focus to use arrow keys.">
    <RevealReactDeck {...props} config={options} onReady={api => { setDeck(api); props.onReady?.(api); }}>{children}</RevealReactDeck>
    <Button variant="outline" size="icon-sm" className="presentation-fullscreen" aria-label="Enter fullscreen" onClick={() => { void host.current?.requestFullscreen?.().catch(() => {}); }}><Maximize /></Button>
  </div>;
}
