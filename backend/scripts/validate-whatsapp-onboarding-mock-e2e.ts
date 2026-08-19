import request from "supertest";
import { createClient } from "@supabase/supabase-js";
import { app } from "../src/app";

type SeedUser = { email: string; password: string; token?: string; id?: string };

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const SUPABASE_URL = env("SUPABASE_URL");
const SUPABASE_ANON_KEY = env("SUPABASE_ANON_KEY");
const SUPABASE_SERVICE_ROLE_KEY = env("SUPABASE_SERVICE_ROLE_KEY");

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

async function createAuthUser(email: string, password: string) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user;
}

async function signIn(email: string, password: string) {
  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.session?.access_token) throw new Error("No session token returned");
  return data.session.access_token;
}

async function seedCompany({ name, slug }: { name: string; slug: string }) {
  const { data, error } = await supabaseAdmin
    .from("companies")
    .insert({ name, slug, status: "active", timezone: "Europe/Lisbon" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

async function seedCompanyMember({ userId, companyId, role }: { userId: string; companyId: string; role: "company_admin" | "seller" }) {
  const { error } = await supabaseAdmin.from("company_members").insert({
    user_id: userId,
    company_id: companyId,
    role,
    active: true,
  });
  if (error) throw error;
}

async function seedSeller({ companyId, name }: { companyId: string; name: string }) {
  const { data, error } = await supabaseAdmin
    .from("sellers")
    .insert({ company_id: companyId, name, role: "sales_rep", active: true })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

async function seedAndGetToken(user: SeedUser) {
  const u = await createAuthUser(user.email, user.password);
  await (async () => {})();
  return u.id as string;
}

async function main() {
  const tenantA: SeedUser = { email: "tenant-a-admin-mock@test.local", password: "Password123!" };
  const tenantB: SeedUser = { email: "tenant-b-admin-mock@test.local", password: "Password123!" };

  // 1) Seed: companies + company_admin users + sellers
  const companyAId = await seedCompany({ name: "Tenant A", slug: "tenant-a" });
  const companyBId = await seedCompany({ name: "Tenant B", slug: "tenant-b" });

  const userA = await createAuthUser(tenantA.email, tenantA.password);
  const userB = await createAuthUser(tenantB.email, tenantB.password);

  await seedCompanyMember({ userId: userA.id, companyId: companyAId, role: "company_admin" });
  await seedCompanyMember({ userId: userB.id, companyId: companyBId, role: "company_admin" });

  tenantA.id = userA.id;
  tenantB.id = userB.id;

  tenantA.token = await signIn(tenantA.email, tenantA.password);
  tenantB.token = await signIn(tenantB.email, tenantB.password);

  const sellerA1 = await seedSeller({ companyId: companyAId, name: "Seller A1" });
  const sellerA2 = await seedSeller({ companyId: companyAId, name: "Seller A2" });
  const sellerB1 = await seedSeller({ companyId: companyBId, name: "Seller B1" });

  // Helpers
  const start = (token: string) =>
    request(app).post("/api/v1/whatsapp/connect/start").set("Authorization", `Bearer ${token}`).send({});

  const callback = (token: string, query: Record<string, string | undefined>) =>
    request(app)
      .get("/api/v1/whatsapp/connect/callback")
      .set("Authorization", `Bearer ${token}`)
      .query(query);

  const listConnections = (token: string) =>
    request(app).get("/api/v1/whatsapp/connections").set("Authorization", `Bearer ${token}`);

  const listNumbers = (token: string) =>
    request(app).get("/api/v1/whatsapp/numbers").set("Authorization", `Bearer ${token}`);

  const patchNumberSeller = (token: string, numberId: string, sellerId: string) =>
    request(app)
      .patch(`/api/v1/whatsapp/numbers/${numberId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ sellerId });

  const disconnectConnection = (token: string, connectionId: string) =>
    request(app)
      .post(`/api/v1/whatsapp/connections/${connectionId}/disconnect`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

  // 2) Tenant A connect flow (start → mock callback → connected → number)
  const startA = await start(tenantA.token!);
  if (startA.status !== 200) throw new Error(`startA failed: ${startA.status} ${startA.text}`);

  const startABody = startA.body as any;
  const connectionAId = startABody.connectionId as string;
  const stateA = startABody.state as string;

  const cbA = await callback(tenantA.token!, {
    connectionId: connectionAId,
    state: stateA,
    code: "mock-embedded-code",
    wabaId: "mock-waba-a",
    phoneNumberId: "pn-tenant-a-1",
  });

  if (cbA.status !== 200) throw new Error(`callbackA failed: ${cbA.status} ${cbA.text}`);

  const numbersARes = await listNumbers(tenantA.token!);
  if (numbersARes.status !== 200) throw new Error(`listNumbersA failed: ${numbersARes.status}`);

  const numbersA = (numbersARes.body.whatsappNumbers ?? []) as any[];
  const numberA = numbersA.find((n) => n.phone_number_id === "pn-tenant-a-1");
  if (!numberA) throw new Error("Tenant A number not created");

  // 3) Seller assignment A (success) and B (reject cross-tenant)
  const patchA1 = await patchNumberSeller(tenantA.token!, numberA.id, sellerA1);
  if (patchA1.status !== 200) throw new Error(`assignSellerA1 failed: ${patchA1.status}`);

  const patchCross = await patchNumberSeller(tenantA.token!, numberA.id, sellerB1);
  if (patchCross.status === 200) throw new Error("Cross-tenant seller assignment unexpectedly succeeded");

  // 4) Tenant B connect flow (create connection + number)
  const startB = await start(tenantB.token!);
  const startBBody = startB.body as any;
  const connectionBId = startBBody.connectionId as string;
  const stateB = startBBody.state as string;

  const cbB = await callback(tenantB.token!, {
    connectionId: connectionBId,
    state: stateB,
    code: "mock-embedded-code",
    wabaId: "mock-waba-b",
    phoneNumberId: "pn-tenant-b-1",
  });
  if (cbB.status !== 200) throw new Error(`callbackB failed: ${cbB.status} ${cbB.text}`);

  // 5) Cross-tenant: Tenant A cannot disconnect Tenant B
  const disconnectBByA = await disconnectConnection(tenantA.token!, connectionBId);
  if (disconnectBByA.status === 200) throw new Error("Cross-tenant disconnect unexpectedly succeeded");

  // 6) Disconnect Tenant A
  const disconnectA = await disconnectConnection(tenantA.token!, connectionAId);
  if (disconnectA.status !== 200) throw new Error(`disconnectA failed: ${disconnectA.status}`);

  const connectionsARes = await listConnections(tenantA.token!);
  if (connectionsARes.status !== 200) throw new Error(`listConnectionsA failed: ${connectionsARes.status}`);
  const connA = (connectionsARes.body.connections ?? []).find((c: any) => c.id === connectionAId);
  if (!connA) throw new Error("Tenant A connection not found after disconnect");
  if (connA.status !== "DISCONNECTED") throw new Error(`Expected DISCONNECTED, got: ${connA.status}`);

  console.log("MOCK ONBOARDING E2E OK");
  console.log({ companyAId, companyBId, connectionAId, numberAId: numberA.id });
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("MOCK ONBOARDING E2E FAILED:", e);
    process.exit(1);
  });

