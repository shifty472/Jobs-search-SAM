/**
 * Server-side access decision prototype.
 * Not an authentication implementation and not wired to a production service.
 *
 * Providers MUST be configured by trusted server code, never supplied by a user.
 * verifyAccessToken must validate the signature, issuer, audience, expiry,
 * not-before, required scopes and revocation as applicable. getAccess must read
 * authoritative, fresh, server-owned entitlement data for the verified subject.
 * Do not use this module as a substitute for either provider.
 */
export function createAccessGuard({ identityVerifier, entitlementProvider, now = () => Date.now() }) {
  if (typeof identityVerifier?.verifyAccessToken !== "function" ||
      typeof entitlementProvider?.getAccess !== "function" || typeof now !== "function") {
    throw new TypeError("Trusted server-side identity and entitlement providers are required");
  }

  return async function authorizeSubscriber(authorizationHeader) {
    if (typeof authorizationHeader !== "string") return { status: 401, code: "authentication_required" };
    const match = /^Bearer ([^\s]+)$/i.exec(authorizationHeader);
    if (!match) return { status: 401, code: "authentication_required" };

    let identity;
    try {
      identity = await identityVerifier.verifyAccessToken(match[1]);
    } catch {
      return { status: 503, code: "verification_unavailable" };
    }
    if (!identity || typeof identity.subject !== "string" || !identity.subject.trim()) {
      return { status: 401, code: "authentication_required" };
    }

    let access;
    try {
      access = await entitlementProvider.getAccess(identity.subject);
    } catch {
      return { status: 503, code: "verification_unavailable" };
    }
    const time = now();
    if (!Number.isFinite(time)) return { status: 503, code: "verification_unavailable" };
    if (!access ||
        access.subject !== identity.subject ||
        access.status !== "active" ||
        !Number.isFinite(access.accessUntilMs) ||
        time >= access.accessUntilMs) {
      return { status: 403, code: "access_unavailable" };
    }

    // Only downstream server code receives this value. Never trust an arbitrary
    // client-supplied subject to select another user's access record.
    return { status: 200, code: "access_granted", subject: identity.subject };
  };
}

