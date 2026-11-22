import test from "node:test";
import assert from "node:assert/strict";
import { createAccessGuard } from "./access-guard.mjs";

const t = 1_800_000_000_000;
const active = { subject: "user-a", status: "active", accessUntilMs: t + 1000 };
function setup({ principal = {subject:"user-a"}, access = active, identityFail = false, dataFail = false } = {}) {
  const seen = [];
  const identityVerifier = {async verifyAccessToken(token) {
    seen.push(["token", token]); if (identityFail) throw Error("identity unavailable"); return principal;
  }};
  const entitlementProvider = {async getAccess(subject) {
    seen.push(["subject", subject]); if (dataFail) throw Error("storage unavailable"); return access;
  }};
  return { guard:createAccessGuard({identityVerifier, entitlementProvider, now:() => t}), seen };
}
test("allows a verified identity with its own unexpired active access", async () => {
  const {guard, seen} = setup();
  assert.deepEqual(await guard("Bearer valid-token"), {status:200, code:"access_granted", subject:"user-a"});
  assert.deepEqual(seen, [["token","valid-token"],["subject","user-a"]]);
});
test("rejects missing or malformed credentials without touching providers", async () => {
  const {guard,seen}=setup();
  for (const h of [undefined, "", "Basic value", "Bearer ", "Bearer a b"]) {
    assert.equal((await guard(h)).status, 401);
  }
  assert.deepEqual(seen,[]);
});
test("invalid identity cannot cause an entitlement lookup", async () => {
  const {guard,seen}=setup({principal:null});
  assert.equal((await guard("Bearer invalid")).status,401);
  assert.deepEqual(seen,[["token","invalid"]]);
});
test("does not grant access on wrong-user, absent, inactive or expired records", async () => {
  for (const access of [null,{...active,subject:"user-b"},{...active,status:"canceled"},{...active,status:"past_due"},{...active,accessUntilMs:t},{...active,accessUntilMs:NaN}]) {
    assert.equal((await setup({access}).guard("Bearer t")).status,403);
  }
});
test("fails closed if identity or entitlement verification is unavailable", async () => {
  assert.equal((await setup({identityFail:true}).guard("Bearer t")).status,503);
  assert.equal((await setup({dataFail:true}).guard("Bearer t")).status,503);
});
test("accepts an active record until its authoritative access end, even if cancellation is scheduled", async () => {
  assert.equal((await setup({access:{...active,cancelAtPeriodEnd:true}}).guard("Bearer t")).status,200);
});
test("server must install both providers", () => {
  assert.throws(()=>createAccessGuard({}),TypeError);
});

