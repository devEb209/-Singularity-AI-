# SNB Universal Document Engine

The V1 document engine produces real, checksummed project artifacts without a document-generation service.

## Formats

- PDF 1.4 with catalog, page tree, content stream, font, xref and trailer;
- DOCX as an OOXML ZIP package with relationships and Word document XML;
- XLSX as an OOXML workbook with worksheet relationships and inline-string cells;
- PPTX as an OOXML presentation with presentation relationships and a real slide;
- UTF-8 Markdown;
- RFC 4180-style quoted UTF-8 CSV.

## API

```text
GET  /api/v1/documents/capabilities
POST /api/v1/documents
GET  /api/v1/documents/:fileId/verify
```

Every output is written to tenant-scoped storage, read back by its verifier, hashed with SHA-256 and registered as `document.<format>` in the Artifact Graph. OOXML validation unzips the generated package and checks required parts and XML envelopes. PDF validation checks the signature, page object, xref and EOF. XML and CSV content are escaped before packaging.

## Scope boundary

The engine currently implements text, paragraphs, one spreadsheet table and one presentation slide. Complex styles, formulas, charts, embedded media, font shaping, PDF Unicode embedding and accessibility metadata remain advanced authoring work. Structural verification does not claim visual equivalence in every third-party office suite; connected end-to-end reader tests remain required for that claim.
