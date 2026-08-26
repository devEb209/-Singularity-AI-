# SNB Plugin Package Runtime

The package lifecycle validates semantic versions, IDs, SHA-256 payload checksums, licenses, safe relative entrypoints, an explicit permission allowlist, exact dependencies and dependency cycles. Install, enable, disable and removal are persisted atomically per tenant and receive HMAC receipts. Removal is blocked while dependents remain.

Installed code is **not executed** in the API process. `execution: disabled-until-sandbox-adapter` is an enforced trust boundary, not a missing claim. Activation of plugin code requires the separate secure container/microVM execution fabric and security tests; installation alone never activates a capability.
