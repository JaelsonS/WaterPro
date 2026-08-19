import { createSupabaseAdminClient } from "../../config/supabase";
import type {
  CompanyBySiteKeyResolver,
  SellersReadRepository,
  WhatsappNumbersReadRepository,
} from "../../routes/public/publicDeps";

function sanitizePhoneToDigits(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

export function createSupabasePublicDeps(): {
  companyResolver: CompanyBySiteKeyResolver;
  sellersRepo: SellersReadRepository;
  whatsappNumbersRepo: WhatsappNumbersReadRepository;
} {
  return {
    companyResolver: {
      async resolveCompanyIdBySiteKey(siteKey: string) {
        const supabase = createSupabaseAdminClient();
        const { data, error } = await supabase
          .from("public_site_keys")
          .select("company_id")
          .eq("site_key", siteKey)
          .eq("active", true)
          .maybeSingle();

        if (error) return null;
        return data?.company_id ?? null;
      },
    },
    sellersRepo: {
      async listActiveSellers(companyId: string) {
        const supabase = createSupabaseAdminClient();

        const { data: sellers, error: sellersError } = await supabase
          .from("sellers")
          .select("id,name,active")
          .eq("company_id", companyId)
          .eq("active", true);

        if (sellersError || !sellers) {
          return [];
        }

        const { data: whatsappNumbers, error: waError } = await supabase
          .from("whatsapp_numbers")
          .select("seller_id,status")
          .eq("company_id", companyId)
          .eq("status", "active");

        if (waError || !whatsappNumbers) {
          return sellers.map((s) => ({
            id: s.id,
            name: s.name,
            active: Boolean(s.active),
            displayName: `${s.name} — Consultor`,
            whatsappAvailable: false,
          }));
        }

        const whatsappSellerIds = new Set(whatsappNumbers.map((w) => w.seller_id));

        return sellers.map((s) => ({
          id: s.id,
          name: s.name,
          active: Boolean(s.active),
          displayName: `${s.name} — Consultor`,
          whatsappAvailable: whatsappSellerIds.has(s.id),
        }));
      },

      async getSellerByIdAndCompanyId({ companyId, sellerId }) {
        const supabase = createSupabaseAdminClient();
        const { data, error } = await supabase
          .from("sellers")
          .select("id,company_id,name,active")
          .eq("company_id", companyId)
          .eq("id", sellerId)
          .maybeSingle();

        if (error || !data) return null;
        return {
          id: data.id,
          companyId: data.company_id,
          name: data.name,
          active: Boolean(data.active),
        };
      },
    },
    whatsappNumbersRepo: {
      async getActiveWhatsappNumberBySellerId({ companyId, sellerId }) {
        const supabase = createSupabaseAdminClient();
        const { data, error } = await supabase
          .from("whatsapp_numbers")
          .select("id,company_id,seller_id,phone_number,phone_number_id,status")
          .eq("company_id", companyId)
          .eq("seller_id", sellerId)
          .eq("status", "active")
          .limit(1)
          .maybeSingle();

        if (error || !data) return null;

        return {
          id: data.id,
          companyId: data.company_id,
          sellerId: data.seller_id,
          phoneNumber: sanitizePhoneToDigits(data.phone_number),
          phoneNumberId: data.phone_number_id,
          status: data.status,
        };
      },
    },
  };
}

