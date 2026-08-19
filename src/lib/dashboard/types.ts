export type ConnectionStatus =
  | "PENDING"
  | "CONNECTING"
  | "CONNECTED"
  | "REAUTH_REQUIRED"
  | "DISCONNECTED"
  | "ERROR";

export type ConnectionRecord = {
  id: string;
  status: ConnectionStatus | string;
  companyId?: string;
  provider?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
};

export type SellerRecord = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  role?: string | null;
  active: boolean;
  avatar_url?: string | null;
};

export type WhatsAppNumberRecord = {
  id: string;
  seller_id: string | null;
  display_name: string;
  phone_number: string | null;
  phone_number_id?: string | null;
  business_account_id?: string | null;
  status: string;
  verified: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CompanyRecord = {
  id: string;
  name: string;
  slug?: string;
  status?: string;
  timezone?: string;
  created_at?: string;
  updated_at?: string;
};

export type UiConnectionPhase =
  | "NOT_CONNECTED"
  | "CONNECTING"
  | "CONNECTED"
  | "REAUTH_REQUIRED"
  | "ERROR";

export type StartConnectionResponse = {
  connectionId: string;
  embeddedSignupConfigId: string;
  state: string;
  expiresAt: string;
};
