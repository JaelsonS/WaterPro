/**
 * Idempotent seed for Playwright E2E tenant admin.
 * Ensures tenant-a-admin-mock@test.local exists with company_admin membership.
 */
import { createClient } from "@supabase/supabase-js";
import { loadBackendEnv } from "../src/loadEnv";

loadBackendEnv();

const E2E_EMAIL = process.env.E2E_TEST_EMAIL ?? "tenant-a-admin-mock@test.local";
const E2E_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "Password123!";
const COMPANY_SLUG = "tenant-a-e2e";
const COMPANY_NAME = "Tenant A E2E";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

async function main() {
  const supabaseUrl = requireEnv("SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = requireEnv("SUPABASE_ANON_KEY");

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const anon = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });

  let userId: string | undefined;

  const list = await admin.auth.admin.listUsers({ perPage: 1000 });
  const existing = list.data.users.find((u) => u.email?.toLowerCase() === E2E_EMAIL.toLowerCase());

  if (existing) {
    userId = existing.id;
    await admin.auth.admin.updateUserById(userId, { password: E2E_PASSWORD, email_confirm: true });
  } else {
    const created = await admin.auth.admin.createUser({
      email: E2E_EMAIL,
      password: E2E_PASSWORD,
      email_confirm: true,
    });
    if (created.error || !created.data.user) {
      throw created.error ?? new Error("Failed to create E2E user");
    }
    userId = created.data.user.id;
  }

  const { data: companyRow, error: companyLookupError } = await admin
    .from("companies")
    .select("id")
    .eq("slug", COMPANY_SLUG)
    .maybeSingle();

  if (companyLookupError) throw companyLookupError;

  let companyId = companyRow?.id as string | undefined;

  if (!companyId) {
    const inserted = await admin
      .from("companies")
      .insert({ name: COMPANY_NAME, slug: COMPANY_SLUG, status: "active", timezone: "Europe/Lisbon" })
      .select("id")
      .single();
    if (inserted.error) throw inserted.error;
    companyId = inserted.data.id as string;
  }

  const { data: membership, error: membershipLookupError } = await admin
    .from("company_members")
    .select("id, role, active")
    .eq("user_id", userId)
    .eq("company_id", companyId)
    .maybeSingle();

  if (membershipLookupError) throw membershipLookupError;

  if (!membership) {
    await admin
      .from("company_members")
      .update({ active: false })
      .eq("user_id", userId)
      .eq("active", true);

    const { error: insertMemberError } = await admin.from("company_members").insert({
      user_id: userId,
      company_id: companyId,
      role: "company_admin",
      active: true,
    });
    if (insertMemberError) throw insertMemberError;
  } else {
    await admin
      .from("company_members")
      .update({ active: false })
      .eq("user_id", userId)
      .neq("company_id", companyId)
      .eq("active", true);

    const { error: updateMemberError } = await admin
      .from("company_members")
      .update({ role: "company_admin", active: true })
      .eq("id", membership.id);
    if (updateMemberError) throw updateMemberError;
  }

  const signIn = await anon.auth.signInWithPassword({ email: E2E_EMAIL, password: E2E_PASSWORD });
  if (signIn.error || !signIn.data.session?.access_token) {
    throw signIn.error ?? new Error("E2E sign-in verification failed");
  }

  // eslint-disable-next-line no-console
  console.log(`[seed-e2e] ready: ${E2E_EMAIL} → company ${COMPANY_SLUG} (${companyId})`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[seed-e2e] failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
