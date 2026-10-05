/** Copies a fully restorable graph URL and reports clipboard failures accessibly. */
import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GraphViewState } from "../../application/services/ShareStateService";
import { ShareStateService } from "../../application/services/ShareStateService";
export function GraphShareControls({ capture }: { capture: () => GraphViewState }) {
  const [status, setStatus] = useState("");
  const share = async () => {
    try {
      const url = new URL(window.location.href);
      url.hash = `/graph?state=${new ShareStateService().encode(capture())}`;
      await navigator.clipboard.writeText(url.href);
      setStatus("Graph link copied");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Unable to copy the link"); }
  };
  return <div className="share-controls"><Button variant="outline" size="sm" onClick={() => { void share(); }}>{status === "Graph link copied" ? <Check data-icon="inline-start" /> : <Share2 data-icon="inline-start" />}Share graph</Button><span role="status" className="share-status">{status}</span></div>;
}
