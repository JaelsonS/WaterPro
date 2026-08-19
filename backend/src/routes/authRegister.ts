import { Router } from "express";
import { z } from "zod";
import { authUserMiddleware } from "../middleware/authUser";
import { createSupabaseAdminClient } from "../config/supabase";
import { HttpError } from "../errors/httpError";

export const authRegisterRouter = Router();

function slugifyCompanyName(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return base || "empresa";
}

async function resolveUniqueSlug(admin: ReturnType<typeof createSupabaseAdminClient>, preferred: string) {
  let slug = preferred;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data } = await admin.from("companies").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    slug = `${preferred}-${Math.random().toString(36).slice(2, 7)}`;
  }
  throw new HttpError({ statusCode: 409, code: "CONFLICT", message: "Could not allocate company slug" });
}

authRegisterRouter.get("/auth/register/status", authUserMiddleware, async (req, res, next) => {
  try {
    const userId = req.authUser?.userId;
    if (!userId) {
      throw new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Unauthorized" });
    }

    const admin = createSupabaseAdminClient();
    const { data: membership, error } = await admin
      .from("company_members")
      .select("company_id, role")
      .eq("user_id", userId)
      .eq("active", true)
      .maybeSingle();

    if (error) throw error;

    return res.status(200).json({
      registered: Boolean(membership?.company_id),
      companyId: membership?.company_id ?? null,
      role: membership?.role ?? null,
    });
  } catch (err) {
    return next(err);
  }
});

authRegisterRouter.post("/auth/register", authUserMiddleware, async (req, res, next) => {
  try {
    const userId = req.authUser?.userId;
    if (!userId) {
      throw new HttpError({ statusCode: 401, code: "UNAUTHORIZED", message: "Unauthorized" });
    }

    const body = z
      .object({
        companyName: z.string().trim().min(2).max(120),
        companySlug: z
          .string()
          .trim()
          .min(2)
          .max(48)
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug")
          .optional(),
      })
      .parse(req.body);

    const admin = createSupabaseAdminClient();

    const { data: existingMembership, error: membershipLookupError } = await admin
      .from("company_members")
      .select("company_id, role")
      .eq("user_id", userId)
      .eq("active", true)
      .maybeSingle();

    if (membershipLookupError) throw membershipLookupError;

    if (existingMembership?.company_id) {
      return res.status(200).json({
        companyId: existingMembership.company_id,
        slug: null,
        alreadyRegistered: true,
      });
    }

    const preferredSlug = body.companySlug ?? slugifyCompanyName(body.companyName);
    const slug = await resolveUniqueSlug(admin, preferredSlug);

    const { data: company, error: companyError } = await admin
      .from("companies")
      .insert({
        name: body.companyName,
        slug,
        status: "active",
        timezone: "Europe/Lisbon",
      })
      .select("id, slug")
      .single();

    if (companyError) throw companyError;

    const companyId = company.id as string;

    await admin.from("company_members").update({ active: false }).eq("user_id", userId).eq("active", true);

    const { error: memberError } = await admin.from("company_members").insert({
      user_id: userId,
      company_id: companyId,
      role: "company_admin",
      active: true,
    });

    if (memberError) throw memberError;

    await admin.from("public_site_keys").insert({
      company_id: companyId,
      site_key: slug,
      active: true,
    });

    await admin.from("ai_settings").insert({
      company_id: companyId,
      enabled: true,
      system_prompt: "Assistente virtual da sua empresa.",
      handoff_enabled: true,
    });

    return res.status(201).json({
      companyId,
      slug: company.slug,
      alreadyRegistered: false,
    });
  } catch (err) {
    return next(err);
  }
});
