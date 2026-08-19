import type { WhatsAppConnectionStatus } from "./providerTypes";

export type StartConnectionParams = {
  companyId: string;
  userId: string;
  provider: "meta";
  onboardingState: string;
  onboardingNonce: string;
  onboardingExpiresAt: Date;
};

export type ConnectionRecord = {
  id: string;
  companyId: string;
  status: WhatsAppConnectionStatus;
  provider: "meta";
  providerAccountId?: string | null;
  metadata?: Record<string, unknown>;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  onboardingState: string | null;
  onboardingNonce: string | null;
  onboardingExpiresAt: Date | null;
  onboardingCallbackConsumed: boolean;
};

export interface WhatsAppConnectionRepository {
  createConnection(params: StartConnectionParams): Promise<ConnectionRecord>;
  findActiveOnboardingConnection(companyId: string): Promise<ConnectionRecord | null>;
  findActiveConnectedConnection(companyId: string): Promise<ConnectionRecord | null>;
  expireStaleConnectingConnections(companyId: string): Promise<void>;
  getConnectionByCompanyAndOnboardingState(params: {
    companyId: string;
    onboardingState: string;
  }): Promise<ConnectionRecord | null>;
  getConnectionByIdAndCompany(params: { connectionId: string; companyId: string }): Promise<ConnectionRecord | null>;
  markCallbackConsumed(connectionId: string): Promise<void>;
  tryMarkCallbackConsumed(connectionId: string): Promise<boolean>;
  setConnectionStatus(params: {
    connectionId: string;
    status: WhatsAppConnectionStatus;
    providerAccountId?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<void>;
  upsertWhatsappNumber(params: {
    companyId: string;
    connectionId: string;
    sellerId?: string | null;
    phoneNumberId: string;
    displayName?: string | null;
    phoneNumber?: string | null;
    verified: boolean;
    status: "active" | "inactive";
    metadata?: Record<string, unknown>;
  }): Promise<void>;
  listConnections(companyId: string): Promise<ConnectionRecord[]>;
  listNumbers(companyId: string): Promise<
    Array<{
      id: string;
      connectionId: string | null;
      companyId: string;
      sellerId: string | null;
      phoneNumberId: string | null;
      displayName: string;
      phoneNumber: string | null;
      status: string;
      verified: boolean;
    }>
  >;
  disconnectConnection(connectionId: string): Promise<void>;
}

