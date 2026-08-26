# Offline Queue and Conflict-Aware Sync

The V1 sync core persists tenant-isolated documents, idempotent operation IDs, revisions, manual conflicts and resumable verified chunks. Stale overlapping fields produce explicit conflicts; strategies are manual, server-wins or client-wins. Manual resolution increments revision only when client data is selected. Atomic file replacement and serialized per-tenant updates protect state. Receipts are HMAC records, not remote-device attestation.
