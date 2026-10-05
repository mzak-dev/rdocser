/** Typed application error with a stable code. */
export class RdocserError extends Error { constructor(message:string,readonly code:string){super(message);this.name="RdocserError";} }
