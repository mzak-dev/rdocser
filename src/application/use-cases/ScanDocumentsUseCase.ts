/** Application use case for scanning source documents. */
import { DocumentCatalogService } from "../services/DocumentCatalogService";
export class ScanDocumentsUseCase { constructor(private readonly catalog:DocumentCatalogService){} execute(){return this.catalog.scan();} }
