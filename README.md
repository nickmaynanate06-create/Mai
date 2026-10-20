# Aster API

The starter API is intentionally suggest-only and uses a deterministic plan until a model provider is configured. `/plan` requires `Authorization: Bearer <ASTER_API_TOKEN>`. `/health` is public and returns service status only.

Before public deployment:
- Configure HTTPS and a strong `ASTER_API_TOKEN`.
- Add rate limiting and user authentication.
- Keep model/provider secrets in the host's environment variables.
- Do not expose private memory or privileged tools to unauthenticated clients.
- Review and validate every tool schema; require confirmation for external or consequential actions.
