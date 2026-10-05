/** Stable identifier for a document. */
export class DocumentId { constructor(readonly value: string) { if (!value) throw new Error("Document id cannot be empty"); } toString(): string { return this.value; } }
