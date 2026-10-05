/** Searches the shared content index through a shadcn command palette. */
import { useEffect, useMemo, useState } from "react";
import { FileText, Presentation, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command";
import type { DocumentManifestEntry } from "../../domain/documents/DocumentManifest";
import { SearchIndexService } from "../../application/services/SearchIndexService";
export function SearchCommand({ documents, onSelect }: { documents: DocumentManifestEntry[]; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const index = useMemo(() => { const service = new SearchIndexService(); service.build(documents.map(doc => ({ ...doc, slug: doc.id, headings: doc.headings.map(heading => heading.title) }))); return service; }, [documents]);
  const visible = query.trim() ? index.search(query).slice(0, 30).map(result => documents.find(doc => doc.id === result.documentId)!).filter(Boolean) : documents.slice(0, 12);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setOpen(current => !current); } };
    window.addEventListener("keydown", keydown); return () => window.removeEventListener("keydown", keydown);
  }, []);
  return <>
    <Button variant="outline" className="search-trigger" onClick={() => setOpen(true)} aria-label="Search documentation"><Search data-icon="inline-start" /><span>Search documentation…</span><kbd>Ctrl K</kbd></Button>
    <CommandDialog open={open} onOpenChange={value => { setOpen(value); if (!value) setQuery(""); }} title="Search documentation" description="Search titles, groups, headings, and full document content.">
      <Command shouldFilter={false}><CommandInput value={query} onValueChange={setQuery} placeholder="Search docs, topics, and ideas…" aria-label="Search documentation" />
        <CommandList><CommandEmpty>No documents found. Try a different phrase.</CommandEmpty>
          <CommandGroup heading={query.trim() ? `${visible.length} results` : "Jump to a document"}>{visible.map(doc => <CommandItem key={doc.id} value={doc.id} onSelect={() => { onSelect(doc.id); setOpen(false); setQuery(""); }}>
            {doc.type === "presentation" ? <Presentation /> : <FileText />}<span>{doc.title}</span><CommandShortcut>{doc.group}</CommandShortcut>
          </CommandItem>)}</CommandGroup>
        </CommandList>
      </Command>
      <div className="search-footer"><span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span><span><kbd>↵</kbd> to open</span><span><kbd>esc</kbd> to close</span></div>
    </CommandDialog>
  </>;
}
