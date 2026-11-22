# Subscriber access-control prototype

This is a local server-side policy prototype for Job Search SAM. It does not implement OAuth, verify real tokens, contact Stripe, store subscriptions, connect to ChatGPT, expose an MCP endpoint, or protect the current instruction-only plugin. Do not deploy it as a production access-control system.

## Contract

The server, not an end user, supplies both dependencies:

- An identity verifier validates token signatures, trusted issuer, audience/resource, time validity, required scopes, and applicable revocation. It returns a stable opaque subject or rejects invalid credentials.
- An entitlement provider queries fresh authoritative server-owned records for that exact subject and returns status plus an access-until timestamp. The adapter must enforce test/live separation, correctly handle renewal and cancellation, and never trust a user-editable field or email alone.

The guard rejects missing credentials, inactive/expired access, cross-user mismatches, and verification outages. It uses conservative denial; business policy for trial, delinquency, refunds, disputes and cancellation must be specified and applied by the eventual backend. Server code must protect every paid endpoint with the guard and handle valid OAuth challenges as required by the host. Never log bearer tokens, resume data, answers, or billing secrets.

## Required work before real access enforcement

1. Confirm the supported product model and account-linking flow.
2. Implement and independently test an OAuth/OIDC identity provider against the actual issuer and audience. This prototype does not validate tokens.
3. Implement authoritative subscription mapping and updates, including verified payment-provider webhooks, replay/idempotency protection, and reconciliation.
4. Move protected functionality behind authenticated server-side tools and apply the guard to each request. Published skill instructions alone cannot enforce a subscription.
5. Test cross-user isolation, expired/revoked credentials, late/duplicate webhook events, provider outages, cancellation, privacy and security. Conduct review before deployment.
6. Follow the platform's current rules. A plugin must not sell or initiate subscriptions or link to a checkout; an existing paid-account integration may be possible under current rules.
7. Billing has not been implemented. Consider tax obligations before launch; do not enable automatic tax without the necessary registrations and configuration.

Run the isolated tests with `node --test access/access-guard.test.mjs`. The tests use only in-memory sample data.

