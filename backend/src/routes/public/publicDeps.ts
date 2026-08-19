export type PublicSeller = {
  id: string;
  name: string;
  displayName: string;
  whatsappAvailable: boolean;
};

export type PublicSellerRecord = {
  id: string;
  companyId: string;
  name: string;
  active: boolean;
};

export type PublicWhatsappNumberRecord = {
  id: string;
  companyId: string;
  sellerId: string;
  phoneNumber: string; // digits only
  phoneNumberId: string | null;
  status: string;
};

export interface CompanyBySiteKeyResolver {
  resolveCompanyIdBySiteKey(siteKey: string): Promise<string | null>;
}

export interface SellersReadRepository {
  listActiveSellers(companyId: string): Promise<
    Array<{ id: string; name: string; active: boolean; displayName?: string; whatsappAvailable: boolean }>
  >;
  getSellerByIdAndCompanyId(params: { companyId: string; sellerId: string }): Promise<PublicSellerRecord | null>;
}

export interface WhatsappNumbersReadRepository {
  getActiveWhatsappNumberBySellerId(params: {
    companyId: string;
    sellerId: string;
  }): Promise<PublicWhatsappNumberRecord | null>;
}

