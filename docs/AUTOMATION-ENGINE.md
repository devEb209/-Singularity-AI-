# SNB Automation Engine

Persistent user-scoped definitions support UTC five-field cron schedules and filtered project events. The only V1 action is creation of a supervised Mission Engine DAG; arbitrary code and physical/host actions are rejected. Definitions and execution history are written atomically to per-tenant state files, protected by an in-process serialized update lock. Every execution records status, mission ID/error and an HMAC receipt.

APIs: `GET/POST /api/v1/automations`, enable/disable, authenticated `tick`, and event emission. Production scheduling still requires a trusted worker to invoke `tick`; the API does not claim a daemon exists when it does not.
